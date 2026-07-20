# SB Stocks - Production-Ready Paper Trading Platform

SB Stocks is a full-stack MERN (MongoDB, Express, React, Node.js) paper trading platform. It provides an educational, risk-free environment where users can practice US stock market trading with virtual cash using real-time quotes, news, and historical candlestick graphs.

---

## 🛠 Tech Stack

*   **Frontend**: React (Vite), Redux Toolkit (State Management), Tailwind CSS v4, Recharts (Composed Price/Volume & Allocation Pie Charts), Framer Motion (Micro-animations), Lucide React (Icons).
*   **Backend**: Node.js, Express.js (REST APIs, security, and cookies).
*   **Database**: MongoDB Atlas via Mongoose ODM.
*   **Authentication**: JWT Session Access Tokens & rotated Secure HTTP-Only Refresh Cookies.
*   **Security Features**: Helmet, CORS origin controls, Rate Limiting, Mongoose Schema sanitizations, and Password Hashing (bcryptjs).

---

## 📂 Folder Structure Documentation

The workspace is organized as a monorepo divided into frontend client and backend server layers:

```
pro_mern/
├── backend/
│   ├── config/             # DB connection and configurations
│   ├── controllers/        # Express route business logic controllers
│   │   ├── authController.js       # User signup, logins, refresh tokens, profile configs
│   │   ├── portfolioController.js  # Holdings listings, statistics calculations, histories
│   │   ├── stockController.js      # Quote feeds, profiles, news, autocomplete searches
│   │   └── tradeController.js      # Virtual BUY/SELL execution and transaction log queries
│   ├── middleware/         # Custom middlewares (protect JWT, rate limiter, error handling)
│   ├── models/             # Mongoose schemas with indexing & TTL bounds
│   │   ├── User.js                 # User credentials and virtual balances
│   │   ├── Holding.js              # Quantities owned per stock symbol
│   │   ├── Transaction.js          # Chronological trade ledger details
│   │   ├── Watchlist.js            # Followed stock symbols array
│   │   ├── Portfolio.js            # Daily snapshot values for growth graphs
│   │   └── StockCache.js           # API response caches with TTL automatic deletion
│   ├── routes/             # Express routes mappings
│   ├── services/           # Third-party Finnhub service client with caching
│   ├── utils/              # Token helpers and mock pricing wiggles
│   ├── index.js            # Server entry point, security headers, health check routes
│   └── .env                # Server environment variables
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable layout UI components
│   │   │   ├── Layout.jsx          # Protected layout grid (Navbar + Sidebar)
│   │   │   ├── Navbar.jsx          # Top bar with real-time balance and autocomplete search
│   │   │   ├── Sidebar.jsx         # Left navigation bar with market hours alert
│   │   │   ├── ProtectedRoute.jsx  # Auth guard loading wrapper
│   │   │   └── DashboardSkeleton.jsx # Pulse skeleton templates for loading states
│   │   ├── pages/          # View pages
│   │   │   ├── Login.jsx           # Animated credentials portal with validation
│   │   │   ├── Register.jsx        # Validation signup forms
│   │   │   ├── ForgotPassword.jsx  # Recovery layout
│   │   │   ├── Dashboard.jsx       # Aggregations, Recharts Area performance graph
│   │   │   ├── Market.jsx          # Quote tickers, debounced inputs, news widgets
│   │   │   ├── Watchlist.jsx       # Followed symbols grid with removal actions
│   │   │   ├── Portfolio.jsx       # Detailed holding sheets, Recharts allocation Pie Chart
│   │   │   ├── Transactions.jsx    # Complete chronological ledger table with pagination
│   │   │   └── Profile.jsx         # Settings cards, Dicebear avatar selector grid
│   │   ├── services/       # Axios API client interceptor with auto-refresh
│   │   ├── store/          # Redux Toolkit store slices
│   │   ├── index.css       # Tailwind directives & CSS custom variables theme config
│   │   ├── main.jsx        # Mount entry point with Redux Provider
│   │   └── App.jsx         # React Router layout and secure routes
│   ├── package.json
│   └── vite.config.js      # Vite compile configuration and proxy maps
└── README.md
```

---

## 🚀 Installation & Local setup Guide

### Prerequisites
*   Node.js (v18.0.0 or higher recommended)
*   MongoDB installed locally (running on `mongodb://localhost:27017`) or a MongoDB Atlas Connection String.

### 1. Backend Setup
1.  Navigate to the `backend/` directory.
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Configure environment variables. Copy the values in `.env` and fill in details:
    ```env
    PORT=5000
    MONGODB_URI=your_mongodb_connection_string
    JWT_SECRET=your_jwt_access_secret
    JWT_REFRESH_SECRET=your_jwt_refresh_secret
    FINNHUB_API_KEY=your_free_finnhub_key_here
    NODE_ENV=development
    ```
    *Note: If `FINNHUB_API_KEY` is left blank, the application will automatically fall back to its internal stock mock generator, allowing you to test trading functionalities immediately.*
4.  Start development server:
    ```bash
    npm run dev
    ```

### 2. Frontend Setup
1.  Navigate to the `frontend/` directory.
2.  Install dependencies:
    ```bash
    npm install --legacy-peer-deps
    ```
3.  Start dev client server:
    ```bash
    npm run dev
    ```
4.  Open `http://localhost:5173` in your browser.

---

## 📡 API Documentation

All routes are authenticated via `Bearer <JWT_ACCESS_TOKEN>` headers except registration/login/refresh.

### Authentication Endpoints (`/api/auth`)
*   `POST /register`: Registers user. Returns access token, user metadata.
*   `POST /login`: Authenticates username/email. Sets HTTP-only refresh cookie.
*   `POST /refresh`: Rotates credentials and issues new access token.
*   `POST /logout`: Clears backend refresh token and removes client cookies.
*   `GET /me`: Returns details of active user session.
*   `PUT /profile`: Updates username and avatar seed keys.
*   `PUT /password`: Modifies user password (checks current password).

### Portfolio Endpoints (`/api/portfolio`)
*   `GET /dashboard`: Fetches total asset valuations, profit/loss margins, watchlist, and 30-day performance trends.
*   `GET /holdings`: Fetches detailed holding tables (shares, avg buy prices, allocations %).

### Trading Endpoints (`/api/trade`)
*   `POST /execute`: Processes BUY or SELL transactions. Validates cash reserves or shares availability before executing, and logs transaction details.
*   `GET /transactions`: Fetches chronological trade ledger (paginated, 10 items/page).

### Stock Market Endpoints (`/api/stocks`)
*   `GET /quote/:symbol`: Fetches real-time price, previous close, high, and low.
*   `GET /profile/:symbol`: Fetches company name, logo, industry.
*   `GET /search?q=query`: Autocomplete search match queries.
*   `GET /news`: General market news feeds.
*   `GET /candles/:symbol`: Historical candlestick chart price/volume arrays.

---

## ☁ Deployment Guide

### Database (MongoDB Atlas)
1.  Create a free project at [mongodb.com/atlas](https://www.mongodb.com/cloud/atlas).
2.  Create a cluster, configure a database user, and white-list access IP (`0.0.0.0/0` for cloud services).
3.  Copy the connection string (replace credentials) and place it as `MONGODB_URI` in your backend configuration.

### Backend Hosting (Render)
1.  Create a free account at [render.com](https://render.com).
2.  Create a new **Web Service**, link your GitHub repository, and set:
    *   **Root Directory**: `backend`
    *   **Build Command**: `npm install`
    *   **Start Command**: `node index.js`
3.  Add all variables inside `.env` to Render's **Environment variables** section (ensure `NODE_ENV` is set to `production`).

### Frontend Hosting (Firebase Hosting)
1.  Install the Firebase CLI: `npm install -g firebase-tools`.
2.  Initialize firebase in `frontend/`: `firebase init`.
    *   Select **Hosting**.
    *   Set build directory to `dist` (Vite output folder).
    *   Configure as a single-page app (rewrite URLs to `index.html`).
3.  Compile frontend bundle: `npm run build` in `frontend/`.
4.  Deploy client: `firebase deploy`.

---

## 🔮 Future Enhancements

*   **Fractional Shares Trading**: Enable users to invest defined dollar values (e.g. $10 of TSLA) rather than whole shares.
*   **Limit Orders Scheduling**: Support buy-stop/sell-limit trigger thresholds that process trade executions automatically when stock prices cross targets.
*   **Interactive Leaderboards**: Gamify trading by creating community tables showing the highest-performing portfolios.
*   **Technical Indicator Overlay**: Add SMA, EMA, MACD, and RSI line overlays inside the stock performance graphs.
