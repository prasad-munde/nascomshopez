import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-dark text-light py-4 mt-auto border-top border-secondary border-opacity-25">
      <div className="container">
        <div className="row align-items-center gy-3">
          <div className="col-md-6 text-center text-md-start">
            <div className="d-flex align-items-center justify-content-center justify-content-md-start gap-2 mb-1">
              <span className="fs-5">🛍️</span>
              <span className="fw-bold text-warning fs-5">ShopEZ</span>
              <span className="badge bg-secondary text-light px-2" style={{ fontSize: '0.65rem' }}>
                Academic MERN
              </span>
            </div>
            <p className="text-muted small mb-0">
              A clean, functional MERN stack e-commerce web platform built for college project submission.
            </p>
          </div>

          <div className="col-md-6 text-center text-md-end">
            <div className="d-flex justify-content-center justify-content-md-end gap-3 small mb-2">
              <Link to="/" className="text-decoration-none text-light opacity-75">
                Home
              </Link>
              <Link to="/products" className="text-decoration-none text-light opacity-75">
                Products
              </Link>
              <Link to="/cart" className="text-decoration-none text-light opacity-75">
                Cart
              </Link>
              <Link to="/login" className="text-decoration-none text-light opacity-75">
                Sign In
              </Link>
            </div>
            <div className="text-muted small">
              &copy; {new Date().getFullYear()} ShopEZ. All rights reserved.
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
