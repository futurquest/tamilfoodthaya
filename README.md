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
│   │   │   └── dto/        # class-validator request DTOs
│   │   ├── order/          # Order processing & Stripe
│   │   ├── lead/           # Contact leads
│   │   ├── catering/       # Catering packages & quotes
│   │   └── db/             # Database tooling CLI scripts
│   │       └── migrations/ # Versioned, tracked schema/data migrations
│   ├── backups/            # Local DB backups (gitignored)
│   └── docs/               # Detailed Documentation
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

## 🗄️ Database Operations

All DB tooling lives in `server/src/db/` and runs from the `server/` directory. Backups are stored under `server/backups/` (gitignored).

### Available Commands
```bash
# Backup the whole database (gzipped Extended JSON + manifest, one file per collection)
npm run db:backup                       # full backup
npm run db:backup -- --keep 10          # prune old backups, keep the 10 newest
npm run db:backup -- --collections=users,coupons

# List existing backups
npm run db:list -- --details

# Restore / import a backup
npm run db:restore -- --dir ./backups/<backup-folder>     # replace mode (drops + re-inserts)
npm run db:restore -- --dir ./backups/<backup-folder> --mode merge      # upsert by _id, keep everything
npm run db:restore -- --dry-run                            # validate + report without writing
npm run db:restore -- --collections=users --yes            # partial restore, skip prompt

# Migrations (tracked in the `_migrations` collection)
npm run db:migrate -- status     # show applied / pending
npm run db:migrate               # apply all pending
npm run db:migrate -- latest     # apply only the newest pending
npm run db:migrate -- down <name> # roll back an applied migration
npm run db:migrate:create add-some-field  # scaffold a new migration + register it
```

### Migration workflow
- Migrations live in `server/src/db/migrations/`, export `{ name, up, down }`, and are registered in `index.ts` in order (oldest first). `db:migrate:create` creates the file **and** registers it automatically.
- Each applied migration is recorded in the `_migrations` collection, so it runs exactly once.
- Example migration:

```ts
import type { Db } from 'mongodb';
import { Migration } from './types';

const migration: Migration = {
    name: '20260912-add-coupon-usage-fields',
    up: async (db: Db) => { /* forward change */ await db.collection('coupons').updateMany({}, { $set: { used: 0 } }); },
    down: async (db: Db) => { /* rollback */ await db.collection('coupons').updateMany({}, { $unset: { used: '' } }); },
};
export default migration;
```

Notes:
- Restore `--mode replace` requires confirming with `yes` (or `--yes`); it **drops** the target collections first.
- Always back up before applying migrations or doing a replace-restore.

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
- Backend build (typecheck): `cd server && npm run build`
- Frontend typecheck: `cd client && npx tsc -b`
- Frontend: `cd client && npm test`
- E2E: `npx playwright test` (requires frontend dev server running)
  - View report: `npx playwright show-report`
  - Install browsers: `npx playwright install`
