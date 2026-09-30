const express = require('express');
const router = express.Router();
const { buyStock, sellStock } = require('../controllers/tradeController');
const { protect } = require('../middleware/authMiddleware');
const { tradeLimiter } = require('../middleware/rateLimiter');

router.use(protect);

router.post('/buy', tradeLimiter, buyStock);
router.post('/sell', tradeLimiter, sellStock);

module.exports = router;
