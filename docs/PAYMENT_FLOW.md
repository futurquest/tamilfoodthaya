# Payment Flow - Tamil Food Thaya

Implementation using **Stripe Checkout** with **iDEAL** integration.

## 🔄 Interaction Diagram

1. **Client**: User clicks "Afrekenen" (Checkout).
2. **Server (MongoDB Transaction)**: A `session.withTransaction()` block begins. It checks and validates real-time `stockCount`, locking quantities natively. It creates a `PENDING` order in MongoDB.
3. **Server (Strategy Pattern)**: Delegates the underlying API request to the `PaymentGatewayFactory` (to handle iDEAL vs cards transparently).
4. **Server**: Returns Stripe Session URL to Client and safely commits the `PENDING` order DB transaction. (If stripe fails, the DB state inherently rolls back to preserve stock).
5. **Client**: Redirects User to Stripe secure payment page.
6. **User**: Completes payment via iDEAL or Card.
7. **Stripe**: Redirects User back to `CLIENT_URL/order-success`.
8. **Stripe (Async)**: Sends `checkout.session.completed` webhook to `SERVER_URL/orders/webhook`.
9. **Server (MongoDB Transaction)**: Verifies signature, initiates atomic `session.withTransaction()`, updates Order status to `PAID`, deduces `stockCount` atomically, commits transaction, and triggers notifications.

## 🛠 Configuration

### Stripe Dashboard
- Enable **iDEAL** in payment methods.
- Set up a Webhook endpoint: `https://your-api.com/orders/webhook`.
- Subscribe to `checkout.session.completed`.

### Webhook Handling (`OrderService`)
The webhook handler uses `stripe.webhooks.constructEvent` to verify that the request authenticately came from Stripe.

```typescript
// Important: raw body is required for verification
const event = stripe.webhooks.constructEvent(payload, sig, endpointSecret);
```

## ⚠️ Atomicity & Error Handling
- **Failed Payment**: If the user cancels or payment fails, they are redirected to `CLIENT_URL/cart` with an error message.
- **Stock Lock (ACID Transactions)**: Items are physically validated in a synchronized Mongoose `ClientSession` block, and their stocks are permanently reduced synchronously during the asynchronous Webhook processing phase.
- **Retry Logic**: Stripe automatically retries webhook delivery if the server is down. Transactions guarantee partial data cascades are impossible.
