const adminService = require('../services/adminService');

// @desc    Get all registered users
// @route   GET /api/admin/users
// @access  Private/Admin
const getUsers = async (req, res, next) => {
  try {
    const data = await adminService.getAllUsers(req.query);
    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle user active/deactivated status
// @route   PUT /api/admin/users/:id/status
// @access  Private/Admin
const updateUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const updatedUser = await adminService.toggleUserStatus(req.user._id, id, isActive);

    res.status(200).json({
      success: true,
      message: `User account ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get system-wide transactions
// @route   GET /api/admin/transactions
// @access  Private/Admin
const getAdminTransactions = async (req, res, next) => {
  try {
    const data = await adminService.getAllTransactions(req.query);
    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new stock
// @route   POST /api/admin/stocks
// @access  Private/Admin
const addStock = async (req, res, next) => {
  try {
    const { symbol, name, currentPrice, sector, description, marketCap, peRatio } = req.body;

    if (!symbol || !name || !currentPrice) {
      return res.status(400).json({
        success: false,
        message: 'Symbol, name, and currentPrice are required',
      });
    }

    const stock = await adminService.createStock(req.body);

    res.status(201).json({
      success: true,
      message: `Stock ${stock.symbol} created successfully`,
      data: stock,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update an existing stock
// @route   PUT /api/admin/stocks/:id
// @access  Private/Admin
const updateStock = async (req, res, next) => {
  try {
    const { id } = req.params;
    const stock = await adminService.updateStock(id, req.body);

    res.status(200).json({
      success: true,
      message: `Stock ${stock.symbol} updated successfully`,
      data: stock,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a stock
// @route   DELETE /api/admin/stocks/:id
// @access  Private/Admin
const removeStock = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await adminService.deleteStock(id);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get admin analytics overview
// @route   GET /api/admin/stats
// @access  Private/Admin
const getAdminAnalytics = async (req, res, next) => {
  try {
    const stats = await adminService.getAdminStats();
    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUsers,
  updateUserStatus,
  getAdminTransactions,
  addStock,
  updateStock,
  removeStock,
  getAdminAnalytics,
};
