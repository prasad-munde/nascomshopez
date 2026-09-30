const Product = require('../models/Product');

// @desc    Get all products (with search & filter)
// @route   GET /api/products
const getAllProducts = async (req, res) => {
  try {
    const { search, category, gender, sort } = req.query;

    const query = {};

    if (search) {
      query.$or = [
        { title: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    if (category && category !== 'All') {
      query.category = category;
    }

    if (gender && gender !== 'All') {
      query.gender = gender;
    }

    let productQuery = Product.find(query);

    if (sort === 'price-low') {
      productQuery = productQuery.sort({ price: 1 });
    } else if (sort === 'price-high') {
      productQuery = productQuery.sort({ price: -1 });
    } else if (sort === 'discount') {
      productQuery = productQuery.sort({ discount: -1 });
    } else {
      productQuery = productQuery.sort({ createdAt: -1 });
    }

    const products = await productQuery;

    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error fetching products' });
  }
};

// @desc    Get product by ID
// @route   GET /api/products/:id
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error fetching product details' });
  }
};

// @desc    Create a product (Admin)
// @route   POST /api/products
const createProduct = async (req, res) => {
  try {
    const { title, description, mainImg, sizes, category, gender, price, discount } = req.body;

    if (!title || !description || !mainImg || !price || !category) {
      return res.status(400).json({ message: 'Please provide title, description, mainImg, category and price' });
    }

    const product = await Product.create({
      title,
      description,
      mainImg,
      sizes: sizes && sizes.length > 0 ? sizes : ['S', 'M', 'L', 'XL'],
      category,
      gender: gender || 'Unisex',
      price: Number(price),
      discount: discount ? Number(discount) : 0,
    });

    res.status(201).json({ message: 'Product created successfully', product });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error creating product' });
  }
};

// @desc    Update a product (Admin)
// @route   PUT /api/products/:id
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ message: 'Product updated successfully', product: updatedProduct });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error updating product' });
  }
};

// @desc    Delete a product (Admin)
// @route   DELETE /api/products/:id
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    await Product.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error deleting product' });
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
