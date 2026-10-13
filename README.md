# InsightCart — E-commerce Intelligence Platform

InsightCart is a MERN-based e-commerce analytics dashboard for exploring sales performance and customer purchase behaviour. It combines a React dashboard with Express REST APIs and MongoDB aggregation pipelines. This repository extends the upstream dashboard with a Customer Intelligence page and RFM-style customer segmentation.

> **Project background:** InsightCart is a customized fork of [ecommerce-analytics-dashboard](https://github.com/ma-usman-pro/ecommerce-analytics-dashboard). The upstream project provides the base e-commerce dashboard and API. The additions made in InsightCart are described below; this repository should not be represented as an entirely original codebase.

## Features

### E-commerce analytics

- Summary metrics for revenue, orders, customers, and average order value.
- Revenue and order trends visualized with Recharts.
- Category revenue and order-status breakdowns.
- Top-product analysis.
- Server-side date, category, and status filters.
- Search and server-side pagination for orders and products.
- CSV export that respects active filters.
- Responsive layout with light and dark modes.

### Customer Intelligence — InsightCart additions

- Dedicated Customer Intelligence page at `/customers`.
- Server-side customer purchase metrics calculated from MongoDB data.
- Recency, frequency, and monetary values, with rank-based scores from 1 to 5.
- Customer segments: Champions, Loyal Customers, Potential Loyalists, At Risk, Hibernating, and Needs Attention.
- Segment summaries, customer search and filtering, sorting, and CSV export in the UI.
- API endpoint: `GET /api/analytics/customer-segments`.
- Dedicated unit tests for the segmentation service.

### RFM methodology

- **Recency:** days since the customer's most recent eligible order; fewer days is better.
- **Frequency:** number of eligible orders for the customer.
- **Monetary:** sum of eligible orders' `totalAmount` values.

The current implementation includes `Completed`, `Processing`, and `Pending` orders in these metrics. `Cancelled` and `Refunded` orders are excluded, following the base project's default revenue rules. Scores are derived from the ranks of distinct metric values, and segment labels are assigned using explicit rules in the segmentation service. Customers without eligible orders are not included in the current RFM response.

## Technology stack

| Layer | Technologies |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS, React Router, Axios, Recharts |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose; MongoDB Atlas or local MongoDB |
| Testing | Vitest, React Testing Library, Supertest; Playwright E2E setup in the base project |
| Security and API | Helmet, `express-rate-limit`, environment-aware CORS, health-check endpoint |

## Architecture

```text
React + Vite frontend
        │ Axios / HTTP JSON
        ▼
Express REST API
        │ routes → controllers → services
        ▼
Mongoose / MongoDB
        └── aggregation pipelines for analytics and customer segmentation
```

The frontend communicates with the backend API; it does not connect directly to MongoDB. The backend entry point is `server/server.js`, while `server/app.js` configures Express middleware and routes.

## Run locally (Windows PowerShell)

### Prerequisites

- Node.js and npm versions compatible with the packages' declared engine requirements.
- A MongoDB database: MongoDB Atlas or a local MongoDB instance.
- Git.

### 1. Configure and start the backend

From the repository root:

```powershell
cd server
Copy-Item .env.example .env
```

Edit `server/.env` and set `MONGO_URI` to your MongoDB connection string. Keep credentials in `.env`; do not commit them. The example URI in `.env.example` is for a local MongoDB instance and will only work if you are running MongoDB locally.

Then install dependencies and start the API:

```powershell
npm install
npm start
```

The API listens on `http://localhost:5000` by default. Check the connection status at `http://localhost:5000/api/health`.

### 2. Optional: seed demo data

Use a dedicated development database. From the `server` folder, run:

```powershell
npm run seed
```

> **Warning:** The seed script clears existing demo records in the database specified by `MONGO_URI` before inserting sample products, customers, and orders. Do not run it against a database containing data you need to keep.

### 3. Configure and start the frontend

Open a **second terminal** at the repository root:

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

Open the local URL printed by Vite, usually `http://localhost:5173`. Visit `/customers` for the Customer Intelligence page.

## API endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | API and database health status |
| GET | `/api/analytics/summary` | Summary metrics |
| GET | `/api/analytics/revenue` | Revenue grouped by date |
| GET | `/api/analytics/orders` | Orders grouped by date |
| GET | `/api/analytics/categories` | Revenue by product category |
| GET | `/api/analytics/order-status` | Order counts by status |
| GET | `/api/analytics/top-products` | Best-selling products |
| GET | `/api/analytics/customer-segments` | RFM-style customer metrics and segment summaries |
| GET | `/api/orders` | Searchable, filterable, paginated orders |
| GET | `/api/orders/recent` | Recent orders |
| GET | `/api/products` | Searchable, paginated products |
| GET | `/api/customers` | Searchable, paginated customers |
| GET | `/api/categories` | Categories read from the database |

Most analytics endpoints return JSON in the shape `{ success, data }`. Paginated resource endpoints also include pagination metadata.

## Tests and production build

Run backend tests from the `server` folder:

```powershell
npm run test:run
```

Run frontend tests from the `client` folder:

```powershell
npm run test:run
```

Create the production frontend build from the `client` folder:

```powershell
npm run build
```

**Last locally verified for this customized version:** 68 backend tests passed, 106 frontend tests passed, and `vite build` completed successfully. The RFM service has a dedicated unit-test file, though further edge-case coverage remains a useful improvement. E2E tests exist in the upstream project but were not re-run during this update.

## Repository structure

```text
client/
  src/api/                 API client functions
  src/components/          Reusable UI components
  src/pages/               Dashboard, orders, products, and customer intelligence pages
server/
  controllers/              HTTP request handlers
  routes/                   Express route definitions
  services/                 Business logic and aggregation pipelines
  models/                   Mongoose models
  tests/                    Unit and integration tests
docs/screenshots/           Existing dashboard screenshots
```

## Contributions in this fork

The main additions made in InsightCart are:

- Rebranding the UI as InsightCart.
- Adding the Customer Intelligence frontend page.
- Adding the RFM-style customer segmentation service and API route.
- Adding unit tests for the segmentation service.
- Updating the README to document the fork and the custom additions.

The upstream dashboard remains the foundation for the sales, order, and product analytics. See the [upstream repository](https://github.com/ma-usman-pro/ecommerce-analytics-dashboard) for the source project.

## License and attribution

This repository is a fork and retains attribution to the upstream project. Confirm the upstream project's applicable license and permissions before redistributing or reusing its code outside the context of this fork. Do not assume that the absence of a visible license grants unrestricted reuse rights.
