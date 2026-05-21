require('dotenv').config();
const express     = require('express');
const cors        = require('cors');
const helmet      = require('helmet');
const morgan      = require('morgan');
const rateLimit   = require('express-rate-limit');
const path        = require('path');

const connectDB      = require('./config/db');
const cvRoutes       = require('./routes/cv.routes');
const contactRoutes  = require('./routes/contact.routes');
const analyticsRoutes= require('./routes/analytics.routes');
const adminRoutes    = require('./routes/admin.routes');
const errorHandler   = require('./middleware/errorHandler');

// ─── Connect to MongoDB ───────────────────────────────────────────────────────
connectDB();

// ─── App ──────────────────────────────────────────────────────────────────────
const app = express();

// ─── Static files (Admin Dashboard) ──────────────────────────────────────────
app.use(express.static(path.join(__dirname, '../public'), {
  // Don't cache admin files during development
  etag: false,
  maxAge: 0,
}));

// ─── Security & Logging ───────────────────────────────────────────────────────
app.use(helmet({ contentSecurityPolicy: false }));  // CSP off for admin inline scripts
app.use(cors({ origin: '*' }));   // Tighten to your frontend URL in production
app.use(morgan('dev'));

// ─── Rate limiting ────────────────────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 100,
  message: { success: false, message: 'Too many requests, please slow down.' },
});
app.use('/api/', limiter);

// ─── Body Parsing ─────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/cv',        cvRoutes);
app.use('/api/contact',   contactRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/admin',     adminRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'CV API is running 🚀', env: process.env.NODE_ENV });
});

// 404
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// Global error handler (must be last)
app.use(errorHandler);

// ─── Start ────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
