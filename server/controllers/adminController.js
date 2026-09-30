const User = require('../models/User');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Admin = require('../models/Admin');

// @desc    Get all users (Admin)
// @route   GET /api/admin/users
const getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error fetching users' });
  }
};

// @desc    Get all orders (Admin)
// @route   GET /api/admin/orders
const getOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('userId', 'username email')
      .populate('items.productId')
      .populate('productId')
      .sort({ createdAt: -1 });

    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error fetching all orders' });
  }
};

// @desc    Update order status (Admin)
// @route   PUT /api/admin/orders/:id
const updateOrderStatus = async (req, res) => {
  try {
    const { orderStatus } = req.body;

    const allowedStatuses = ['Order Placed', 'Shipped', 'Delivered', 'Cancelled'];
    if (!allowedStatuses.includes(orderStatus)) {
      return res.status(400).json({ message: 'Invalid order status value' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.orderStatus = orderStatus;
    await order.save();

    res.status(200).json({ message: 'Order status updated successfully', order });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error updating order status' });
  }
};

// @desc    Get Admin Dashboard Stats (Admin)
// @route   GET /api/admin/stats
const getAdminStats = async (req, res) => {
  try {
    const [totalUsers, totalProducts, totalOrders, orders] = await Promise.all([
      User.countDocuments({ userType: 'USER' }),
      Product.countDocuments(),
      Order.countDocuments(),
      Order.find().select('totalAmount orderStatus'),
    ]);

    let totalRevenue = 0;
    const statusCounts = {
      'Order Placed': 0,
      'Shipped': 0,
      'Delivered': 0,
      'Cancelled': 0,
    };

    orders.forEach((o) => {
      if (o.orderStatus !== 'Cancelled') {
        totalRevenue += o.totalAmount || 0;
      }
      if (statusCounts[o.orderStatus] !== undefined) {
        statusCounts[o.orderStatus]++;
      }
    });

    res.status(200).json({
      totalUsers,
      totalProducts,
      totalOrders,
      totalRevenue: Math.round(totalRevenue),
      statusCounts,
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error fetching admin stats' });
  }
};

// @desc    Get Admin Config (banner & categories)
// @route   GET /api/admin/config
const getAdminConfig = async (req, res) => {
  try {
    let admin = await Admin.findOne();
    if (!admin) {
      admin = await Admin.create({
        banner: [
          'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=1200&q=80',
        ],
        categories: ['T-Shirts', 'Shirts', 'Jeans', 'Footwear', 'Jackets', 'Accessories'],
      });
    }
    res.status(200).json(admin);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error fetching config' });
  }
};

module.exports = {
  getUsers,
  getOrders,
  updateOrderStatus,
  getAdminStats,
  getAdminConfig,
};
