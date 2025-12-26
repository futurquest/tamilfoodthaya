# Payment Flow - Tamil Food Thaya

Implementation using **Stripe Checkout** with **iDEAL** integration.

## 🔄 Interaction Diagram

1. **Client**: User clicks "Afrekenen" (Checkout).
2. **Server**: Checks inventory, creates a `PENDING` order in MongoDB.
3. **Server**: Calls Stripe API to create a `CheckoutSession` (methods: `ideal`, `card`).
4. **Server**: Returns Stripe Session URL to Client.
5. **Client**: Redirects User to Stripe secure payment page.
6. **User**: Completes payment via iDEAL or Card.
7. **Stripe**: Redirects User back to `CLIENT_URL/order-success`.
8. **Stripe (Async)**: Sends `checkout.session.completed` webhook to `SERVER_URL/orders/webhook`.
9. **Server**: Verifies signature, updates Order status to `PAID`, triggers notifications.

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

## ⚠️ Error Handling
- **Failed Payment**: If the user cancels or payment fails, they are redirected to `CLIENT_URL/cart` with an error message.
- **Stock Lock**: Items are not removed from stock until the `PAID` status is reached (Webhook).
- **Retry Logic**: Stripe automatically retries webhook delivery if the server is down.
