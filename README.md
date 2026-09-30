# 📈 ShopEZ — Stock Trading Simulation Platform

[![Node.js Version](https://img.shields.io/badge/node.js-18%2B-brightgreen.svg)](https://nodejs.org/)
[![Stack](https://img.shields.io/badge/stack-MERN-blue.svg)](https://www.mongodb.com/mern-stack)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

A production-quality **MERN full-stack stock trading simulation platform** called **ShopEZ**. ShopEZ allows users to experience real-time stock market dynamics, execute simulated buy and sell orders with virtual funds, analyze interactive historical charts, track portfolio profit/loss, and review complete transaction history with zero financial risk.

Includes a comprehensive **Admin Command Center** for managing registered users, cataloging securities, and auditing platform-wide trading activity.

---

## 🌟 Key Features

### 🔐 Authentication & Role-Based Access Control
- User registration and login secured with **JWT** (JSON Web Tokens) and **bcryptjs** (salted password hashing).
- Granular **Role-Based Authorization** (`USER` and `ADMIN`).
- Automatic allocation of **$100,000 in virtual capital** upon registration.
- Account status enforcement (instant suspension / activation controls).

### 📊 Real-Time Market & Interactive Analytics
- **Live Simulated Market Engine:** Realistic price fluctuation ticks based on market drift and sector volatility.
- **Search & Filter:** Search by symbol (e.g., `AAPL`, `NVDA`, `TSLA`) or company name, with sector filtering (Technology, Semiconductors, Financial Services, Automotive, Consumer Cyclical, etc.).
- **Interactive Price Charts:** Historical price line & area charts powered by **Chart.js** with customizable timeframes (`1W`, `1M`, `ALL`).
- Key financial indicators: Market Cap, 52-Week Range, Day Range, P/E Ratio, and Trading Volume.

### 💼 Trading Simulation & Order Execution
- **Instant Buy Orders:** Atomically checks available cash balance, calculates total order value, updates holdings, calculates weighted average cost basis, and logs transaction.
- **Instant Sell Orders:** Validates share ownership and quantity, calculates sale proceeds, credits user balance, updates holdings (removes if 0 shares remain), and logs transaction.
- **Atomic Reliability:** Safe operations designed to prevent negative balances or race conditions.
- Commission-free trading with preset quantity buttons (+1, +5, +10, +25, Max).

### 📈 Portfolio Tracking & Valuation
- Real-time **Net Worth** calculation: `Cash Balance + Total Value of Open Positions`.
- **Unrealized Profit & Loss:** Tracks P/L ($ and %) for individual holdings and the aggregate portfolio.
- **Asset Allocation Breakdown:** Visual allocation bar chart showing portfolio weight distribution.
- One-click **Reset Virtual Balance** utility for continuous trading experimentation.

### 🛡️ Admin Command Center
- **System Metrics:** Registered users, active accounts, listed securities, platform trade count, total volume, and aggregate liquid capital.
- **User Management:** Search users, inspect balances and roles, and suspend or activate accounts.
- **Stock Securities Management:** Add new stocks, update stock attributes/prices, and safely remove stocks.
- **Global Audit Stream:** Real-time monitoring feed of all buy/sell orders placed across the entire platform.

---

## 🏗️ Architecture

```text
nascom/
├── client/                     # Frontend React (Vite)
│   ├── public/
│   ├── src/
│   │   ├── components/         # Navbar, Footer, StockChart, StockCard, TradeModal, etc.
│   │   ├── context/            # AuthContext (state & session management)
│   │   ├── hooks/              # useAuth custom hook
│   │   ├── pages/              # Dashboard, Market, StockDetail, Portfolio, Admin, etc.
│   │   ├── routes/             # AppRoutes, ProtectedRoute, AdminRoute
│   │   ├── services/           # Axios API services (auth, stock, trade, portfolio, admin)
│   │   ├── App.jsx             # Root React component
│   │   ├── index.css           # Modern Fintech stylesheet
│   │   └── main.jsx            # Entry point
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── .env.example
│
├── server/                     # Backend API (Node.js + Express)
│   ├── config/
│   │   └── db.js               # MongoDB connection handler with retry logic
│   ├── controllers/            # auth, stock, trade, portfolio, transaction, admin
│   ├── middleware/             # authMiddleware, roleMiddleware, errorMiddleware, rateLimiter
│   ├── models/                 # User, Stock, Portfolio, Transaction schemas
│   ├── routes/                 # Express REST route handlers
│   ├── seeds/
│   │   └── seed.js             # Seeding script with demo users, 12 stocks & sample history
│   ├── services/               # authService, marketService, tradingService, portfolioService, adminService
│   ├── utils/
│   │   ├── logger.js           # Structured logger
│   │   └── stockSimulator.js   # Geometric Brownian motion & price tick simulation
│   ├── server.js               # Express application entry point
│   ├── package.json
│   ├── .env.example
│   └── .env
│
├── package.json                # Root package with npm workspaces & concurrent scripts
├── .gitignore                  # Git ignore rules
└── README.md                   # Documentation
```

---

## 🛠️ Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, React Router v6, Chart.js, react-chartjs-2, Bootstrap 5.3, Bootstrap Icons, Axios, Vite |
| **Backend** | Node.js (18+), Express.js, Helmet, Morgan, Express Rate Limit, CORS |
| **Database** | MongoDB, Mongoose ODM (indexed schemas) |
| **Authentication** | JWT (JSON Web Tokens), bcryptjs (salt rounds: 10) |
| **Market Data** | Pluggable simulation engine with drift/volatility ticks (supports external API integration) |

---

## 🚀 Getting Started

### Prerequisites

1. **Node.js** (v18 or higher) — [Download Node.js](https://nodejs.org/)
2. **MongoDB** (v5 or higher) running locally on port `27017` or a MongoDB Atlas URI.

### 1. Clone & Install Dependencies

From the project root:

```bash
npm install
```

> **Note:** Thanks to **npm workspaces**, running `npm install` at the root automatically installs dependencies for root, server, and client simultaneously.

### 2. Configure Environment Variables

The project includes pre-configured `.env` and `.env.example` files:

`server/.env`:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/shopez_trading
JWT_SECRET=shopez_production_super_secret_jwt_key_2026_stocks
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:5173
INITIAL_USER_BALANCE=100000
STOCK_SIMULATION_INTERVAL_MS=5000
EXTERNAL_STOCK_API_KEY=
```

### 3. Seed Initial Database Data

Populate 12 realistic stocks (Apple, NVIDIA, Microsoft, Alphabet, Amazon, Tesla, Meta, JPMorgan, Visa, Walmart, Disney, Netflix) with historical price series and initial demo accounts:

```bash
npm run seed
```

### 4. Run Development Servers

Start both the backend server and frontend client concurrently:

```bash
npm run dev
```

- **Frontend Client:** `http://localhost:5173`
- **Backend API:** `http://localhost:5000`

---

## 🔑 Demo Credentials

| Role | Email | Password | Initial Virtual Funds |
|---|---|---|---|
| **Demo Trader** | `trader@shopez.com` | `TraderPassword123!` | $85,500 + Active Holdings |
| **Demo Admin** | `admin@shopez.com` | `AdminPassword123!` | $250,000 + Full Admin Access |

> 💡 **Quick Login:** The login page features 1-click autofill buttons for both Demo Trader and Demo Admin.

---

## 📡 REST API Reference

### Authentication (`/api/auth`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register new user account | Public |
| `POST` | `/api/auth/login` | Login and receive JWT token | Public |
| `GET` | `/api/auth/me` | Fetch authenticated user profile | Private |
| `POST` | `/api/auth/reset-balance` | Reset virtual cash balance to $100k | Private |

### Market & Stocks (`/api/stocks`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/stocks` | List stocks with search, sector & sort | Public |
| `GET` | `/api/stocks/:symbol` | Get stock details with historical prices | Public |
| `GET` | `/api/stocks/market/overview` | Top gainers, top losers, active sectors | Public |

### Trading Operations (`/api/trades`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/api/trades/buy` | Buy shares with virtual cash | Private |
| `POST` | `/api/trades/sell` | Sell shares and credit balance | Private |

### Portfolio & Orders (`/api/portfolio`, `/api/transactions`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/portfolio` | Real-time portfolio valuation & holdings | Private |
| `GET` | `/api/transactions` | User's order audit history | Private |

### Admin Management (`/api/admin`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/admin/stats` | Platform-wide KPIs & trade statistics | Admin |
| `GET` | `/api/admin/users` | List registered users with pagination | Admin |
| `PUT` | `/api/admin/users/:id/status` | Suspend or activate user account | Admin |
| `GET` | `/api/admin/transactions` | Global platform trade audit stream | Admin |
| `POST` | `/api/admin/stocks` | Create and list a new stock | Admin |
| `PUT` | `/api/admin/stocks/:id` | Update stock metadata or prices | Admin |
| `DELETE` | `/api/admin/stocks/:id` | Safely remove stock from catalog | Admin |

---

## 🔒 Security & Reliability

- **Bcrypt Password Hashing:** Salted passwords (10 rounds). Passwords never stored in plain text.
- **JWT Protection:** State verification on every private endpoint with token expiration handling.
- **Strict Role-Based Authorization:** Custom `authorize('admin')` middleware blocks unauthorized users from administration tools.
- **Rate Limiting:** Protects auth endpoints against brute force and trade routes against spamming.
- **Atomic Operations:** Balance deduction and holding updates prevent race conditions and double spending.
- **No Secrets in Frontend:** API keys and database credentials remain strictly within server environment variables.
- **Centralized Error Handling:** Standardized JSON error envelopes with hidden stack traces in production.

---

## 🧪 Production Build & Deployment

To generate an optimized production bundle:

```bash
npm run build
```

To run the production server:

```bash
NODE_ENV=production npm start
```

In production mode, the Express backend automatically serves the pre-compiled React single-page application from `client/dist`.

---

## 📄 License

This project is licensed under the MIT License.
