# Database Schema - Tamil Food Thaya

Built with MongoDB & Mongoose.

## 📁 Menu Module

### Category
- `name` (String): Display name.
- `type` (Enum): `VEG`, `NON_VEG`, `DRINKS`.
- `order` (Number): Sorting weight.

### MenuItem
- `name` (String): Item name.
- `description` (String): Description.
- `price` (Number): In EUR.
- `image` (String): URL.
- `categoryId` (ObjectId): Ref -> Category.
- `spiceLevel` (Number): 0-3.
- `available` (Boolean): Master toggle.
- `stockCount` (Number): Daily inventory.
- `dailyAvailability` (Boolean): Reset daily toggle.

## 🛒 Order Module

### Order
- `items`: Array of objects (menuItemId, name, quantity, price, spiceLevel).
- `total` (Number): Final amount.
- `status` (Enum): `PENDING`, `PAID`, `PREPARING`, `READY`, `COMPLETED`, `CANCELLED`.
- `pickupTime` (Date): Selected slot.
- `customerInfo`: Object (name, email, phone, notes).
- `paymentStatus` (String): `unpaid`, `paid`.
- `stripeSessionId` (String): For tracking.
- `utmSource` (String): Attribution.

## 🍱 Catering Module

### CateringQuote
- `name`, `email`, `phone` (Strings).
- `eventDate` (Date).
- `guests` (Number).
- `location` (String).
- `budgetRange`, `eventType`, `notes` (Strings).
- `utmSource`, `campaign` (Strings).

### CateringPackage
- `name` (String): Silver, Gold, Platinum.
- `pricePerPerson` (Number).
- `minGuests` (Number).
- `inclusions` (Array of Strings).

## 👤 Auth Module

### User
- `username` (String): Unique.
- `password` (String): Hashed (Bcrypt).
- `role` (Enum): `ADMIN`, `STAFF`.
