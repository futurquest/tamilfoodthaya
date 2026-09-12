# Tamil Food Thaya Design System

## Direction

Tamil Food Thaya should feel like a professional traditional Tamil kitchen for people who care about familiar flavour, ceremony, and hospitality. The public site uses a clean restaurant-commerce language: confident Manrope headings, warm rice-paper surfaces, deep aubergine sections, brass CTAs, and banana-leaf green support accents.

## Audience

Traditional food lovers, Tamil and Sri Lankan families in the Netherlands, office hosts, wedding planners, and customers looking for trustworthy takeaway or catering.

## Page Strategy

- Home: communicate the offer within seconds, prove tradition and event capability, route to menu or catering.
- Menu: support fast discovery with search, categories, clear dish cards, and visible dietary/spice markers.
- Catering: sell confidence through event use cases, process clarity, package cards, add-ons, and direct booking.
- Contact: reduce inquiry friction with clear contact details, useful prompts, and short form validation.
- Checkout: keep forms focused, totals legible, and payment assurance visible.

## Visual Tokens

- Ink: `#251917`
- Paper: `#fbf6ed`
- Aubergine: `#1d1216`
- Brass: `#c9972b`
- Spice: `#8a2e1d`
- Banana leaf: `#39533b`
- Display font: Manrope
- UI/body font: Manrope with `system-ui`, `-apple-system`, `BlinkMacSystemFont`, and `Segoe UI` fallbacks
- Tamil script support: Noto Sans Tamil
- Every page and embedded component must use `var(--font-display)` and `var(--font-sans)` instead of importing or hardcoding alternate typefaces.

## Components

- Cards use one rounded 16px surface with restrained warm shadow and no nested card treatment.
- Primary CTAs use brass-to-spice gradient and concrete action copy.
- Secondary actions use rice-paper surfaces and ink text.
- Page heroes use food photography with deep overlay, large direct headlines, and short supporting copy.
- Navigation always shows active route and keeps `Order food` visible on desktop.

## Quality Rules

- No decorative blobs, generic hero metrics, or gradient text.
- Meaningful food imagery must have local fallbacks.
- Mobile pages must keep CTAs visible and forms single-column.
- Form errors must be inline and direct.
- Public pages should answer: what is offered, who it is for, why it matters, and what to do next.
