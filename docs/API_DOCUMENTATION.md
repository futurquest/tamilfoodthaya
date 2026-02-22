# 📄 Tamil Food Thaya - Full API Specification

This document provides a comprehensive list of all API endpoints for the Tamil Food Thaya platform. 

## 🚀 Quick Links
- **Base URL**: `http://localhost:3000` (Local Development)
- **Interactive Swagger Docs**: `http://localhost:3000/api/docs`
- **Download OpenAPI Specification**:
  - [JSON Format](http://localhost:3000/api/docs-json)
  - [YAML Format](http://localhost:3000/api/docs-yaml)

---

## 🔐 Authentication
Most admin endpoints require a **Bearer Token**. 
1. Log in via `POST /auth/login`.
2. Copy the `access_token` from the response.
3. Include it in the header of subsequent requests: `Authorization: Bearer <your_token>`.

---

## � 1. Auth Module
Manage users, registration, and sessions.

| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :--- |
| **POST** | `/auth/register` | Register a new user | Public |
| **POST** | `/auth/verify` | Verify email with PIN | Public |
| **POST** | `/auth/login` | Log in to get JWT token | Public |
| **POST** | `/auth/forgot-password` | Request password reset email | Public |
| **POST** | `/auth/reset-password` | Reset password using token | Public |
| **POST** | `/auth/init-admin` | Initialize first admin account | Public |

---

## 🍽 2. Menu Module
Manage categories and dishes.

| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :--- |
| **GET** | `/menu/categories` | Get all menu categories | Public |
| **POST** | `/menu/categories` | Create a new category | **Admin** |
| **PATCH** | `/menu/categories/:id` | Update a category | **Admin** |
| **DELETE** | `/menu/categories/:id` | Delete a category | **Admin** |
| **GET** | `/menu/items` | Get all menu items | Public |
| **GET** | `/menu/items/category/:id` | Get items by category | Public |
| **POST** | `/menu/items` | Create item (Multipart/Form-Data) | **Admin** |
| **PATCH** | `/menu/items/:id` | Update item (Multipart/Form-Data) | **Admin** |
| **DELETE** | `/menu/items/:id` | Delete menu item | **Admin** |

---

## 🍱 3. Catering Module
Manage catering packages and complex orders.

| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :--- |
| **GET** | `/catering/packages` | List public catering packages | Public |
| **GET** | `/catering/packages/:id` | Get package details | Public |
| **POST** | `/catering/orders` | Submit a choice-based order | Public |
| **POST** | `/catering/quote` | Request a general quote | Public |
| **GET** | `/catering/packages/all` | List all packages (Admin) | **Admin** |
| **POST** | `/catering/packages` | Create complex package | **Admin** |
| **PATCH** | `/catering/packages/:id` | Update package structure | **Admin** |
| **DELETE** | `/catering/packages/:id` | Delete package | **Admin** |
| **GET** | `/catering/orders` | View all catering orders (Paginated: `?page=x&limit=y`) | **Admin** |
| **PATCH** | `/catering/orders/:id/status`| Update catering order status | **Admin** |
| **GET** | `/catering/quotes` | View all quote requests | **Admin** |

---

## 🛍 4. Order Module (Restaurant)
Handles takeaway orders and Stripe integration.

| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :--- |
| **POST** | `/orders/checkout` | Create Stripe checkout session | Public |
| **POST** | `/orders/webhook` | Stripe Webhook listener | Public |
| **GET** | `/orders` | List all restaurant orders | **Admin** |

---

## ✉ 5. Messages & Leads
Customer inquiries and contact forms.

| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :--- |
| **POST** | `/messages` | Send a contact message | Public |
| **GET** | `/messages` | View all messages | **Admin** |
| **PATCH** | `/messages/:id/read` | Mark message as read | **Admin** |
| **DELETE** | `/messages/:id` | Delete a message | **Admin** |
| **POST** | `/leads` | Submit a general lead form (Unified with Contact form) | Public |
| **GET** | `/leads` | List all leads (Paginated returns: `{ data, total, page, limit }`) | **Admin** |
| **PATCH** | `/leads/:id/status` | Update lead status | **Admin** |

---

## ⚙ 6. Settings Module
Application-wide configurations.

| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :--- |
| **GET** | `/settings` | Get public site settings | Public |
| **PUT** | `/settings` | Update settings | **Admin** |

---

## 🛠 Developer Tools
To download this documentation for use in **Postman**:
1. Open Postman.
2. Click **Import**.
3. Choose **Link** and paste: `http://localhost:3000/api/docs-json`.
4. Postman will automatically generate a full collection with all endpoints.
