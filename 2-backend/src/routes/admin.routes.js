const express  = require('express');
const router   = express.Router();
const { protect } = require('../middleware/auth');
const {
  login,
  getMessages, markRead, deleteMessage,
  updateCVItem, addCVItem, deleteCVItem,
} = require('../controllers/adminController');
const { getAnalytics } = require('../controllers/analyticsController');

// Public — login
router.post('/login', login);

// Everything below requires a valid JWT
router.use(protect);

// Messages
router.get('/messages',              getMessages);
router.patch('/messages/:id/read',   markRead);
router.delete('/messages/:id',       deleteMessage);

// Analytics
router.get('/analytics',             getAnalytics);

// CV sections (full CRUD)
router.post('/cv/:section',          addCVItem);
router.put('/cv/:section/:id',       updateCVItem);
router.delete('/cv/:section/:id',    deleteCVItem);

module.exports = router;
