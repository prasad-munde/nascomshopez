import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ShopEZ ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="container py-5 text-center">
          <div className="card shadow-sm p-4 p-md-5 mx-auto border-0" style={{ maxWidth: '650px', background: '#fff' }}>
            <div className="text-danger fs-1 mb-2">⚠️</div>
            <h3 className="fw-bold mb-2">Something went wrong</h3>
            <p className="text-muted small mb-3">
              An unexpected error occurred while rendering the page.
            </p>
            <div className="p-3 bg-light text-start rounded-3 mb-4 font-mono small text-danger overflow-auto" style={{ maxHeight: '180px' }}>
              <strong>{this.state.error?.toString()}</strong>
              {this.state.errorInfo?.componentStack && (
                <pre className="mt-2 mb-0 text-muted" style={{ fontSize: '0.75rem' }}>
                  {this.state.errorInfo.componentStack}
                </pre>
              )}
            </div>
            <div className="d-flex justify-content-center gap-3">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => window.location.reload()}
              >
                Reload Page
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  localStorage.clear();
                  window.location.href = '/';
                }}
              >
                Clear Cache &amp; Go Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
