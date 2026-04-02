import { Router } from 'express';
import multer from 'multer';
import pool from '../db/connection.js';
import { uploadToS3 } from '../services/s3.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

/**
 * POST /api/upload
 * Accepts multipart form data with:
 *   - files: array of files
 *   - paths: JSON array of relative paths (webkitRelativePath)
 *   - courseId: the course to attach files to
 */
router.post('/', upload.array('files', 100), async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const { courseId } = req.body;
    let paths = req.body.paths;

    if (!courseId || !paths || !req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'courseId, paths, and files are required' });
    }

    // Parse paths if sent as JSON string
    if (typeof paths === 'string') {
      paths = JSON.parse(paths);
    }

    // Get course info for S3 key prefix
    const [courseRows] = await connection.execute(
      'SELECT title FROM courses WHERE id = ?',
      [courseId]
    );
    if (courseRows.length === 0) {
      return res.status(404).json({ error: 'Course not found' });
    }
    const courseTitle = courseRows[0].title;

    await connection.beginTransaction();

    // Track created folder nodes to avoid duplicates: path -> nodeId
    const folderMap = new Map();

    const results = [];

    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i];
      const relativePath = paths[i];

      // Split path into segments: e.g., "CourseName/Module1/lesson.mp4"
      const segments = relativePath.split('/').filter(Boolean);

      // Build folder hierarchy (all segments except the last one = file)
      let parentId = null;

      for (let j = 0; j < segments.length - 1; j++) {
        const folderPath = segments.slice(0, j + 1).join('/');
        const folderName = segments[j];

        if (folderMap.has(folderPath)) {
          parentId = folderMap.get(folderPath);
        } else {
          // Check if folder already exists in DB for this course + parent
          const [existing] = await connection.execute(
            `SELECT id FROM nodes WHERE course_id = ? AND name = ? AND type = 'folder' AND ${
              parentId === null ? 'parent_id IS NULL' : 'parent_id = ?'
            }`,
            parentId === null
              ? [courseId, folderName]
              : [courseId, folderName, parentId]
          );

          if (existing.length > 0) {
            parentId = existing[0].id;
            folderMap.set(folderPath, parentId);
          } else {
            const [insertResult] = await connection.execute(
              'INSERT INTO nodes (course_id, name, type, parent_id) VALUES (?, ?, ?, ?)',
              [courseId, folderName, 'folder', parentId]
            );
            parentId = insertResult.insertId;
            folderMap.set(folderPath, parentId);
          }
        }
      }

      // Upload file to S3
      const fileName = segments[segments.length - 1];
      const s3Key = `courses/1/${courseTitle}/${relativePath}`;

      let resourceUrl = null;
      try {
        resourceUrl = await uploadToS3(file.buffer, s3Key, file.mimetype);
      } catch (s3Err) {
        console.warn(`⚠️  S3 upload failed for ${fileName}:`, s3Err.message);
        // Continue without S3 URL; file metadata still saved
        resourceUrl = null;
      }

      // Insert file node
      const [fileResult] = await connection.execute(
        'INSERT INTO nodes (course_id, name, type, parent_id, resource_url) VALUES (?, ?, ?, ?, ?)',
        [courseId, fileName, 'file', parentId, resourceUrl]
      );

      results.push({
        id: fileResult.insertId,
        name: fileName,
        resource_url: resourceUrl,
      });
    }

    await connection.commit();

    res.status(201).json({
      message: `${results.length} file(s) uploaded successfully`,
      files: results,
    });
  } catch (err) {
    await connection.rollback();
    console.error('Error during upload:', err);
    res.status(500).json({ error: 'Upload failed' });
  } finally {
    connection.release();
  }
});

export default router;
