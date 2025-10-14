import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import adminRoutes from './js/routes/adminRoutes.js';

dotenv.config();
console.log("JWT Secret loaded?", !!process.env.JWT_SECRET);

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(express.json());
app.use(cookieParser());

// 👇 Move logger up to catch *all* requests
app.use((req, res, next) => {
  console.log(`➡️ ${req.method} ${req.url}`);
  next();
});

// 👇 Static files (frontend)
const publicPath = path.join(__dirname, 'public');
console.log('Serving static files from:', publicPath);
app.use(express.static(publicPath));

// 👇 Explicitly send index.html for root
app.get('/', (req, res) => {
  res.sendFile(path.join(publicPath, 'index.html'));
});

// 👇 API routes
app.use('/api/admin', adminRoutes);

// Start server
const PORT = process.env.PORT || 4000; // ✅ try 4000 in case 3000 is blocked
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
