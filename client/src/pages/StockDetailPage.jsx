import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const StockDetailPage = () => {
  const navigate = useNavigate();
  useEffect(() => {
    navigate('/products', { replace: true });
  }, [navigate]);
  return null;
};

export default StockDetailPage;
