import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div className="container py-5 text-center my-auto">
      <div className="card shopez-card p-5 max-w-md mx-auto">
        <h1 className="display-1 fw-bold text-primary">404</h1>
        <h3 className="fw-bold mb-2">Page Not Found</h3>
        <p className="text-muted mb-4">
          The requested page or trading view does not exist.
        </p>
        <div>
          <Link to="/" className="btn btn-primary px-4">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
