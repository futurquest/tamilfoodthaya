# Tamil Food Thaya Platform

A production-ready restaurant and catering web platform for a Netherlands-based Tamil / Sri Lankan cuisine business.

## 🚀 Overview
Tamil Food Thaya provides an end-to-end solution for:
- **Online Food Ordering**: Pickup/Pre-order for restaurant locations.
- **Catering Management**: Event packages (Silver, Gold, Platinum) and custom quote requests.
- **Admin Dashboard**: Real-time order tracking, lead management, and menu inventory control.
- **Mobile-First Experience**: Optimized for Dutch UX standards with subtle Tamil cultural accents.

## 🛠 Tech Stack
- **Frontend**: React (TypeScript), Tailwind CSS, React Query, Vite, Framer Motion.
- **Backend**: NestJS (TypeScript), Mongoose, JWT Authentication, Passport.
- **Database**: MongoDB (Atlas).
- **Payments**: Stripe (iDEAL integration).
- **Testing**: Vitest (Frontend), Jest (Backend), Playwright (E2E).

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

### Prerequisites
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
