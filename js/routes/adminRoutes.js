import express from 'express';
import pool from '../database.js';
import { createAdmin, adminLogin } from '../controllers/adminControllers.js';
import { verifyToken } from '../middleware/verifyToken.js';

const router = express.Router();

// -------------------
// Public routes
// -------------------
router.post('/create', createAdmin);
router.post('/login', adminLogin);

// -------------------
// Protected routes
// -------------------

// USERS
router.get('/users', verifyToken, async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT u.user_id, u.username, u.email, r.name AS role, u.created_at
      FROM user u
      JOIN role r ON u.role_id = r.role_id
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch users.' });
  }
});

// DELIVERIES (basic)
router.get('/deliveries', verifyToken, async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT delivery_id, bot_id, start_location, end_location, status, user_id, created_at
      FROM delivery
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch deliveries.' });
  }
});

// BOTS
router.get('/bots', verifyToken, async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT bot_id, status, battery_level, last_checkin
      FROM bot
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch bots.' });
  }
});

// LOGS
router.get('/logs', verifyToken, async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT log_id, bot_id, event_type, message, created_at
      FROM log
      ORDER BY created_at DESC
      LIMIT 200
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch logs.' });
  }
});

// LOCATIONS
router.get('/locations', verifyToken, async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT location_id, name, latitude, longitude, is_active
      FROM location
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch locations.' });
  }
});

// PATH EDGES (map connections)
router.get('/paths', verifyToken, async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT edge_id, from_id, to_id, distance, is_blocked
      FROM path_edge
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch path edges.' });
  }
});

// PATH HISTORY (movement logs)
router.get('/pathHistory', verifyToken, async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT history_id, delivery_id, sequence_order, location_id, timestamp
      FROM path_history
      ORDER BY timestamp DESC
      LIMIT 200
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch path history.' });
  }
});

// SENSOR REPORTS
router.get('/sensors', verifyToken, async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT sensor_id, bot_id, sensor_type, value, recorded_at
      FROM sensor
      ORDER BY recorded_at DESC
      LIMIT 200
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch sensors.' });
  }
});

// SERVO REPORTS
router.get('/servoReports', verifyToken, async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT report_id, bot_id, servo_id, action, executed_at
      FROM servo
      ORDER BY executed_at DESC
      LIMIT 200
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch servo reports.' });
  }
});

// DELIVERY REPORTS (joined with user + bot)
router.get('/deliveryReports', verifyToken, async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        d.delivery_id,
        u.username AS user,
        b.bot_id AS bot,
        b.status AS bot_status,
        b.battery_level,
        d.start_location,
        d.end_location,
        d.status AS delivery_status,
        d.created_at,
        d.started_at,
        d.completed_at
      FROM delivery d
      JOIN user u ON d.user_id = u.user_id
      JOIN bot b ON d.bot_id = b.bot_id
      ORDER BY d.created_at DESC
      LIMIT 200
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch delivery reports.' });
  }
});

// DELIVERY TRACKING (comprehensive join)
router.get('/deliveryTracking', verifyToken, async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        d.delivery_id,
        u.username AS user,
        b.bot_id AS bot,
        b.status AS bot_status,
        b.battery_level AS bot_battery,
        d.start_location,
        d.end_location,
        d.status AS delivery_status,
        s.action AS last_servo_action,
        s.executed_at AS last_servo_time,
        lg.event_type AS last_event_type,
        lg.message AS last_event_message,
        lg.created_at AS last_event_time,
        sn.sensor_type AS last_sensor_type,
        sn.value AS last_sensor_value,
        sn.recorded_at AS last_sensor_time,
        d.created_at,
        d.started_at,
        d.completed_at
      FROM delivery d
      JOIN user u ON d.user_id = u.user_id
      JOIN bot b ON d.bot_id = b.bot_id
      LEFT JOIN servo s ON s.bot_id = b.bot_id
        AND s.executed_at = (
          SELECT MAX(s2.executed_at)
          FROM servo s2
          WHERE s2.bot_id = b.bot_id
        )
      LEFT JOIN log lg ON lg.bot_id = b.bot_id
        AND lg.created_at = (
          SELECT MAX(l2.created_at)
          FROM log l2
          WHERE l2.bot_id = b.bot_id
        )
      LEFT JOIN sensor sn ON sn.bot_id = b.bot_id
        AND sn.recorded_at = (
          SELECT MAX(sn2.recorded_at)
          FROM sensor sn2
          WHERE sn2.bot_id = b.bot_id
        )
      ORDER BY d.created_at DESC
      LIMIT 200
    `);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching delivery tracking data:', err);
    res.status(500).json({ error: 'Failed to fetch delivery tracking data.' });
  }
});

export default router;
