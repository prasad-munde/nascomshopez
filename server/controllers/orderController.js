const Order = require('../models/Order');
const Cart = require('../models/Cart');

// @desc    Place a new order
// @route   POST /api/orders
const createOrder = async (req, res) => {
  try {
    const {
      name,
      mobile,
      email,
      address,
      pincode,
      paymentMethod = 'Cash on Delivery',
      items,
      productId,
      size,
      quantity,
      price,
      discount,
      totalAmount,
    } = req.body;

    if (!name || !mobile || !email || !address || !pincode) {
      return res.status(400).json({ message: 'Please provide all shipping address details' });
    }

    // Determine items and total
    let orderItems = items || [];
    let calculatedTotal = totalAmount || 0;

    // If single direct product checkout (Buy Now)
    if ((!orderItems || orderItems.length === 0) && productId) {
      orderItems = [
        {
          productId,
          size: size || 'M',
          quantity: quantity || 1,
          price: price || 0,
          discount: discount || 0,
        },
      ];
      const itemPrice = (price || 0) * (quantity || 1);
      const discountAmt = discount ? (itemPrice * discount) / 100 : 0;
      calculatedTotal = itemPrice - discountAmt;
    }

    // Set delivery date to 5 days from today
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 5);

    const order = await Order.create({
      userId: req.user._id,
      items: orderItems,
      productId: productId || (orderItems[0] ? orderItems[0].productId : null),
      size: size || (orderItems[0] ? orderItems[0].size : 'M'),
      quantity: quantity || (orderItems[0] ? orderItems[0].quantity : 1),
      price: price || (orderItems[0] ? orderItems[0].price : 0),
      discount: discount || (orderItems[0] ? orderItems[0].discount : 0),
      totalAmount: Math.round(calculatedTotal),
      name,
      mobile,
      email,
      address,
      pincode,
      paymentMethod,
      orderDate: new Date(),
      deliveryDate,
      orderStatus: 'Order Placed',
    });

    // Clear user's cart after order is placed
    await Cart.deleteMany({ userId: req.user._id });

    res.status(201).json({
      message: 'Order placed successfully',
      order,
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error placing order' });
  }
};

// @desc    Get logged in user's orders
// @route   GET /api/orders
const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id })
      .populate('items.productId')
      .populate('productId')
      .sort({ createdAt: -1 });

    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error fetching orders' });
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, userId: req.user._id })
      .populate('items.productId')
      .populate('productId');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error fetching order details' });
  }
};

module.exports = {
  createOrder,
  getUserOrders,
  getOrderById,
};
