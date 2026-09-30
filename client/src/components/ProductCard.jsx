import React from 'react';
import { Link } from 'react-router-dom';

const ProductCard = ({ product }) => {
  if (!product) return null;

  const discountedPrice = product.discount
    ? Math.round(product.price * (1 - product.discount / 100))
    : product.price;

  return (
    <div className="card h-100 shadow-sm border-0 product-card">
      <div className="position-relative overflow-hidden" style={{ height: '220px' }}>
        <img
          src={product.mainImg}
          alt={product.title}
          className="card-img-top w-100 h-100"
          style={{ objectFit: 'cover' }}
          loading="lazy"
        />
        {product.discount > 0 && (
          <span className="badge bg-danger position-absolute top-0 end-0 m-2 px-2 py-1">
            {product.discount}% OFF
          </span>
        )}
        {product.gender && (
          <span className="badge bg-secondary position-absolute top-0 start-0 m-2 px-2 py-1">
            {product.gender}
          </span>
        )}
      </div>

      <div className="card-body d-flex flex-column">
        <div className="text-muted small mb-1">{product.category}</div>
        <h6 className="card-title text-truncate fw-bold mb-2" title={product.title}>
          {product.title}
        </h6>

        <div className="d-flex align-items-baseline gap-2 mb-3 mt-auto">
          <span className="fs-5 fw-bold text-dark">₹{discountedPrice}</span>
          {product.discount > 0 && (
            <span className="text-muted text-decoration-line-through small">
              ₹{product.price}
            </span>
          )}
        </div>

        <Link to={`/products/${product._id}`} className="btn btn-warning w-100 fw-semibold">
          Shop Now
        </Link>
      </div>
    </div>
  );
};

export default ProductCard;
