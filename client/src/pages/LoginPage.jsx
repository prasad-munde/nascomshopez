import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { AlertMessage } from '../components/AlertMessage';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectPath = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please provide both email and password');
      return;
    }

    try {
      setLoading(true);
      const user = await login(email, password);
      if (user.userType === 'ADMIN' && !location.state?.from) {
        navigate('/admin');
      } else {
        navigate(redirectPath);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = (type) => {
    if (type === 'user') {
      setEmail('user@shopez.com');
      setPassword('user123');
    } else if (type === 'admin') {
      setEmail('admin@shopez.com');
      setPassword('admin123');
    }
    setError('');
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-5">
          <div className="card border-0 shadow-sm p-4 p-md-5">
            <div className="text-center mb-4">
              <span className="fs-1">🛍️</span>
              <h2 className="fw-bold mt-2">Welcome Back</h2>
              <p className="text-muted small">Sign in to your ShopEZ shopping account</p>
            </div>

            {error && <AlertMessage type="danger" message={error} onClose={() => setError('')} />}

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label fw-semibold small">Email Address</label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="mb-4">
                <label className="form-label fw-semibold small">Password</label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                className="btn btn-warning w-100 py-2 fw-bold text-dark shadow-sm mb-3"
                disabled={loading}
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </button>
            </form>

            {/* Quick Demo Autofill */}
            <div className="bg-light p-3 rounded-3 text-center mb-3">
              <div className="text-muted small fw-semibold mb-2">⚡ 1-Click Demo Logins</div>
              <div className="d-flex gap-2">
                <button
                  type="button"
                  className="btn btn-outline-dark btn-sm flex-grow-1"
                  onClick={() => handleFillDemo('user')}
                >
                  Demo User
                </button>
                <button
                  type="button"
                  className="btn btn-outline-warning text-dark btn-sm flex-grow-1"
                  onClick={() => handleFillDemo('admin')}
                >
                  Demo Admin
                </button>
              </div>
            </div>

            <div className="text-center small text-muted">
              Don't have an account?{' '}
              <Link to="/register" className="text-warning fw-bold text-decoration-none">
                Register Free
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
