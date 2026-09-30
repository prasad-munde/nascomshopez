const authService = require('../services/authService');
const User = require('../models/User');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email and password',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long',
      });
    }

    const result = await authService.registerUser({ name, email, password });

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const result = await authService.loginUser({ email, password });

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await authService.getUserProfile(req.user._id);

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reset user virtual balance (trading simulator utility)
// @route   POST /api/auth/reset-balance
// @access  Private
const resetBalance = async (req, res, next) => {
  try {
    const defaultBalance = Number(process.env.INITIAL_USER_BALANCE) || 100000;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { balance: defaultBalance },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: `Balance reset to $${defaultBalance.toLocaleString()}`,
      data: {
        balance: user.balance,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
  resetBalance,
};

