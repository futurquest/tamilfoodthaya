# Safe API security audit — 2026-09-27

Tests used `tft_restore_test_20260927d`, synthetic identities, and small non-destructive requests. `scripts/security-smoke.cjs` refuses other databases/hosts. The upload drill created and removed one synthetic menu record and PNG. No stress test or production request was made. Findings follow [OWASP's mass-assignment guidance](https://cheatsheetseries.owasp.org/cheatsheets/Mass_Assignment_Cheat_Sheet.html) and [file-upload guidance](https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html).

| Class | Status | Evidence / remaining scope |
| --- | --- | --- |
| SQL injection | VERIFIED (sample) | Encoded quote/boolean payload on category route returned zero rows without server error; TypeORM queries inspected as parameterized. No broad fuzzing. |
| XSS | NOT TESTED | No browser-based stored/reflected payload run. React views do not use `dangerouslySetInnerHTML` in source scan. |
| CSRF | NOT TESTED | Bearer-token APIs do not use auth cookies; public write endpoints still need browser-origin review. |
| IDOR/BOLA | VERIFIED (sample) | User A requesting another catering order returned 404. Unverified dashboard users no longer claim guest orders by email. Other resources remain to be sampled. |
| Broken access control / privilege escalation | VERIFIED (sample) | Anonymous profile 401; normal user admin users 403; profile privileged fields 400. |
| Mass assignment | VERIFIED (sample) | Profile DTO allowlist and guest checkout ownership enforcement tested; remaining admin CRUD bodies require DTO review. |
| Brute force / account enumeration | VERIFIED / FAILED | Login rate limit reached 429. Registration 409 and reset-email delivery behavior can still disclose account existence. Shared rate limiting is absent. |
| Malicious upload / path traversal | VERIFIED (sample) / NOT TESTED | Fake PNG returned 400 with no file; valid PNG was served and test artifacts removed. Random server filenames prevent client filename use; path traversal not fuzzed. |
| SSRF / open redirect | NOT TESTED | No user-controlled server fetch or redirect identified in source scan; Stripe checkout URL is returned to the client. |
| Prototype pollution | NOT TESTED | Profile allowlist rejects unexpected fields; remaining `any` admin bodies need review. |
| Body flooding / upload size | VERIFIED (bounded) | 105 KB JSON returned 413; 2 MB upload cap and multipart field/part caps configured. No DoS testing. |
| CORS / clickjacking | VERIFIED (sample) | Hostile Origin received no allow-origin header; frame header was `SAMEORIGIN`. |
| Host header | NOT TESTED | Production upload URLs now require `PUBLIC_API_URL` instead of request Host. Deployment value not configured/tested. |
| Sensitive-data exposure | VERIFIED (sample) | Oversized-request response did not expose a stack, dependency path, or DB-password variable. Full error-body and log audit remains. |
| Dependency vulnerabilities | VERIFIED (installed tree) | `npm audit --omit=dev --audit-level=high` found zero after Nest upload adapter and Nodemailer upgrades. Recheck at deploy time. |

Production remains blocked by the authentication and backup gaps in `AUTH_SECURITY.md` and `BACKUPS.md`, plus untested classes above. Do not infer full OWASP coverage from a sampled pass.
