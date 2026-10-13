# InsightCart — E-commerce Intelligence Platform

InsightCart is a full-stack e-commerce analytics dashboard with interactive sales reporting, customer segmentation, and a 3D-inspired data exploration experience. It combines a React frontend with an Express REST API and MongoDB aggregation pipelines.

> **Project background:** This repository is a customized fork of [`ma-usman-pro/ecommerce-analytics-dashboard`](https://github.com/ma-usman-pro/ecommerce-analytics-dashboard). The upstream project provides the base e-commerce dashboard and API. This README distinguishes the base project from the enhancements made in InsightCart; the repository is not presented as an entirely original codebase.

## Live Demo

- **Frontend:** [insightcart-web.onrender.com](https://insightcart-web.onrender.com)
- **Customer Intelligence:** [Open `/customers`](https://insightcart-web.onrender.com/customers)
- **Analytics Studio:** [Open `/analytics`](https://insightcart-web.onrender.com/analytics)
- **Settings:** [Open `/settings`](https://insightcart-web.onrender.com/settings)
- **Backend API:** [insightcart-qvct.onrender.com](https://insightcart-qvct.onrender.com)
- **API health check:** [GET `/api/health`](https://insightcart-qvct.onrender.com/api/health)

The API is hosted on Render and uses MongoDB Atlas. The free backend instance may spin down after a period of inactivity, so the first request after idle time can take longer while it wakes up.

## Features

### Interactive dashboard

- Summary KPIs for revenue, orders, customers, and average order value.
- Revenue and order trends, category revenue, order-status breakdowns, and top-product analysis.
- Date presets and custom date ranges, category filters, and URL-synced filter state.
- Comparison trends against the preceding period of equal length.
- Responsive layout with light and dark themes.
- 3D hero visualization built with Three.js and React Three Fiber.
- KPI cards with subtle perspective tilt, lift, and hover styling.
- Animated revenue chart with interactive data points and tooltip details.

### Customer Intelligence

- Customer RFM metrics calculated from eligible order history.
- Interactive 3D customer-segment visualization with selectable segments.
- Segment groups: **Champions**, **Loyal Customers**, **Potential Loyalists**, **At Risk**, **Hibernating**, and **Needs Attention**.
- Segment counts and spend summaries, customer search, segment filtering, sorting, and CSV export.
- API endpoint: `GET /api/analytics/customer-segments`.

### Analytics Studio

- Dedicated `/analytics` page for reviewing sales KPIs and charts.
- Revenue, order, category, order-status, and top-product views using the existing analytics API.
- Reuses the application's existing filters and data services rather than hardcoding demonstration metrics.

### Settings

- Dedicated `/settings` page.
- Light/dark appearance controls.
- API and database health information.

### Orders and products

- Searchable, filterable, paginated orders and products.
- Recent orders table.
- CSV export for supported analytics views, respecting active filters where implemented.

## RFM methodology

- **Recency:** days since the customer's most recent eligible order; fewer days is better.
- **Frequency:** number of eligible orders for the customer.
- **Monetary:** sum of eligible orders' `totalAmount` values.

The current implementation includes `Completed`, `Processing`, and `Pending` orders in these metrics. `Cancelled` and `Refunded` orders are excluded. Scores are based on ranks of distinct metric values, and segment labels are assigned using explicit rules in the segmentation service. Customers without eligible orders are not included in the current RFM response.

## Technology stack

| Layer | Technologies |
|---|---|
| Frontend | React 18, Vite, React Router, Tailwind CSS, Axios |
| Charts | Recharts |
| 3D and interaction | Three.js, React Three Fiber, Drei, Motion (installed for UI animation work) |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose, MongoDB Atlas |
| Testing | Vitest, React Testing Library, Supertest; Playwright E2E setup in the base project |
| Security and API | Helmet, `express-rate-limit`, environment-aware CORS, database-aware health endpoint |
| Hosting | Render (static frontend and Node web service), MongoDB Atlas |

## Architecture

```text
React + Vite frontend
        | Axios / HTTP JSON
        v
Express REST API
        | routes -> controllers -> services
        v
Mongoose / MongoDB Atlas
        ` aggregation pipelines for analytics and customer segmentation
```

The frontend communicates with the backend API; it does not connect directly to MongoDB. The backend entry point is `server/server.js`, while `server/app.js` configures Express middleware and routes.

## API endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | API and database health status |
| `GET` | `/api/analytics/summary` | Summary metrics |
| `GET` | `/api/analytics/revenue` | Revenue grouped by date |
| `GET` | `/api/analytics/orders` | Orders grouped by date |
| `GET` | `/api/analytics/categories` | Revenue by product category |
| `GET` | `/api/analytics/order-status` | Order counts by status |
| `GET` | `/api/analytics/top-products` | Best-selling products |
| `GET` | `/api/analytics/customer-segments` | RFM-style customer metrics and segment summaries |
| `GET` | `/api/orders` | Searchable, filterable, paginated orders |
| `GET` | `/api/orders/recent` | Recent orders |
| `GET` | `/api/products` | Searchable, paginated products |
| `GET` | `/api/customers` | Searchable, paginated customers |
| `GET` | `/api/categories` | Categories from the database |

Most analytics endpoints return JSON shaped like `{ success, data }`. Paginated resource endpoints also include pagination metadata.

## Run locally

### Prerequisites

- Node.js and npm compatible with the packages' declared engine requirements.
- MongoDB Atlas or a local MongoDB instance.
- Git.

### 1. Start the backend

From the repository root, in PowerShell:

```powershell
cd server
Copy-Item .env.example .env
```

Edit `server/.env` and set `MONGO_URI` to your MongoDB connection string. Keep credentials in `.env`; **never commit secrets**. The example URI in `.env.example` is for local MongoDB and works only if a local database is running.

Then run:

```powershell
npm install
npm start
```

The API listens on `http://localhost:5000` by default. Check it at `http://localhost:5000/api/health`.

### 2. Optional: seed demo data

Use a dedicated development database. From the `server` folder:

```powershell
npm run seed
```

> **Warning:** The seed script clears existing demo records in the database specified by `MONGO_URI` before inserting sample products, customers, and orders. Do not run it against a database containing data you need to keep.

### 3. Start the frontend

Open a second terminal at the repository root:

```powershell
cd client
Copy-Item .env.example .env
```

Ensure `client/.env` contains:

```env
VITE_API_URL=http://localhost:5000/api
```

Then run:

```powershell
npm install
npm run dev
```

Open the URL printed by Vite, usually `http://localhost:5173`.

## Deployment notes

The deployed frontend needs the backend API base URL configured as `VITE_API_URL` at build time. On Render, its current value is:

```text
https://insightcart-qvct.onrender.com/api
```

The backend needs `MONGO_URI` and `NODE_ENV=production`. Set `CLIENT_URL` to the exact deployed frontend origin so that production CORS permits the frontend. Keep secrets in the hosting provider's environment settings, not in Git.

For Render Static Site hosting, publish the Vite `dist` directory and configure a rewrite from `/*` to `/index.html` so React Router routes can load directly.

## Tests and production build

Run backend tests from the `server` directory:

```powershell
npm run test:run
```

Run frontend tests from the `client` directory:

```powershell
npm run test:run
```

Build the frontend for production from the `client` directory:

```powershell
npm run build
```

**Last recorded local verification for the customized version:** 68 backend tests and 106 frontend tests passed; the Vite production build completed successfully. The frontend test suite was rerun after the Analytics and Settings pages were added. End-to-end tests were not rerun as part of the latest UI changes.

## Repository structure

```text
client/
  src/api/                 API client functions
  src/components/          Reusable UI and dashboard components
  src/pages/               Dashboard, orders, products, customers, analytics, settings
server/
  controllers/              HTTP request handlers
  routes/                   Express route definitions
  services/                 Business logic and aggregation pipelines
  models/                   Mongoose models
  tests/                    Unit and integration tests
docs/screenshots/           Project screenshots
```

## Contributions in this fork

InsightCart's custom additions include:

- Rebranding the interface as InsightCart.
- Adding the Customer Intelligence page and RFM-style segmentation service/API.
- Adding the interactive 3D hero, customer-segment visualization, and KPI/revenue interactions.
- Adding dedicated Analytics and Settings pages and wiring their routes.
- Updating the README with live demo links, setup steps, API details, and attribution.

The upstream dashboard remains the foundation for the original sales, order, and product analytics. See the [upstream repository](https://github.com/ma-usman-pro/ecommerce-analytics-dashboard) for the source project.

## License and attribution

This repository is a fork and retains attribution to the upstream project. Confirm the upstream project's applicable license and permissions before redistributing or reusing its code outside the context of this fork. Do not assume that the absence of a visible license grants unrestricted reuse rights.
