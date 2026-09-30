const portfolioService = require('../services/portfolioService');

// @desc    Get current user's portfolio and holdings
// @route   GET /api/portfolio
// @access  Private
const getPortfolio = async (req, res, next) => {
  try {
    const portfolio = await portfolioService.getUserPortfolio(req.user._id);

    res.status(200).json({
      success: true,
      data: portfolio,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPortfolio,
};

