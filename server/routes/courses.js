import { Router } from 'express';
import pool from '../db/connection.js';

const router = Router();

// POST /api/courses – Create a new course
router.post('/', async (req, res) => {
  try {
    const { title } = req.body;
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const userId = 1; // Default user for MVP
    const [result] = await pool.execute(
      'INSERT INTO courses (user_id, title) VALUES (?, ?)',
      [userId, title]
    );

    res.status(201).json({
      id: result.insertId,
      user_id: userId,
      title,
      created_at: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Error creating course:', err);
    res.status(500).json({ error: 'Failed to create course' });
  }
});

// GET /api/courses – List all courses with progress
router.get('/', async (req, res) => {
  try {
    const [courses] = await pool.execute(`
      SELECT 
        c.id, c.title, c.created_at,
        COUNT(CASE WHEN n.type = 'file' THEN 1 END) AS total_lessons,
        COUNT(CASE WHEN n.type = 'file' AND n.completed = true THEN 1 END) AS completed_lessons
      FROM courses c
      LEFT JOIN nodes n ON n.course_id = c.id
      WHERE c.user_id = 1
      GROUP BY c.id
      ORDER BY c.created_at DESC
    `);

    const result = courses.map((c) => ({
      ...c,
      progress:
        c.total_lessons > 0
          ? Math.round((c.completed_lessons / c.total_lessons) * 100)
          : 0,
    }));

    res.json(result);
  } catch (err) {
    console.error('Error listing courses:', err);
    res.status(500).json({ error: 'Failed to list courses' });
  }
});

// GET /api/courses/:id – Get course details with progress
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT 
        c.id, c.title, c.created_at,
        COUNT(CASE WHEN n.type = 'file' THEN 1 END) AS total_lessons,
        COUNT(CASE WHEN n.type = 'file' AND n.completed = true THEN 1 END) AS completed_lessons
      FROM courses c
      LEFT JOIN nodes n ON n.course_id = c.id
      WHERE c.id = ?
      GROUP BY c.id`,
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Course not found' });
    }

    const course = rows[0];
    course.progress =
      course.total_lessons > 0
        ? Math.round((course.completed_lessons / course.total_lessons) * 100)
        : 0;

    res.json(course);
  } catch (err) {
    console.error('Error getting course:', err);
    res.status(500).json({ error: 'Failed to get course' });
  }
});

// DELETE /api/courses/:id – Delete a course (cascades to nodes)
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await pool.execute('DELETE FROM courses WHERE id = ?', [
      req.params.id,
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Course not found' });
    }

    res.json({ message: 'Course deleted successfully' });
  } catch (err) {
    console.error('Error deleting course:', err);
    res.status(500).json({ error: 'Failed to delete course' });
  }
});

export default router;
