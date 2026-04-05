import { Router } from 'express';
import pool from '../db/connection.js';

const router = Router();

// GET /api/nodes?courseId= – Get all nodes for a course
router.get('/', async (req, res) => {
  try {
    const { courseId } = req.query;
    if (!courseId) {
      return res.status(400).json({ error: 'courseId is required' });
    }

    const [nodes] = await pool.execute(
      'SELECT * FROM nodes WHERE course_id = ? ORDER BY type DESC, name ASC',
      [courseId]
    );

    res.json(nodes);
  } catch (err) {
    console.error('Error fetching nodes:', err);
    res.status(500).json({ error: 'Failed to fetch nodes' });
  }
});

// PUT /api/nodes/:id – Toggle completion status
router.put('/:id', async (req, res) => {
  try {
    const { completed } = req.body;
    if (typeof completed !== 'boolean') {
      return res.status(400).json({ error: 'completed (boolean) is required' });
    }

    const [result] = await pool.execute(
      'UPDATE nodes SET completed = ? WHERE id = ?',
      [completed, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Node not found' });
    }

    res.json({ message: 'Node updated successfully' });
  } catch (err) {
    console.error('Error updating node:', err);
    res.status(500).json({ error: 'Failed to update node' });
  }
});

// DELETE /api/nodes/:id
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await pool.execute('DELETE FROM nodes WHERE id = ?', [
      req.params.id,
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Node not found' });
    }

    res.json({ message: 'Node deleted successfully' });
  } catch (err) {
    console.error('Error deleting node:', err);
    res.status(500).json({ error: 'Failed to delete node' });
  }
});

export default router;
