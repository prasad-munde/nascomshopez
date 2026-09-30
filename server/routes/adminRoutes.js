const express = require('express');
const router = express.Router();
const {
  getUsers,
  updateUserStatus,
  getAdminTransactions,
  addStock,
  updateStock,
  removeStock,
  getAdminAnalytics,
} = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// All admin routes require authentication and admin role
router.use(protect);
router.use(authorize('admin'));

router.get('/stats', getAdminAnalytics);
router.get('/users', getUsers);
router.put('/users/:id/status', updateUserStatus);
router.get('/transactions', getAdminTransactions);
router.post('/stocks', addStock);
router.put('/stocks/:id', updateStock);
router.delete('/stocks/:id', removeStock);

module.exports = router;
