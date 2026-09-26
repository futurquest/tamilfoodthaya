# Catering UX and SEO

The four public pages now route visitors to catering packages and the enquiry form. New calls to action and event fields support Dutch, English and Tamil. Account and admin pages remain task-focused.

Implemented: responsive headings and content-sized sections; visible-by-default motion; a food-led home hero; accessible mobile navigation, menu filters and form errors; optional event date, guest count and location; persistent enquiry results; recoverable customer dashboard errors; lazy-loaded account/admin routes; canonical URLs, social metadata, document language, conservative Organization structured data, private-route noindex, generated route HTML metadata, sitemap and robots.txt. Public contact details and hours use settings instead of placeholders.

## Deployment

- Run `npm run build --prefix client`. Deploy the entire `client/dist` directory, including route directories, `sitemap.xml` and `robots.txt`.
- Set `VITE_SITE_URL` before building for the deployment origin. Configure `VITE_API_BASE_URL` for the backend.
- Serve existing route HTML before the SPA fallback, for example Nginx `try_files $uri $uri/index.html /index.html`. Rewriting every request to the root index discards page-specific social metadata.
- Configure `X-Robots-Tag: noindex, follow` for `/admin/*`, `/dashboard`, `/login`, `/register`, `/verify-email`, `/checkout` and `/catering/checkout/*`. Fixed private routes also have generated noindex HTML; dynamic checkout routes receive client-side noindex and should receive this header too.
- Verify the address, phone, email, hours and social links in admin settings. Confirm existing marketing claims and package availability against the real service.
- Submit the sitemap in Search Console, inspect rendered public URLs, validate structured data and measure Core Web Vitals after deployment.

## Verification and limits

Browser regression coverage lives in `tests/e2e/landing.spec.ts`. API responses are mocked; tests do not create real enquiries or bookings. Coverage includes public pages at phone, tablet and desktop widths, enquiry failure/retry/success, menu search, catering navigation, private dashboard indexing, Tamil document language and mobile menu keyboard behaviour.

Page metadata is present in built HTML, but page content still renders with JavaScript; this is not full server-side rendering. Languages share URLs, so language-specific hreflang links have deliberately not been invented. Live indexing, ranking, payment, email delivery and conversion rates have not been verified.

The original `tests/e2e/ordering.spec.ts` targets retired cart and inline catering-form controls. The new landing tests cover the current enquiry flow. The build reports an entry-bundle size advisory; further optimization should be guided by deployed performance measurements.

SEO reference: [Google's JavaScript SEO guidance](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics).
