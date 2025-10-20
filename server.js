import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import adminRoutes from './js/routes/adminRoutes.js';
import { verifyToken } from './js/middleware/verifyToken.js';
import { adminLogout } from './js/controllers/adminControllers.js';

dotenv.config();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(express.json());
app.use(cookieParser());

// Logger
app.use((req, res, next) => {
  console.log(`➡️ ${req.method} ${req.url}`);
  next();
});

// Static files
const publicPath = path.join(__dirname, 'public');
app.use(express.static(publicPath));

// Root route
app.get('/', (req, res) => {
  res.sendFile(path.join(publicPath, 'index.html'));
});

// Protected dashboard
app.get('/dashboard', verifyToken, (req, res) => {
  res.sendFile(path.join(publicPath, 'dashboard.html'));
});

// Logout
app.post('/api/admin/logout', adminLogout);

// API routes
app.use('/api/admin', adminRoutes);

// Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
