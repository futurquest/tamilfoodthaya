# Frontend Component Documentation - Tamil Food Thaya

The frontend is built with **React** using a modular component architecture.

## 🏗 Component Hierarchy

```text
App
├── Header
│   └── CartDrawer
├── Layout (Public/Admin)
├── Pages
│   ├── HomePage
│   │   ├── Hero
│   │   ├── FeatureItem
│   │   └── HighlightCard
│   ├── MenuPage
│   │   └── Card
│   ├── CheckoutPage
│   │   └── InputField
│   └── Admin/Dashboard
│       ├── StatCard
│       └── TableRow
└── Footer
```

## 🧩 UI Components (Shared)

### `Button`
- **Props**:
  - `variant`: `primary`, `secondary`, `outline`, `ghost`.
  - `size`: `sm`, `md`, `lg`.
- **Usage**:
  ```tsx
  <Button variant="primary" onClick={handleOrder}>Bestel Nu</Button>
  ```

### `Card` / `CardContent`
- **Description**: Standardized container for menu items and dashboard stats.
- **Usage**:
  ```tsx
  <Card>
    <CardHeader>Title</CardHeader>
    <CardContent>Content here...</CardContent>
  </Card>
  ```

### `Container`
- **Description**: Limits content width to `7xl` and adds responsive padding.

## 📦 State Management

### `CartContext`
- Manages the ordering state globally.
- Persists to `localStorage`.
- Methods: `addToCart`, `removeFromCart`, `updateQuantity`, `clearCart`.

### `AuthContext`
- Manages JWT tokens and user roles for the Admin panel.
- Exports `isAdmin` helper.

## 🎨 Styles
- **Tailwind CSS**: Used for all styling.
- **Utility Method (`cn`)**: Combines classes using `clsx` and `tailwind-merge`.
