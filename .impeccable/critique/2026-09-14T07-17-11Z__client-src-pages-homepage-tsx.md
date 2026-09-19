---
target: client/src/pages/HomePage.tsx
total_score: 19
max_score: 32
na_heuristics: 7,10
p0_count: 0
p1_count: 3
p2_count: 2
target_identity: "file:C:\\Users\\thanu\\Documents\\tamilfoodthaya\\client\\src\\pages\\HomePage.tsx"
target_fingerprint: "sha256:aad39bc0ca96a819453f08d8994d8b78dd32421a9059dddd2be81f57ccfea74e"
target_path: "C:\\Users\\thanu\\Documents\\tamilfoodthaya\\client\\src\\pages\\HomePage.tsx"
timestamp: 2026-09-14T07-17-11Z
slug: client-src-pages-homepage-tsx
---
### Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 2 | Package/menu loading skeletons present; missing language-switch feedback; dish modal has no price/state indicator |
| 2 | Match Between System and Real World | 3 | Excellent Tamil dish vocabulary; proof metrics "40+" is vague |
| 3 | User Control and Freedom | 2 | No escape from premature booking path; dish modal lacks Esc key; back/forward works |
| 4 | Consistency and Standards | 2 | English strings leak through on a Dutch-first site (FeaturedPackagesSection headings, fallback dish/category names, "Most requested" badge) |
| 5 | Error Prevention | 2 | Package empty state gracefully handled; but "Book" jumps to checkout with no date/guest guardrail |
| 6 | Recognition Rather Than Recall | 3 | All primary actions visible; dish details on tap; header nav clear |
| 7 | Flexibility and Efficiency | n/a | Persuade surface |
| 8 | Aesthetic and Minimalist Design | 2 | Mostly clean; hero proof strip is generic metrics; menu-board motif strong but hidden on mobile |
| 9 | Error Recovery | 3 | Empty packages panel with "Request a quote" CTA is effective recovery |
| 10 | Help and Documentation | n/a | Persuade surface |
| **Total** | | **19/32** | **Acceptable** |

### Design Specificity Verdict

Above-average specificity — Tamil dish vocabulary, brass/aubergine palette, hero menu-board panel, and wedding/celebration language are unmistakably Tamil Food Thaya. Weaker on mobile where the distinctive board is hidden and the layout falls into standard single-column territory.

### Priority Issues

**[P1] i18n leak: English strings on a Dutch-first site** — FeaturedPackagesSection headings, fallback dish/category names, and "Most requested" badge are hardcoded English while `fallbackLng` is `nl`.

**[P1] Mobile conversion path broken: "Order food" hidden, hero CTAs below fold** — `site-order` display:none below 980px; hero CTAs require significant scrolling on phones.

**[P1] Primary CTA contrast fails WCAG AA** — `.btn-primary` cream-on-brass gradient produces ~2.1:1 contrast (minimum 4.5:1 needed).

**[P2] Dish preview modal: no price, no cart, no keyboard escape** — Modal shows description only; no Esc handler, no focus trap, no price.

**[P2] ScrollReveal is inert — no visual animation** — `.scroll-reveal` base sets `opacity: 1; transform: none;` with no hidden initial state.

### Persona Red Flags

**Jordan**: "Order food" invisible on mobile; dish modal shows no price; two hero CTAs target same /menu path.

**Casey**: Hero CTAs below fold on phones; no sticky CTA; dish modal has no quick-exit.

**Riley**: Language switching leaves English strings; `debug: true` in i18n.ts; modal lacks Esc.

### Minor Observations

- `debug: true` in i18n.ts; "safes" typo; hero proof "25-500" units-less; dead Footer.tsx with mojibake; two same-target hero/header CTAs; unverifiable trust claims.
