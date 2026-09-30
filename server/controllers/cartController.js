const Cart = require('../models/Cart');
const Product = require('../models/Product');

// @desc    Get current user's cart
// @route   GET /api/cart
const getCart = async (req, res) => {
  try {
    const cartItems = await Cart.find({ userId: req.user._id })
      .populate('productId')
      .sort({ createdAt: -1 });

    // Calculate cart total summary
    let subtotal = 0;
    let totalDiscount = 0;

    const formattedItems = cartItems
      .filter((item) => item.productId) // ensure product wasn't deleted
      .map((item) => {
        const product = item.productId;
        const originalPrice = product.price * item.quantity;
        const discountAmount = product.discount ? (originalPrice * product.discount) / 100 : 0;
        const finalPrice = originalPrice - discountAmount;

        subtotal += originalPrice;
        totalDiscount += discountAmount;

        return {
          _id: item._id,
          productId: product._id,
          title: product.title,
          mainImg: product.mainImg,
          price: product.price,
          discount: product.discount,
          size: item.size,
          quantity: item.quantity,
          itemTotal: finalPrice,
        };
      });

    const total = subtotal - totalDiscount;

    res.status(200).json({
      items: formattedItems,
      count: formattedItems.reduce((acc, curr) => acc + curr.quantity, 0),
      subtotal: Math.round(subtotal),
      discount: Math.round(totalDiscount),
      total: Math.round(total),
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error fetching cart' });
  }
};

// @desc    Add product to cart
// @route   POST /api/cart
const addToCart = async (req, res) => {
  try {
    const { productId, size = 'M', quantity = 1 } = req.body;

    if (!productId) {
      return res.status(400).json({ message: 'Product ID is required' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if the same product with same size is already in cart
    let cartItem = await Cart.findOne({
      userId: req.user._id,
      productId,
      size,
    });

    if (cartItem) {
      cartItem.quantity += Number(quantity);
      await cartItem.save();
    } else {
      cartItem = await Cart.create({
        userId: req.user._id,
        productId,
        size,
        quantity: Number(quantity),
      });
    }

    res.status(200).json({ message: 'Item added to cart', cartItem });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error adding to cart' });
  }
};

// @desc    Update cart item quantity
// @route   PUT /api/cart/:id
const updateCartItem = async (req, res) => {
  try {
    const { quantity } = req.body;

    const cartItem = await Cart.findOne({ _id: req.params.id, userId: req.user._id });
    if (!cartItem) {
      return res.status(404).json({ message: 'Cart item not found' });
    }

    if (quantity <= 0) {
      await Cart.findByIdAndDelete(cartItem._id);
      return res.status(200).json({ message: 'Item removed from cart' });
    }

    cartItem.quantity = Number(quantity);
    await cartItem.save();

    res.status(200).json({ message: 'Cart updated', cartItem });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error updating cart item' });
  }
};

// @desc    Remove an item from cart
// @route   DELETE /api/cart/:id
const removeCartItem = async (req, res) => {
  try {
    const cartItem = await Cart.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!cartItem) {
      return res.status(404).json({ message: 'Cart item not found' });
    }

    res.status(200).json({ message: 'Item removed from cart' });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error removing item from cart' });
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
};
