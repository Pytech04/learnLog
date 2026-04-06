import { Router } from 'express';
import multer from 'multer';
import pool from '../db/connection.js';
import { authenticate } from '../middleware/auth.js';
import { uploadToS3 } from '../services/s3.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.use(authenticate);

/**
 * POST /api/upload
 * Accepts multipart form data with:
 *   - files: array of files
 *   - paths: JSON array of relative paths (webkitRelativePath)
 *   - classroomId: the classroom to attach files to
 * Only the classroom owner can upload.
 */
router.post('/', upload.array('files', 100), async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const { classroomId } = req.body;
    let paths = req.body.paths;

    if (!classroomId || !paths || !req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'classroomId, paths, and files are required' });
    }

    // Verify ownership
    const [classroom] = await connection.execute(
      'SELECT name, owner_id FROM classrooms WHERE id = ?',
      [classroomId]
    );

    if (classroom.length === 0) {
      return res.status(404).json({ error: 'Classroom not found' });
    }

    if (classroom[0].owner_id !== req.user.id) {
      return res.status(403).json({ error: 'Only the classroom owner can upload content' });
    }

    const classroomName = classroom[0].name;

    // Parse paths if sent as JSON string
    if (typeof paths === 'string') {
      paths = JSON.parse(paths);
    }

    await connection.beginTransaction();

    const folderMap = new Map();
    const results = [];

    // Optional: upload into a specific parent folder
    const baseParentId = req.body.parentId ? parseInt(req.body.parentId, 10) : null;

    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i];
      const relativePath = paths[i];
      const segments = relativePath.split('/').filter(Boolean);

      // Build folder hierarchy starting from baseParentId
      let parentId = baseParentId;

      for (let j = 0; j < segments.length - 1; j++) {
        const folderPath = segments.slice(0, j + 1).join('/');
        const folderName = segments[j];

        if (folderMap.has(folderPath)) {
          parentId = folderMap.get(folderPath);
        } else {
          const [existing] = await connection.execute(
            `SELECT id FROM nodes WHERE classroom_id = ? AND name = ? AND type = 'folder' AND ${
              parentId === null ? 'parent_id IS NULL' : 'parent_id = ?'
            }`,
            parentId === null
              ? [classroomId, folderName]
              : [classroomId, folderName, parentId]
          );

          if (existing.length > 0) {
            parentId = existing[0].id;
            folderMap.set(folderPath, parentId);
          } else {
            const [insertResult] = await connection.execute(
              'INSERT INTO nodes (classroom_id, name, type, parent_id) VALUES (?, ?, ?, ?)',
              [classroomId, folderName, 'folder', parentId]
            );
            parentId = insertResult.insertId;
            folderMap.set(folderPath, parentId);
          }
        }
      }

      // Upload file to S3
      const fileName = segments[segments.length - 1];
      const s3Key = `classrooms/${req.user.id}/${classroomName}/${relativePath}`;

      let resourceUrl = null;
      try {
        resourceUrl = await uploadToS3(file.buffer, s3Key, file.mimetype);
      } catch (s3Err) {
        console.warn(`⚠️  S3 upload failed for ${fileName}:`, s3Err.message);
        resourceUrl = null;
      }

      // Insert file node
      const [fileResult] = await connection.execute(
        'INSERT INTO nodes (classroom_id, name, type, parent_id, resource_url) VALUES (?, ?, ?, ?, ?)',
        [classroomId, fileName, 'file', parentId, resourceUrl]
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
