import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productService } from '../services/productService';
import { adminService } from '../services/adminService';
import ProductCard from '../components/ProductCard';

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [banner, setBanner] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        setLoading(true);
        const [prodData, configData] = await Promise.all([
          productService.getAllProducts(),
          adminService.getConfig().catch(() => ({
            banner: [
              'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80',
            ],
            categories: ['T-Shirts', 'Shirts', 'Jeans', 'Footwear', 'Jackets'],
          })),
        ]);

        setProducts(prodData || []);
        if (configData) {
          setCategories(configData.categories || ['T-Shirts', 'Shirts', 'Jeans', 'Footwear', 'Jackets']);
          setBanner(configData.banner || []);
        }
      } catch (err) {
        console.error('Error loading homepage data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadHomeData();
  }, []);

  return (
    <div className="pb-5">
      {/* Hero Banner */}
      <section className="bg-dark text-white py-5 position-relative overflow-hidden mb-5">
        <div className="container py-4">
          <div className="row align-items-center">
            <div className="col-lg-6 mb-4 mb-lg-0">
              <span className="badge bg-warning text-dark px-3 py-2 fs-6 mb-3 fw-bold">
                🎉 Great College E-Commerce Deals
              </span>
              <h1 className="display-4 fw-bold mb-3">
                Discover Trending Fashion at <span className="text-warning">ShopEZ</span>
              </h1>
              <p className="lead text-light text-opacity-75 mb-4">
                Explore premium apparel, footwear, and accessories with instant simulated checkout, reliable order tracking, and high discounts.
              </p>
              <div className="d-flex gap-3">
                <Link to="/products" className="btn btn-warning btn-lg fw-bold px-4">
                  Shop Now 🛍️
                </Link>
                <Link to="/login" className="btn btn-outline-light btn-lg px-4">
                  Demo Sign In
                </Link>
              </div>
            </div>
            <div className="col-lg-6 text-center">
              <img
                src={
                  banner[0] ||
                  'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80'
                }
                alt="ShopEZ Fashion Banner"
                className="img-fluid rounded-4 shadow-lg"
                style={{ maxHeight: '380px', width: '100%', objectFit: 'cover' }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Feature highlights */}
      <div className="container mb-5">
        <div className="row g-4 text-center">
          <div className="col-6 col-md-3">
            <div className="p-3 bg-light rounded-3 border">
              <div className="fs-2 mb-2">🚚</div>
              <h6 className="fw-bold mb-1">Fast Delivery</h6>
              <p className="text-muted small mb-0">Delivered within 5 business days</p>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="p-3 bg-light rounded-3 border">
              <div className="fs-2 mb-2">🛡️</div>
              <h6 className="fw-bold mb-1">Simulated Payments</h6>
              <p className="text-muted small mb-0">Safe Cash on Delivery & Virtual Pay</p>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="p-3 bg-light rounded-3 border">
              <div className="fs-2 mb-2">🔄</div>
              <h6 className="fw-bold mb-1">Easy Exchanges</h6>
              <p className="text-muted small mb-0">Hassle-free student friendly returns</p>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="p-3 bg-light rounded-3 border">
              <div className="fs-2 mb-2">🏷️</div>
              <h6 className="fw-bold mb-1">Best Discounts</h6>
              <p className="text-muted small mb-0">Up to 35% off on trending clothes</p>
            </div>
          </div>
        </div>
      </div>

      {/* Categories Section */}
      <div className="container mb-5">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h3 className="fw-bold mb-0">Shop by Category</h3>
          <Link to="/products" className="text-decoration-none fw-semibold text-warning">
            View All &rarr;
          </Link>
        </div>
        <div className="row g-3">
          {categories.map((cat, idx) => (
            <div className="col-6 col-sm-4 col-md-3 col-lg-2" key={idx}>
              <Link
                to={`/products?category=${encodeURIComponent(cat)}`}
                className="card text-center p-3 h-100 text-decoration-none border shadow-sm category-card text-dark"
              >
                <div className="fs-1 mb-2">
                  {cat === 'T-Shirts'
                    ? '👕'
                    : cat === 'Shirts'
                    ? '👔'
                    : cat === 'Jeans'
                    ? '👖'
                    : cat === 'Footwear'
                    ? '👟'
                    : cat === 'Jackets'
                    ? '🧥'
                    : cat === 'Dresses'
                    ? '👗'
                    : '🎒'}
                </div>
                <span className="fw-semibold small">{cat}</span>
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Featured Products */}
      <div className="container">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h3 className="fw-bold mb-1">Featured Products</h3>
            <p className="text-muted small mb-0">Curated trending styles for your daily wardrobe</p>
          </div>
          <Link to="/products" className="btn btn-outline-dark btn-sm fw-semibold">
            See All Products
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-warning" role="status">
              <span className="visually-hidden">Loading products...</span>
            </div>
          </div>
        ) : products.length === 0 ? (
          <div className="alert alert-info text-center">No products available at this time.</div>
        ) : (
          <div className="row g-4">
            {products.slice(0, 8).map((prod) => (
              <div className="col-12 col-sm-6 col-md-4 col-lg-3" key={prod._id}>
                <ProductCard product={prod} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
