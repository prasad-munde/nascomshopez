const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema(
  {
    banner: {
      type: [String],
      default: [
        'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=1200&q=80',
      ],
    },
    categories: {
      type: [String],
      default: ['T-Shirts', 'Shirts', 'Jeans', 'Footwear', 'Jackets', 'Accessories'],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Admin', adminSchema);
