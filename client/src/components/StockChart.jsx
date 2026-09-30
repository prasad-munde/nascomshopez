import React, { useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const StockChart = ({ historicalPrices = [], symbol = '', isPositive = true }) => {
  const [timeframe, setTimeframe] = useState('1M'); // '1W', '1M', 'ALL'

  if (!historicalPrices || historicalPrices.length === 0) {
    return (
      <div className="d-flex align-items-center justify-content-center p-5 text-muted bg-light rounded-3">
        No historical price data available.
      </div>
    );
  }

  // Slice historical data according to timeframe
  let filteredData = [...historicalPrices];
  if (timeframe === '1W') {
    filteredData = historicalPrices.slice(-7);
  } else if (timeframe === '1M') {
    filteredData = historicalPrices.slice(-30);
  }

  const primaryColor = isPositive ? 'rgba(16, 185, 129, 1)' : 'rgba(239, 68, 68, 1)';
  const bgGradientColor = isPositive ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)';

  const labels = filteredData.map((item) => {
    const d = new Date(item.date);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  });

  const prices = filteredData.map((item) => item.price);

  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const padding = (maxPrice - minPrice) * 0.08 || 1;

  const chartData = {
    labels,
    datasets: [
      {
        fill: true,
        label: `${symbol} Price ($)`,
        data: prices,
        borderColor: primaryColor,
        backgroundColor: bgGradientColor,
        borderWidth: 2.2,
        pointRadius: filteredData.length <= 15 ? 4 : 0,
        pointHoverRadius: 6,
        pointBackgroundColor: primaryColor,
        tension: 0.25,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: '#0f172a',
        titleFont: { family: "'Plus Jakarta Sans', sans-serif", size: 12 },
        bodyFont: { family: "'JetBrains Mono', monospace", size: 14, weight: 'bold' },
        padding: 10,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          label: (context) => `$${context.parsed.y.toFixed(2)}`,
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: { family: "'Plus Jakarta Sans', sans-serif", size: 11 },
          color: '#94a3b8',
          maxTicksLimit: 8,
        },
      },
      y: {
        min: Math.floor(minPrice - padding),
        max: Math.ceil(maxPrice + padding),
        grid: {
          color: 'rgba(226, 232, 240, 0.6)',
        },
        ticks: {
          font: { family: "'JetBrains Mono', monospace", size: 11 },
          color: '#94a3b8',
          callback: (value) => `$${value}`,
        },
      },
    },
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="fw-semibold text-muted small">
          Price History ({timeframe === 'ALL' ? 'Full' : timeframe})
        </div>
        <div className="btn-group btn-group-sm" role="group">
          {['1W', '1M', 'ALL'].map((tf) => (
            <button
              key={tf}
              type="button"
              className={`btn btn-sm ${
                timeframe === tf ? 'btn-primary' : 'btn-outline-secondary'
              }`}
              onClick={() => setTimeframe(tf)}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>
      <div style={{ height: '320px', width: '100%' }}>
        <Line data={chartData} options={chartOptions} />
      </div>
    </div>
  );
};

export default StockChart;
