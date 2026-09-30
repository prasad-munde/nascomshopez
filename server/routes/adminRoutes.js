const express = require('express');
const router = express.Router();
const {
  getUsers,
  getOrders,
  updateOrderStatus,
  getAdminStats,
  getAdminConfig,
} = require('../controllers/adminController');
const { auth, adminOnly } = require('../middleware/auth');

// All admin routes require authentication and ADMIN role
router.use(auth);
router.use(adminOnly);

router.get('/users', getUsers);
router.get('/orders', getOrders);
router.put('/orders/:id', updateOrderStatus);
router.get('/stats', getAdminStats);
router.get('/config', getAdminConfig);

module.exports = router;
