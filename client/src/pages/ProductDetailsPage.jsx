import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { productService } from '../services/productService';
import { useCart } from '../context/CartContext';
import { useAuth } from '../hooks/useAuth';

const ProductDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [btnLoading, setBtnLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await productService.getProductById(id);
        setProduct(data);
        if (data.sizes && data.sizes.length > 0) {
          setSelectedSize(data.sizes[0]);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Product not found.');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      setBtnLoading(true);
      setFeedback(null);
      await addToCart(product._id, selectedSize, quantity);
      setFeedback({ type: 'success', text: `Added ${quantity} item(s) (Size: ${selectedSize}) to cart!` });
    } catch (err) {
      setFeedback({ type: 'danger', text: err.message || 'Failed to add to cart' });
    } finally {
      setBtnLoading(false);
    }
  };

  const handleBuyNow = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      setBtnLoading(true);
      await addToCart(product._id, selectedSize, quantity);
      navigate('/checkout');
    } catch (err) {
      setFeedback({ type: 'danger', text: err.message || 'Failed to proceed to checkout' });
      setBtnLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container text-center py-5">
        <div className="spinner-border text-warning" role="status">
          <span className="visually-hidden">Loading product...</span>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container py-5 text-center">
        <div className="alert alert-danger d-inline-block px-5 py-4 shadow-sm">
          <h4>Product Error</h4>
          <p className="mb-3">{error || 'Unable to display product.'}</p>
          <Link to="/products" className="btn btn-warning fw-semibold">
            &larr; Back to Products
          </Link>
        </div>
      </div>
    );
  }

  const discountedPrice = product.discount
    ? Math.round(product.price * (1 - product.discount / 100))
    : product.price;

  return (
    <div className="container py-4">
      {/* Breadcrumb */}
      <nav aria-label="breadcrumb" className="mb-4">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <Link to="/" className="text-decoration-none">Home</Link>
          </li>
          <li className="breadcrumb-item">
            <Link to="/products" className="text-decoration-none">Products</Link>
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            {product.title}
          </li>
        </ol>
      </nav>

      {feedback && (
        <div className={`alert alert-${feedback.type} alert-dismissible fade show`} role="alert">
          {feedback.text}
          <button
            type="button"
            className="btn-close"
            onClick={() => setFeedback(null)}
          ></button>
        </div>
      )}

      <div className="row g-5">
        {/* Product Image Column */}
        <div className="col-lg-6">
          <div className="card border-0 shadow-sm overflow-hidden rounded-4">
            <img
              src={product.mainImg}
              alt={product.title}
              className="w-100"
              style={{ maxHeight: '500px', objectFit: 'cover' }}
            />
          </div>
        </div>

        {/* Product Info & Actions Column */}
        <div className="col-lg-6">
          <div className="d-flex align-items-center gap-2 mb-2">
            <span className="badge bg-secondary">{product.category}</span>
            <span className="badge bg-light text-dark border">{product.gender}</span>
          </div>

          <h2 className="fw-bold mb-3">{product.title}</h2>

          {/* Pricing */}
          <div className="d-flex align-items-center gap-3 mb-4">
            <span className="display-6 fw-bold text-dark">₹{discountedPrice}</span>
            {product.discount > 0 && (
              <>
                <span className="fs-5 text-muted text-decoration-line-through">
                  ₹{product.price}
                </span>
                <span className="badge bg-danger fs-6 px-3 py-2">
                  {product.discount}% OFF
                </span>
              </>
            )}
          </div>

          <hr />

          {/* Description */}
          <div className="mb-4">
            <h6 className="fw-bold text-uppercase text-muted small">Description</h6>
            <p className="text-secondary leading-relaxed">{product.description}</p>
          </div>

          {/* Available Sizes */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="mb-4">
              <label className="fw-bold text-uppercase text-muted small d-block mb-2">
                Select Size
              </label>
              <div className="d-flex flex-wrap gap-2">
                {product.sizes.map((s) => (
                  <button
                    key={s}
                    type="button"
                    className={`btn px-3 py-2 fw-semibold ${
                      selectedSize === s
                        ? 'btn-dark text-white'
                        : 'btn-outline-secondary'
                    }`}
                    onClick={() => setSelectedSize(s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity Selector */}
          <div className="mb-4">
            <label className="fw-bold text-uppercase text-muted small d-block mb-2">
              Quantity
            </label>
            <div className="input-group" style={{ maxWidth: '140px' }}>
              <button
                className="btn btn-outline-secondary"
                type="button"
                onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
              >
                -
              </button>
              <input
                type="text"
                className="form-control text-center fw-bold"
                value={quantity}
                readOnly
              />
              <button
                className="btn btn-outline-secondary"
                type="button"
                onClick={() => setQuantity((prev) => prev + 1)}
              >
                +
              </button>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="d-flex flex-column flex-sm-row gap-3 mt-4">
            <button
              className="btn btn-outline-dark btn-lg flex-fill fw-bold py-3"
              onClick={handleAddToCart}
              disabled={btnLoading}
            >
              🛒 Add to Cart
            </button>
            <button
              className="btn btn-warning btn-lg flex-fill fw-bold py-3 text-dark"
              onClick={handleBuyNow}
              disabled={btnLoading}
            >
              ⚡ Buy Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsPage;
