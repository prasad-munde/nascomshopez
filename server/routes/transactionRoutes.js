const express = require('express');
const router = express.Router();
const { getUserTransactions } = require('../controllers/transactionController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getUserTransactions);

module.exports = router;

