# Authentication security review

The JWT format and one-hour expiry are unchanged. New password-reset tokens are random, stored as SHA-256 hashes, expire after one hour, and are consumed with a conditional update so concurrent reuse fails. Still-valid legacy plaintext reset tokens are accepted until they expire. Email-verification PINs are six-digit cryptographic values, expire after one hour, and are cleared after verification. Production admin seeding is disabled even if `ALLOW_ADMIN_SEED=true` is set.

Local test-database API checks on 2026-09-27: unauthenticated profile request returned 401; synthetic user registration/login and profile returned success; a normal user calling the admin users endpoint received 403; an expired JWT returned 401; repeated incorrect logins reached 429 after the configured per-IP limit. The server unit suite and build passed. SMTP delivery was **not** verified; an attempted configured-SMTP registration stalled until stopped, so the smoke test used mock mail.

Known limitations before production:

- Logout only removes the browser's local token; already-issued JWTs remain valid until expiry. Server-side revocation requires a deliberate token-version or revocation-store migration.
- Existing unverified accounts can log in. Enforcing verification would affect current users and needs a migration and recovery flow.
- Duplicate registration returns 409, which can reveal account existence. Password-reset delivery failures can also differ between existing and nonexistent addresses. Both require a UX-compatible account-enumeration design.
- Rate limits are per IP in process memory, not a shared store across instances. Use a shared limiter and trusted proxy configuration for multi-instance production.
- Email delivery and a recovery path for an account created before a failed verification email need integration testing with real SMTP. Configure and test SMTP before enabling production registration and reset.
