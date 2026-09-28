# Tamil Food Thaya Platform

A demo-ready restaurant and catering web platform for Tamil / Sri Lankan cuisine.

## 🚀 Key Features

### 🌍 Multilingual Support
- **Dynamic Content**: Seamlessly switch between **English, Dutch, and Tamil** for all menu items, packages, and UI elements.
- **Localized UX**: Demonstrates multilingual administrative workflows while honoring Tamil cultural roots.

### 🍱 Premium Catering system
- **Package Selection**: Tiered packages (Silver, Gold, Platinum) with customizable item selections.
- **Change Request System**: Professional-grade request flow for modifying guests, date, or menu after booking.
- **Robust Quotation**: Automated and manual quote management for large-scale events.

### 💳 Optimized Checkout
- **Smart Pre-fill**: Automatically populates contact info for logged-in users.
- **Override Flexibility**: Allows editing of phone/email during checkout for specific order needs.
- **iDEAL Integration**: Demonstrates localized payment workflows via Stripe.

### 📊 Advanced User Dashboard
- **Granular Status Tracking**: Color-coded badges for all order states (Quoted, Paid, Preparing, Ready, etc.).
- **Dynamic Filtering**: Instant status-based filtering (All, Pending, In Progress, Completed).
- **Notification Management**: Dismissible real-time updates (Email/WhatsApp) for order progress.

## 🛠 Tech Stack
- **Frontend**: React (TypeScript), Tailwind CSS, React Query, Vite, Framer Motion, i18next.
- **Backend**: NestJS (TypeScript), TypeORM, JWT Authentication, Passport, Nodemailer.
- **Database**: PostgreSQL (local Docker or managed Supabase).
- **Payments**: Stripe (iDEAL integration).

## 📂 Project Structure
```text
tamilfooddemo/
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
git clone https://github.com/futurquest/tamilfooddemo.git
cd tamilfooddemo
```

### 2. Prerequisites
- Node.js (v18+)
- PostgreSQL 16 or a compatible managed PostgreSQL database
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
POSTGRES_HOST=127.0.0.1
POSTGRES_PORT=5433
POSTGRES_USER=your_postgres_user
POSTGRES_PASSWORD=your_private_database_password
POSTGRES_DB=tftdb
JWT_SECRET=your_jwt_secret
STRIPE_SECRET_KEY=your_stripe_secret
STRIPE_WEBHOOK_SECRET=your_webhook_secret
CLIENT_URL=http://localhost:5173

# Only needed before creating the first admin account; use a unique value (8+ characters).
INITIAL_ADMIN_PASSWORD=replace_with_a_private_unique_password

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-address@gmail.com
SMTP_PASS=your-16-character-app-password
SMTP_FROM="Tamil Food Thaya <your-address@gmail.com>"
```

For Gmail, enable 2-Step Verification and create a Google App Password. Add the SMTP lines from [server/.env.gmail.example](server/.env.gmail.example) to your existing `server/.env` (do not replace its database or payment settings), then restart the backend. Use the same Gmail address in `SMTP_USER` and `SMTP_FROM`; put the App Password in `SMTP_PASS`, not your normal Google password. Keep `server/.env` private. Email delivery is not guaranteed by a successful API response until SMTP send errors are surfaced by the backend.

Password-reset tokens and verification PINs are sent by email and are never printed to the server console. Configure working SMTP before using these flows; mock email mode does not deliver messages. To create the first admin account, set `INITIAL_ADMIN_PASSWORD` privately to a strong, unique value of at least eight characters before enabling and calling the admin seeding endpoint. The password is never logged.

### Frontend (.env)
```env
VITE_API_BASE_URL=http://localhost:3000
```

## 🗄️ Database Operations

PostgreSQL migration setup and guarded deployment commands are documented in [server/MIGRATIONS.md](server/MIGRATIONS.md). Do not run production migrations until backup and restore verification is complete.

The private, persistent PostgreSQL Compose service is documented in [docs/POSTGRES_DOCKER.md](docs/POSTGRES_DOCKER.md). It does not replace or migrate the existing development database automatically.

Encrypted PostgreSQL backup and restore commands are documented in [server/BACKUPS.md](server/BACKUPS.md).

### Move the local Docker database to Supabase

This one-time procedure copies the 14 application tables and their records from the local `tamilfoodthaya-pg` container (`tftdb` on host port 5433) into an **empty** Supabase `public` schema. It does not change or remove the local database. If Preview and Production use the same Supabase project, treat every write below as a production operation. Obtain approval and schedule a quiet period first. Never run the import against a database that already has application records.

1. **Back up and prove recovery.** From `server/`, set `POSTGRES_*` to the local Docker database. Set `BACKUP_ENCRYPTION_KEY` to a privately stored base64-encoded 32-byte key, and use PostgreSQL client tools (`pg_dump`/`pg_restore`) or `PG_TOOLS_DOCKER_IMAGE=postgres:16` with `PG_TOOLS_DOCKER_HOST=host.docker.internal`. Run:

   ```powershell
   npm run db:backup -- --local-only
   $backupFile = Get-ChildItem .\backups\tft-*.tftbak | Sort-Object LastWriteTime -Descending | Select-Object -First 1
   $env:RESTORE_TEST_DB = "tft_restore_test_$(Get-Date -Format yyyyMMddHHmmss)"
   npm run db:restore:verify -- $backupFile.FullName
   ```

   Continue only after `RESTORE VERIFIED`. Keep the encryption key outside Git; the encrypted backup is unusable without it. See [server/BACKUPS.md](server/BACKUPS.md) for off-server storage requirements.

2. **Connect to the correct Supabase project.** In Supabase **Connect**, select the **Session pooler** (port 5432), not the direct or transaction connection. In the same private PowerShell session, set `POSTGRES_HOST` to the pooler hostname, `POSTGRES_USER` to `postgres.<project-ref>`, `POSTGRES_PORT=5432`, `POSTGRES_DB=postgres`, and `POSTGRES_PASSWORD` to that project's database password. Download its CA certificate from **Settings → Database → SSL Configuration**, then set `POSTGRES_SSL_MODE=require` and `POSTGRES_SSL_CA` to the certificate contents. Do not paste credentials into logs, chat, or committed `.env` files. Run `node scripts/check-supabase-target.cjs`; it must report `public_tables=0`.

3. **Create and secure the schema.** After the restore test, set `NODE_ENV=production`, `CONFIRM_MIGRATION_DATABASE=postgres`, and `RESTORE_TEST_VERIFIED=true`, then run `npm run db:migrate:prod`. The versioned migrations create the tables and revoke Supabase Data API access to application tables. Run `node scripts/check-supabase-target.cjs --after-migration` to confirm the 14 application tables exist. Do not use `synchronize:true` in production.

4. **Check, then copy the records.** Run `node scripts/import-local-to-supabase.cjs` for a read-only dry run. It requires matching columns, an empty target, the migration record, and no `anon`/`authenticated` grants. Only when it reports `Transfer preflight passed`, run `node scripts/import-local-to-supabase.cjs --execute`. The import uses one transaction, checks row counts and menu/category relationships, and refuses a populated target. If it fails, stop and inspect the error; do not blindly rerun it.

5. **Verify before using the app.** The import must report `IMPORT VERIFIED`. Re-run `node scripts/check-supabase-target.cjs --after-migration` and compare Supabase table counts with the local source. Then check the deployed API's `/api/v1/health`, `/api/v1/settings`, and `/api/v1/menu/items`. Do not delete the Docker database or backup, and do not deploy automatically. Menu image URLs may also need migration if they point to local `server/uploads/` files.

Production HTTPS/proxy requirements and untested infrastructure steps are documented in [server/PRODUCTION_HTTP.md](server/PRODUCTION_HTTP.md).

The server runs on **PostgreSQL** via TypeORM. Entities live next to their modules in `server/src/*/entities/` and the schema is kept in sync with `synchronize: true` during development.

### One-time legacy Mongo → Postgres migration
`server/scripts/replay-mongo-to-pg.ts` cold-copies the old MongoDB collections
(`MONGODB_URI`) into the Postgres tables, preserving the 24-hex `_id` primary
keys and jsonb payloads byte-for-byte. It is idempotent (`.orIgnore()`) and safe
to re-run while the server keeps writing.

```bash
npm run db:replay
```

- Every column of the legacy row is materialized; fields the Mongo docs omit fall
  back to the column defaults (`isActive true`, `minOrderAmount 0`, ...).
- Read `MONGODB_URI` and the `POSTGRES_*` vars from `server/.env`.

### Creating a fresh DB
```bash
docker run -d --name tamilfooddemo-pg -p 5433:5432 \
  -e POSTGRES_USER=tft -e POSTGRES_DB=tftdb -e POSTGRES_PASSWORD=tft_dev_pw \
  postgres:16
```

## 💳 Stripe & iDEAL Integration
The platform uses **Stripe Checkout** for secure payments.
1. Enable **iDEAL** in your Stripe Dashboard.
2. Set the `STRIPE_WEBHOOK_SECRET` to receive `checkout.session.completed` events for order confirmation.
3. Success/Cancel URLs are configured in `OrderService`.

## 🚢 Deployment
- **Frontend**: Vercel or Netlify (Point to `client/` directory).
- **Backend**: Railway, Render, or Heroku (Point to `server/` directory).
- **Database**: PostgreSQL (managed, e.g. Railway/Supabase Neon).

## 🧪 Testing
- Backend: `cd server && npm test`
- Backend build (typecheck): `cd server && npm run build`
- Frontend typecheck: `cd client && npx tsc -b`
- Frontend: `cd client && npm test`
- E2E: `npx playwright test` (requires frontend dev server running)
  - View report: `npx playwright show-report`
  - Install browsers: `npx playwright install`
