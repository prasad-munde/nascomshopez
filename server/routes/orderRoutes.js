const express = require('express');
const router = express.Router();
const {
  createOrder,
  getUserOrders,
  getOrderById,
} = require('../controllers/orderController');
const { auth } = require('../middleware/auth');

// All order routes require user authentication
router.use(auth);

router.post('/', createOrder);
router.get('/', getUserOrders);
router.get('/:id', getOrderById);

module.exports = router;
