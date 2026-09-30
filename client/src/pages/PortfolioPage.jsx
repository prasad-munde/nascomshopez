import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const PortfolioPage = () => {
  const navigate = useNavigate();
  useEffect(() => {
    navigate('/orders', { replace: true });
  }, [navigate]);
  return null;
};

export default PortfolioPage;
