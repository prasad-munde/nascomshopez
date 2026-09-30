const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  title: String,
  mainImg: String,
  size: {
    type: String,
    default: 'M',
  },
  quantity: {
    type: Number,
    default: 1,
  },
  price: {
    type: Number,
    required: true,
  },
  discount: {
    type: Number,
    default: 0,
  },
});

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    items: [orderItemSchema],
    // Primary item fields for single-item order display
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
    },
    size: String,
    quantity: {
      type: Number,
      default: 1,
    },
    price: Number,
    discount: {
      type: Number,
      default: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    // Shipping Details
    name: {
      type: String,
      required: true,
    },
    mobile: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    pincode: {
      type: String,
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ['Cash on Delivery', 'Online Payment (simulated)', 'Online Payment'],
      default: 'Cash on Delivery',
    },
    orderDate: {
      type: Date,
      default: Date.now,
    },
    deliveryDate: {
      type: Date,
      default: () => new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from order
    },
    orderStatus: {
      type: String,
      enum: ['Order Placed', 'Shipped', 'Delivered', 'Cancelled'],
      default: 'Order Placed',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Order', orderSchema);
