import express from 'express';
import pool from '../database.js';
import { createAdmin, adminLogin } from '../controllers/adminControllers.js';
import { verifyToken } from '../middleware/verifyToken.js';


const router = express.Router();

// Public routes
router.post('/create', createAdmin);
router.post('/login', adminLogin);

// -------------------
// Protected routes
// -------------------
router.get('/users', verifyToken, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT user_id, username, email, role_id, created_at FROM user');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch users.' });
  }
});

router.get('/deliveries', verifyToken, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT delivery_id, bot_id, start_location, end_location, status, user_id, created_at
       FROM delivery`
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch deliveries.' });
  }
});

router.get('/bots', verifyToken, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT bot_id, status, battery_level, last_checkin FROM bot');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch bots.' });
  }
});

router.get('/logs', verifyToken, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT log_id, bot_id, event_type, message, created_at FROM log');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch logs.' });
  }
});

router.get('/locations', verifyToken, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT location_id, name, latitude, longitude, is_active FROM location');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch locations.' });
  }
});

export default router;
