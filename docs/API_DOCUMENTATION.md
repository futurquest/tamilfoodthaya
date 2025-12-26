# API Documentation - Tamil Food Thaya

All API endpoints are prefixed with `/`. Swagger documentation is available at `/api/docs` when running in development.

## Authentication
Admin endpoints require a Bearer Token in the `Authorization` header.
- **Header**: `Authorization: Bearer <JWT_TOKEN>`

---

## 🔐 Auth Endpoints

### Login
- **Endpoint**: `POST /auth/login`
- **Payload**:
  ```json
  { "username": "admin", "password": "password123" }
  ```
- **Response**: `200 OK`
  ```json
  { "access_token": "...", "user": { "id": "...", "role": "admin" } }
  ```

### Initialize Admin
- **Endpoint**: `POST /auth/init-admin`
- **Description**: Creates a default admin user if none exists.

---

## 🍽 Menu Endpoints

### Get Categories
- **Endpoint**: `GET /menu/categories`
- **Response**: `200 OK` (Array of category objects)

### Get Menu Items
- **Endpoint**: `GET /menu/items`
- **Response**: `200 OK` (Array of menu item objects)

### Create Menu Item (Admin)
- **Endpoint**: `POST /menu/items`
- **Auth**: Required
- **Payload**:
  ```json
  {
    "name": "Mutton Kottu",
    "price": 14.50,
    "categoryId": "...",
    "spiceLevel": 2
  }
  ```

---

## 🛒 Order Endpoints

### Create Checkout Session
- **Endpoint**: `POST /orders/checkout`
- **Payload**:
  ```json
  {
    "items": [{ "menuItemId": "...", "quantity": 1 }],
    "customerInfo": { "name": "...", "email": "..." },
    "pickupTime": "2025-12-25T18:00:00Z"
  }
  ```
- **Response**: `201 Created`
  ```json
  { "url": "https://checkout.stripe.com/..." }
  ```

### Stripe Webhook
- **Endpoint**: `POST /orders/webhook`
- **Description**: Handles Stripe events (`checkout.session.completed`).

---

## 🍱 Catering & Lead Endpoints

### Request Catering Quote
- **Endpoint**: `POST /catering/quote`
- **Payload**:
  ```json
  {
    "name": "Sarah",
    "email": "sarah@example.com",
    "eventDate": "2026-08-15",
    "guests": 150
  }
  ```

### Contact Lead
- **Endpoint**: `POST /leads`
- **Payload**:
  ```json
  { "name": "John", "message": "Can I pre-order for next week?" }
  ```

---

## 📊 Admin Management

### Get All Orders
- **Endpoint**: `GET /orders`
- **Auth**: Required

### Get All Leads
- **Endpoint**: `GET /leads`
- **Auth**: Required

### Get All Quotes
- **Endpoint**: `GET /catering/quotes`
- **Auth**: Required
