# DrWise Backend System

This repository contains the backend codebase for the DrWise application.

## New Features

### 1. Subscription System for Affiliates and Ambassadors

The subscription system allows both affiliates and ambassadors to subscribe to premium services:

- **Subscription Types**: Support for both ambassador and affiliate subscriptions
- **Subscription Status Tracking**: Active, inactive, expired, pending, or cancelled
- **Plan Details**: Name, price, duration, and features
- **Payment Integration**: Transaction tracking for subscriptions
- **Automatic Expiration**: Background job to check and update expired subscriptions

**API Endpoints:**
- `POST /subscription`: Create a new subscription
- `GET /subscription`: List all subscriptions
- `GET /subscription/:id`: Get subscription details
- `PUT /subscription/:id`: Update subscription
- `PATCH /subscription/:id/cancel`: Cancel a subscription
- `POST /subscription/check-expired`: Admin endpoint to check and update expired subscriptions

### 2. Order Number for Categories and Sub-categories

Categories and subcategories now include an order number feature for better organization:

- **Unique Order Numbers**: Each category has a unique order number
- **Parent-based Ordering**: Subcategories have unique order numbers within their parent category
- **Automatic Assignment**: If not provided, the system assigns the next available order number
- **Duplication Prevention**: Built-in validation prevents duplicate order numbers
- **Reordering API**: Dedicated endpoints for reordering categories and subcategories

**API Endpoints:**
- `POST /categories/reorder`: Reorder multiple categories at once
- `POST /subcategory/reorder`: Reorder multiple subcategories at once

### 3. Comprehensive Reporting System

A powerful reporting system with support for different report types and data persistence:

- **Transaction Reports**: Paid withdrawal list with duration filters
- **Sales Reports**: Periodic sales data with daily, weekly, monthly, or yearly breakdown
- **Leads Reports**: Comprehensive lead tracking and conversion analytics
- **Payment Reports**: Configurable payment reports with dynamic fields
- **Date Range Filtering**: All reports support date range filtering
- **Dynamic Fields**: Payment reports support dynamic fields for custom reporting needs
- **Status Tracking**: Reports include status (pending, completed, error)

**API Endpoints:**
- `POST /reports`: Create a custom report
- `GET /reports`: List all reports
- `GET /reports/:id`: Get detailed report information
- `DELETE /reports/:id`: Delete a report
- `POST /reports/transaction`: Generate a transaction report
- `POST /reports/sales`: Generate a sales report
- `POST /reports/leads`: Generate a leads report
- `POST /reports/payments`: Generate a payment report

## Getting Started

### Prerequisites

- Node.js (v14+)
- MongoDB
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies: `npm install`
3. Create a `.env` file with the required environment variables
4. Start the development server: `npm run dev`

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```
PORT=5001
MONGODB_URI=mongodb://localhost:27017/drwise
JWT_SECRET=your_jwt_secret
```

## API Documentation

The API documentation is available at `/api-docs` when running the server locally.

## License

This project is proprietary and confidential. 