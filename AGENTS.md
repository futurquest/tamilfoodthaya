# Repository Guidelines

## Project Structure & Module Organization

`client/` is the React, TypeScript, and Vite storefront and admin console. Pages live in `client/src/pages/`, reusable UI in `client/src/components/`, API calls in `client/src/hooks/useApi.ts`, and translations in `client/public/locales/{en,nl,ta}/`. `server/` is the NestJS API; each feature has its own folder under `server/src/` (for example, `order/` and `catering/`). Static images are in `client/public/`. `docs/` contains product and API notes; browser tests are in `tests/e2e/`.

## Build, Test, and Development Commands

Run commands from the indicated directory:

- `cd client; npm run dev` starts Vite. `npm run build` type-checks, bundles, and generates SEO files.
- `cd server; npm run start:dev` starts the API in watch mode. `npm run build` compiles the NestJS application.
- `cd client; npm test` runs Vitest; `cd server; npm test -- --runInBand` runs Jest.
- `cd client; npm run lint` checks frontend code. `cd server; npm run format` formats backend source; server lint uses `--fix`, so review its changes.
- From the repository root, `npx playwright test` runs browser tests against Vite on port 5173.

The API expects PostgreSQL and listens on port 3000 by default. Keep one backend watcher running at a time.

## Coding Style & Naming Conventions

Use TypeScript throughout. Follow the surrounding file's indentation and run the relevant formatter or linter before a PR. React components and pages use PascalCase (`CheckoutPage.tsx`); hooks and utilities use camelCase (`useApi.ts`). NestJS files use feature names and roles (`order.service.ts`, `order.controller.ts`, `create-menu-item.dto.ts`). Prefer shared UI and semantic theme tokens over new one-off styles. Add user-facing copy to all three locale files.

## Testing Guidelines

Keep unit tests beside implementation as `*.spec.ts` or `*.spec.tsx`; use `tests/e2e/*.spec.ts` for browser flows. Cover changed validation and order/payment behavior with focused tests. Run both builds and the relevant tests before requesting review. No fixed coverage threshold is configured.

## Commit & Pull Request Guidelines

Recent commits use short imperative subjects, often `fix: ...` or `bug: ...`; use a concise `type: description` subject for new commits. A PR should explain behavior changed, include test commands and results, link the related issue when available, and attach desktop/mobile screenshots for visible UI changes.

## Security & Configuration

Use local `.env` files for database, JWT, and Stripe settings; never commit real credentials. Checkout needs a valid Stripe secret and webhook secret. Do not rely on the placeholder values in example configuration.
