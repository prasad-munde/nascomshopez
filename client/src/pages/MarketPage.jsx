import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const MarketPage = () => {
  const navigate = useNavigate();
  useEffect(() => {
    navigate('/products', { replace: true });
  }, [navigate]);
  return null;
};

export default MarketPage;
