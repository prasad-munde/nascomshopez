import React from 'react';

export const LoadingSpinner = ({ text = 'Loading data...' }) => (
  <div className="d-flex flex-column justify-content-center align-items-center py-5 text-center">
    <div className="spinner-border text-primary mb-3" role="status" style={{ width: '2.5rem', height: '2.5rem' }}>
      <span className="visually-hidden">Loading...</span>
    </div>
    <div className="text-muted fw-semibold">{text}</div>
  </div>
);

export default LoadingSpinner;
