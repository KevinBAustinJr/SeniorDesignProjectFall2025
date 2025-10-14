import bcrypt from 'bcrypt';
import pool from '../database.js';
import jwt from 'jsonwebtoken';

const SALT_ROUNDS = 12;

// -----------------------
// Helper functions
// -----------------------
const sanitize = str => String(str).replace(/[<>$"'`;]/g, '').trim();
const isValidEmail = email => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const isStrongPassword = pw => pw.length >= 8; // simple, can extend with regex

// -----------------------
// Create Admin Account
// -----------------------
export const createAdmin = async (req, res) => {
  try {
    const usernameRaw = req.body.username;
    const emailRaw = req.body.email;
    const password = req.body.password;

    // Sanitize inputs
    const username = sanitize(usernameRaw);
    const email = sanitize(emailRaw);

    // Validate inputs
    if (!username || username.length < 3)
      return res.status(400).json({ error: 'Invalid username.' });
    if (!isValidEmail(email))
      return res.status(400).json({ error: 'Invalid email.' });
    if (!isStrongPassword(password))
      return res.status(400).json({ error: 'Password too weak.' });

    // Check if admin with this email already exists
    const [existing] = await pool.query(
      `SELECT * FROM user WHERE email = ?`,
      [email]
    );

    if (existing.length) {
      return res.status(400).json({ error: 'Admin with this email already exists.' });
    }

    // Hash password
    const hashed = await bcrypt.hash(password, SALT_ROUNDS);

    // Insert admin into database
    const [result] = await pool.query(
      `INSERT INTO user (username, email, password_hash, role_id)
       VALUES (?, ?, ?, ?)`,
      [username, email, hashed, 1] // role_id = 1 for admin
    );

    res.status(201).json({
      message: 'Admin account created successfully.',
      adminId: result.insertId,
    });
  } catch (err) {
    console.error('Error creating admin:', err);
    res.status(500).json({ error: 'Failed to create admin account.',
    details: err.message    
    });
  }
};

// -----------------------
// Admin Login
// -----------------------
export const adminLogin = async (req, res) => {
  try {
    const emailRaw = req.body.email;
    const password = req.body.password;

    // Sanitize input
    const email = sanitize(emailRaw);

    // Validate input
    if (!isValidEmail(email))
      return res.status(400).json({ error: 'Invalid email.' });
    if (!isStrongPassword(password))
      return res.status(400).json({ error: 'Password too weak.' });

    // Fetch admin
    const [rows] = await pool.query(
      `SELECT user_id, username, password_hash, role_id
       FROM user
       WHERE email = ? AND role_id = 1`,
      [email]
    );

    if (!rows.length)
      return res.status(401).json({ error: 'Admin not found or unauthorized.' });

    const admin = rows[0];

    // Compare password
    const passwordMatch = await bcrypt.compare(password, admin.password_hash);
    if (!passwordMatch)
      return res.status(401).json({ error: 'Invalid password.' });

    // Generate JWT token
    const token = jwt.sign(
      { user_id: admin.user_id, role_id: admin.role_id },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({
      message: 'Admin login successful.',
      admin: {
        user_id: admin.user_id,
        username: admin.username,
        email,
      },
      token, // return JWT
    });
  } catch (err) {
    console.error('Admin login error:', err);
    res.status(500).json({ error: 'Server error during login.' });
  }
};
