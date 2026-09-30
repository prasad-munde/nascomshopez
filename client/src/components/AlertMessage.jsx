import React from 'react';

export const AlertMessage = ({ type = 'danger', message, onClose }) => {
  if (!message) return null;

  const iconClass =
    type === 'success'
      ? 'bi-check-circle-fill text-success'
      : type === 'warning'
      ? 'bi-exclamation-triangle-fill text-warning'
      : type === 'info'
      ? 'bi-info-circle-fill text-info'
      : 'bi-x-circle-fill text-danger';

  return (
    <div className={`alert alert-${type} alert-dismissible fade show d-flex align-items-center gap-2`} role="alert">
      <i className={`bi ${iconClass} fs-5`}></i>
      <div className="flex-grow-1">{message}</div>
      {onClose && (
        <button type="button" className="btn-close" aria-label="Close" onClick={onClose}></button>
      )}
    </div>
  );
};

export const LoadingSpinner = ({ text = 'Loading data...' }) => (
  <div className="d-flex flex-column justify-content-center align-items-center py-5 text-center">
    <div className="spinner-border text-primary mb-3" role="status" style={{ width: '2.5rem', height: '2.5rem' }}>
      <span className="visually-hidden">Loading...</span>
    </div>
    <div className="text-muted fw-semibold">{text}</div>
  </div>
);
