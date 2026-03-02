# Tamil Food Thaya Platform

A production-ready restaurant and catering web platform for a Netherlands-based Tamil / Sri Lankan cuisine business.

## 🚀 Key Features

### 🌍 Multilingual Support
- **Dynamic Content**: Seamlessly switch between **English, Dutch, and Tamil** for all menu items, packages, and UI elements.
- **Localized UX**: Addresses Dutch administrative standards while honoring Tamil cultural roots.

### 🍱 Premium Catering system
- **Package Selection**: Tiered packages (Silver, Gold, Platinum) with customizable item selections.
- **Change Request System**: Professional-grade request flow for modifying guests, date, or menu after booking.
- **Robust Quotation**: Automated and manual quote management for large-scale events.

### 💳 Optimized Checkout
- **Smart Pre-fill**: Automatically populates contact info for logged-in users.
- **Override Flexibility**: Allows editing of phone/email during checkout for specific order needs.
- **iDEAL Integration**: Specialized for the Netherlands market via Stripe.

### 📊 Advanced User Dashboard
- **Granular Status Tracking**: Color-coded badges for all order states (Quoted, Paid, Preparing, Ready, etc.).
- **Dynamic Filtering**: Instant status-based filtering (All, Pending, In Progress, Completed).
- **Notification Management**: Dismissible real-time updates (Email/WhatsApp) for order progress.

## 🛠 Tech Stack
- **Frontend**: React (TypeScript), Tailwind CSS, React Query, Vite, Framer Motion, i18next.
- **Backend**: NestJS (TypeScript), Mongoose, JWT Authentication, Passport, Nodemailer.
- **Database**: MongoDB (Atlas).
- **Payments**: Stripe (iDEAL integration).

## 📂 Project Structure
```text
tamilfoodthaya/
├── client/                 # React Frontend
│   ├── src/
│   │   ├── components/     # UI & Layout components
│   │   ├── context/        # Cart & Auth state
│   │   ├── hooks/          # API & custom hooks
│   │   ├── pages/          # Public & Admin pages
│   │   └── lib/            # Utilities
├── server/                 # NestJS Backend
│   ├── src/
│   │   ├── auth/           # Authentication & Security
│   │   ├── menu/           # Menu & Inventory
│   │   ├── order/          # Order processing & Stripe
│   │   ├── lead/           # Contact leads
│   │   └── catering/       # Catering packages & quotes
└── docs/                   # Detailed Documentation
```

## ⚙️ Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/futurquest/tamilfoodthaya.git
cd tamilfoodthaya
```

### 2. Prerequisites
- Node.js (v18+)
- MongoDB Atlas account
- Stripe account (Secret key & Webhook secret)

### Backend (Server)
1. `cd server`
2. `npm install`
3. Create `.env` file (see [Environment Variables](#environment-variables))
4. Run the database seeder to initialize the menu and catering packages: 
   `npx ts-node src/seed.ts`
5. Start the backend server:
   `npm run start:dev`

### Frontend (Client)
1. Open a new terminal and `cd client`
2. `npm install`
3. Create `.env` file (see [Environment Variables](#environment-variables))
4. Start the frontend server:
   `npm run dev`

## 🔐 Environment Variables

### Backend (.env)
```env
PORT=3000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
STRIPE_SECRET_KEY=your_stripe_secret
STRIPE_WEBHOOK_SECRET=your_webhook_secret
CLIENT_URL=http://localhost:5173

# Email (SMTP)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your_username
SMTP_PASS=your_password
SMTP_FROM="Tamil Food Thaya" <noreply@yourdomain.com>
```

### Frontend (.env)
```env
VITE_API_BASE_URL=http://localhost:3000
```

## 💳 Stripe & iDEAL Integration
The platform uses **Stripe Checkout** for secure payments.
1. Enable **iDEAL** in your Stripe Dashboard.
2. Set the `STRIPE_WEBHOOK_SECRET` to receive `checkout.session.completed` events for order confirmation.
3. Success/Cancel URLs are configured in `OrderService`.

## 🚢 Deployment
- **Frontend**: Vercel or Netlify (Point to `client/` directory).
- **Backend**: Railway, Render, or Heroku (Point to `server/` directory).
- **Database**: MongoDB Atlas.

## 🧪 Testing
- Backend: `cd server && npm test`
- Frontend: `cd client && npm test`
- E2E: `npx playwright test` (requires frontend dev server running)
  - View report: `npx playwright show-report`
  - Install browsers: `npx playwright install`
