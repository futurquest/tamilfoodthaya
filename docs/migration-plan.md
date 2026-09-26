# Mongo → Postgres migration — execution plan (server)

Status: **IN PROGRESS, module-by-module.** Reference pattern proven & committed
(menu + coupon); remaining modules follow the identical unit shape.

---

## 1. End state (what "done" means)

- Every Mongoose `Model`/`Schema` removed from `server/src`; `@nestjs/mongoose` +
  `mongoose` deps dropped from `package.json`.
- Every module uses TypeORM `Repository<T>` against the disposable PG sandbox
  (`127.0.0.1:5433`, db `tftdb`) as the default `DataSource`.
- The exact JSON payloads today's Mongoose API emits (menu item `_id`, coupon
  `_id` + `code` + `discountType`, order `_id` + `status`, user `_id` + `role`,
  JWT `sub`, Dashboard aggregate) stay **byte-identical** — no JWT, guard,
  controller-route, DTO-field or client changes. This is the hard invariant.
- Server builds green (`npm run build`) at **every** commit.
- A one-time replay script reads live Mongo `tamilfooddemo-database-1` and
  writes the same docs into PG (24-hex `_id` varchar PKs, same jsonb columns),
  preserving all live admin products + orders.

## 2. Why it's module-by-module, not one big dump

- Each unit is self-contained: entity (1:1 from its Mongo schema), a
  compile-first `module.ts`, then write the service against `Repository<T>`,
  build, and only then wire the controller/DTO casts. Every step keeps the
  previous modules bootable.
- NestJS autoloads entities per-feature (`TypeOrmModule.forFeature`), so a
  module being converted never unregisters a model another module still injects.
  It is not possible, within one module, to break the modules that still run on
  Mongo simply by converting it — the DBs coexist during the transition.

## 3. Module order (dependency-aware, largest/deepest first)

1. **auth / user** — linchpin. JWT strategy + `@Roles()`/`@RolesGuard` read the
   `User.role`; `UserService.getDashboardData` aggregates CateringOrder, Order,
   NotificationLog. Needs`user`entity + cross-module injects as entities.
2. **auth strategies** — rewrite `jwt.strategy.ts` + `user.service` aggregate
   against entity repos; keep the `validate(id)→{userId,_id,role}` shape.
3. **order** — Order + OrderItem entities, status enum, Stripe webhook session
   transaction (maps `createCheckoutSession` → `REPOSITORY.transaction`),
   stock decrement on payment, order-status events (`event-emitter`).
4. **addon** — pull-down/`choices` 1:1.
5. **catering** — CateringOrder + quote + package + change-request, customerInfo
   (email/phone/name) join.
6. **lead** — Lead + `customerInfo`.
7. **message** — Message + `customerInfo`.
8. **settings** — key/value single row + typed getters.
9. **notification** — NotificationLog + NotificationService event wiring.
10. **health** — PG `SELECT 1` (replaces Mongo `ping`).
11. **seed** — initial admin + menu fixture replay from legacy seed data.
12. **backup / restore / migrate** — PG-dump based; `db/connection.ts` flips to
    the TypeORM DataSource; one-time `replay-mongo-to-pg` script.

## 4. The one-time data replay (live Mongo → PG)

Written as `server/scripts/replay-mongo-to-pg.ts` (Node, run once, verbose):

1. Connect to live Mongo via `mongoose` (existing `MONGODB_URI`) on
   `tamilfooddemo-database-1` (port 27017).
2. Connect the TypeORM DataSource to the sandbox PG (5433).
3. Enumerate `User`, `Category`, `MenuItem`, `Order`, `CateringOrder`, `Coupon`,
   `Addon`, `Lead`, `Message`, `Settings`, `NotificationLog` collections.
4. For each doc: keep `_id` as-is (24-hex), flatten sub-docs (`nameTranslations`
   etc.) into the exact jsonb column shape, insert with
   `INSERT ... ON CONFLICT (_id) DO UPDATE` (idempotent — safe to re-run).
5. Log per-collection counts + failures; abort nonzero on any insert error.

Run order on the live box: replay → admin re-validates a SAMPLED order/coupon →
compare JSON vs the old API → only then drop the Mongo readonly path.

## 5. Risk controls

- **Verify every write:** `npm run build` after each module; `git diff --stat`
  before every commit.
- **Never author a module I have not read end-to-end** first (no guessing field
  shapes in the MVP ~15 modules).
- **No client changes** — the API is the contract; the client is untouched.
- **Keep Mongo writable during transition** — PG is the new source of truth for
  converted modules; the OLD overlap modules still write to Mongo until their
  last converter commit. Do not tear down `tamilfooddemo-database-1` until the
  final module + replay pass.

## 6. Definition of done for this task

- `server` builds, `nest start` boots with zero Mongoose imports left in `src`.
- The 3 probe endpoints (menu items, validate coupon, order dashboards) respond
  with identical JSON to today.
- `replay-mongo-to-pg.ts` idempotently copies the live data to PG and reports
  per-collection deltas.

---

Reviewed and approved — flip remaining modules one file at a time, green per
commit.
