# Admin Dashboard Guide - Tamil Food Thaya

This guide covers how to use the administrative portal to manage restaurant operations.

## 🔑 Access
Login URL: `/admin/login`
Default credentials (initially): `admin` / `admin123`

## 📊 Dashboard Overview
The dashboard provides a high-level summary of:
- **Revenue**: Total sales for the current month.
- **Order Count**: Number of orders to be prepared.
- **Recent Activity**: Latest orders and catering inquiries.

## 🛒 Managing Orders
Navigate to **Bestellingen** to view all customer orders.
- **Filtering**: Filter by status (Paid, Preparing, Ready, Completed).
- **Status Updates**: 
  - Mark as **Preparing** when the kitchen starts.
  - Mark as **Ready** when the customer can pick it up.
- **Exporting**: Click "CSV Export" to download order data for accounting.

## 🍱 Managing Leads
Navigate to **Leads** to view all incoming messages, catering quote requests, and contact form submissions in a unified view.
- **Kanban Board**: The dashboard is structured into three clear columns: `Nieuw (Open)`, `In Behandeling`, and `Afgerond`.
- **Classification Tags**: Leads explicitly label their `utmSource` attributing them to generic website forms, Meta Ad Campaigns, or explicit Catering Quote requests.
- **Actions**: Utilize the responsive inline action buttons to quickly shift a lead into the `In Behandeling` (In Progress) or `COMPLETED` phases.

## 🥂 Managing Catering Orders
Navigate to **Catering Orders** to manage explicit multi-tier catering selections.
- **Responsive Tracking**: Utilize the status permutations (`Pending`, `Confirmed`, `Preparing`, `Completed`) and search text to instantly query large datasets. 
- **Pagination**: Catering orders are returned paginated natively to ensure dashboard speeds remain optimal.

## 🍽 Menu Management
Navigate to **Menu Beheer** to update the restaurant offerings.
- **Inventory**: Update `Stock` for items that are running low.
- **Availability**: Toggle items off if they are not available for the day.
- **Pricing**: Update prices as needed.

## ⚙️ Settings
- Update restaurant opening hours.
- Manage staff accounts and roles.
