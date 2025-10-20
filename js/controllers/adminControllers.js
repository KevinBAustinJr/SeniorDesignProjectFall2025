import bcrypt from 'bcrypt';
import pool from '../database.js';
import jwt from 'jsonwebtoken';

const SALT_ROUNDS = 12;
const sanitize = str => String(str).replace(/[<>$"'`;]/g, '').trim();
const isValidEmail = email => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const isStrongPassword = pw => pw.length >= 8;

// Create admin
export const createAdmin = async (req, res) => {
  try {
    const username = sanitize(req.body.username);
    const email = sanitize(req.body.email);
    const password = req.body.password;

    if (!username || username.length < 3) return res.status(400).json({ error: 'Invalid username.' });
    if (!isValidEmail(email)) return res.status(400).json({ error: 'Invalid email.' });
    if (!isStrongPassword(password)) return res.status(400).json({ error: 'Password too weak.' });

    const [existing] = await pool.query(`SELECT * FROM user WHERE email = ?`, [email]);
    if (existing.length) return res.status(400).json({ error: 'Admin with this email already exists.' });

    const hashed = await bcrypt.hash(password, SALT_ROUNDS);
    const [result] = await pool.query(
      `INSERT INTO user (username, email, password_hash, role_id) VALUES (?, ?, ?, ?)`,
      [username, email, hashed, 1]
    );

    res.status(201).json({ message: 'Admin account created successfully.', adminId: result.insertId });
  } catch (err) {
    console.error('Error creating admin:', err);
    res.status(500).json({ error: 'Failed to create admin account.', details: err.message });
  }
};

// Login
export const adminLogin = async (req, res) => {
  try {
    const email = sanitize(req.body.email);
    const password = req.body.password;

    if (!isValidEmail(email)) return res.status(400).json({ error: 'Invalid email.' });
    if (!isStrongPassword(password)) return res.status(400).json({ error: 'Password too weak.' });

    const [rows] = await pool.query(
      `SELECT user_id, username, password_hash, role_id FROM user WHERE email = ? AND role_id = 1`,
      [email]
    );
    if (!rows.length) return res.status(401).json({ error: 'Admin not found or unauthorized.' });

    const admin = rows[0];
    const passwordMatch = await bcrypt.compare(password, admin.password_hash);
    if (!passwordMatch) return res.status(401).json({ error: 'Invalid password.' });

    const token = jwt.sign({ user_id: admin.user_id, role_id: admin.role_id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // HttpOnly cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: false, // false for localhost
      sameSite: 'Strict',
      maxAge: 3600000,
    });

    res.json({ message: 'Admin login successful.', admin: { user_id: admin.user_id, username: admin.username, email } });
  } catch (err) {
    console.error('Admin login error:', err);
    res.status(500).json({ error: 'Server error during login.' });
  }
};

// Logout
export const adminLogout = (req, res) => {
  res.clearCookie('token'); // clears the HttpOnly cookie
  res.json({ message: 'Logged out successfully.' });
};
