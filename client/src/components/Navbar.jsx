import React, { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout, resetBalance } = useAuth();
  const navigate = useNavigate();
  const [resetting, setResetting] = useState(false);
  const [navCollapsed, setNavCollapsed] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    setShowDropdown(false);
    logout();
    navigate('/login');
  };

  const handleResetBalance = async () => {
    if (window.confirm('Reset your virtual cash balance to $100,000?')) {
      try {
        setResetting(true);
        await resetBalance();
        setShowDropdown(false);
      } catch (err) {
        alert(err.message || 'Failed to reset balance');
      } finally {
        setResetting(false);
      }
    }
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark navbar-shopez sticky-top">
      <div className="container-fluid px-3 px-lg-4">
        <Link className="navbar-brand d-flex align-items-center me-4" to={isAuthenticated ? '/dashboard' : '/'}>
          <span className="me-2 fs-4">📈</span>
          <span className="navbar-brand-logo">ShopEZ</span>
          <span className="badge bg-primary-subtle text-primary border border-primary-subtle ms-2 px-2 py-1 fs-8 text-uppercase" style={{ fontSize: '0.65rem' }}>
            Sim Trader
          </span>
        </Link>

        {/* Pure React mobile menu toggle */}
        <button
          className="navbar-toggler border-0"
          type="button"
          onClick={() => setNavCollapsed(!navCollapsed)}
          aria-expanded={!navCollapsed}
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className={`collapse navbar-collapse ${navCollapsed ? '' : 'show'}`} id="navbarContent">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            {isAuthenticated ? (
              <>
                <li className="nav-item">
                  <NavLink
                    className="nav-link nav-link-custom"
                    to="/dashboard"
                    onClick={() => setNavCollapsed(true)}
                  >
                    <i className="bi bi-speedometer2 me-1"></i> Dashboard
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink
                    className="nav-link nav-link-custom"
                    to="/market"
                    onClick={() => setNavCollapsed(true)}
                  >
                    <i className="bi bi-graph-up-arrow me-1"></i> Market
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink
                    className="nav-link nav-link-custom"
                    to="/portfolio"
                    onClick={() => setNavCollapsed(true)}
                  >
                    <i className="bi bi-pie-chart-fill me-1"></i> Portfolio
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink
                    className="nav-link nav-link-custom"
                    to="/transactions"
                    onClick={() => setNavCollapsed(true)}
                  >
                    <i className="bi bi-clock-history me-1"></i> Orders
                  </NavLink>
                </li>
                {isAdmin && (
                  <li className="nav-item">
                    <NavLink
                      className="nav-link nav-link-custom text-warning"
                      to="/admin"
                      onClick={() => setNavCollapsed(true)}
                    >
                      <i className="bi bi-shield-lock-fill me-1"></i> Admin Panel
                    </NavLink>
                  </li>
                )}
              </>
            ) : (
              <li className="nav-item">
                <NavLink
                  className="nav-link nav-link-custom"
                  to="/market"
                  onClick={() => setNavCollapsed(true)}
                >
                  <i className="bi bi-graph-up me-1"></i> Explore Market
                </NavLink>
              </li>
            )}
          </ul>

          <div className="d-flex align-items-center gap-3">
            {isAuthenticated ? (
              <>
                {/* Virtual Cash Balance Indicator */}
                <div className="d-none d-md-flex align-items-center bg-dark bg-opacity-75 border border-secondary border-opacity-25 rounded-3 px-3 py-1 text-light">
                  <div className="me-2 text-muted" style={{ fontSize: '0.75rem', lineHeight: '1.2' }}>
                    VIRTUAL CASH
                  </div>
                  <span className="font-mono fw-bold text-success" style={{ fontSize: '1.05rem' }}>
                    ${user?.balance !== undefined ? user.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
                  </span>
                  <button
                    className="btn btn-link btn-sm text-secondary p-0 ms-2"
                    title="Reset virtual balance to $100,000"
                    onClick={handleResetBalance}
                    disabled={resetting}
                  >
                    <i className={`bi bi-arrow-clockwise ${resetting ? 'spin' : ''}`}></i>
                  </button>
                </div>

                {/* Pure React User Dropdown */}
                <div className="dropdown position-relative" ref={dropdownRef}>
                  <button
                    className="btn btn-outline-light btn-sm dropdown-toggle d-flex align-items-center gap-2 rounded-3 px-3 py-1"
                    type="button"
                    onClick={() => setShowDropdown(!showDropdown)}
                    aria-expanded={showDropdown}
                  >
                    <span
                      className="rounded-circle bg-primary text-white d-inline-flex justify-content-center align-items-center"
                      style={{ width: '24px', height: '24px', fontSize: '0.75rem' }}
                    >
                      {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </span>
                    <span className="fw-semibold text-truncate" style={{ maxWidth: '120px' }}>
                      {user?.name || 'User'}
                    </span>
                    {isAdmin && (
                      <span className="badge bg-warning text-dark ms-1" style={{ fontSize: '0.65rem' }}>
                        ADMIN
                      </span>
                    )}
                  </button>
                  <ul
                    className={`dropdown-menu dropdown-menu-end shadow-sm border-0 mt-2 ${showDropdown ? 'show' : ''}`}
                    style={{
                      display: showDropdown ? 'block' : 'none',
                      position: 'absolute',
                      right: 0,
                      top: '100%',
                    }}
                  >
                    <li className="px-3 py-2 border-bottom">
                      <div className="fw-bold">{user?.name}</div>
                      <div className="text-muted small">{user?.email}</div>
                    </li>
                    <li className="d-md-none px-3 py-2 border-bottom">
                      <div className="small text-muted">Virtual Balance</div>
                      <div className="fw-bold text-success font-mono">
                        ${user?.balance?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </div>
                    </li>
                    <li>
                      <Link
                        className="dropdown-item py-2"
                        to="/dashboard"
                        onClick={() => setShowDropdown(false)}
                      >
                        <i className="bi bi-speedometer2 me-2"></i> Dashboard
                      </Link>
                    </li>
                    <li>
                      <Link
                        className="dropdown-item py-2"
                        to="/portfolio"
                        onClick={() => setShowDropdown(false)}
                      >
                        <i className="bi bi-pie-chart me-2"></i> Portfolio
                      </Link>
                    </li>
                    {isAdmin && (
                      <li>
                        <Link
                          className="dropdown-item py-2 text-warning"
                          to="/admin"
                          onClick={() => setShowDropdown(false)}
                        >
                          <i className="bi bi-shield-check me-2"></i> Admin Center
                        </Link>
                      </li>
                    )}
                    <li>
                      <button className="dropdown-item py-2" onClick={handleResetBalance}>
                        <i className="bi bi-arrow-repeat me-2"></i> Reset Cash Balance
                      </button>
                    </li>
                    <li><hr className="dropdown-divider" /></li>
                    <li>
                      <button className="dropdown-item py-2 text-danger" onClick={handleLogout}>
                        <i className="bi bi-box-arrow-right me-2"></i> Log Out
                      </button>
                    </li>
                  </ul>
                </div>
              </>
            ) : (
              <div className="d-flex gap-2">
                <Link to="/login" className="btn btn-outline-light btn-sm px-3 fw-semibold rounded-2">
                  Sign In
                </Link>
                <Link to="/register" className="btn btn-primary btn-sm px-3 fw-semibold rounded-2">
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
