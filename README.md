# Kibandaski

**Order food from your local kibanda — delivered to your door, paid with M-Pesa.**

Kibandaski is a Kenyan food delivery web app that connects customers with neighbourhood kibandas and small restaurants. Browse menus from vendors like Mama Shamim, Zamzam, and Oguna, add items to your cart, and checkout with M-Pesa via Paystack.

## Features

- Browse menus by category (Kuku, Nyama, Chapati, Ugali, Kahawa, Samaki, Healthy)
- Search food in English or Swahili ("Unataka kukula nini?")
- View vendor-specific menus
- Shopping cart with quantity controls
- M-Pesa checkout via Paystack
- **Live order tracking** with status stepper (Pending → Confirmed → Preparing → On the way → Delivered)
- **Favourites** — save foods locally or to your account
- **Ratings & reviews** — rate dishes 1–5 stars
- **Role-based access** — admin, vendor, and customer accounts
- **Vendor portal** — vendors manage only their own menu and orders
- Firebase Authentication (login/register)

### User roles

| Role | Email example | Access |
|------|---------------|--------|
| Admin | `admin@kibandaski.com` | Full platform: all foods, all orders |
| Vendor | `mamashamim@kibandaski.com` | Own kibanda menu + related orders |
| Customer | any other email | Browse, order, track, rate, favourite |

Vendor emails are mapped in `js/roles-config.js`.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | HTML5, CSS3, ES Modules |
| Backend | Firebase (Firestore, Auth, Cloud Functions) |
| Payments | Paystack (M-Pesa / KES) |
| Icons | Ionicons |

## Getting Started

### Prerequisites

- A modern web browser
- Firebase project (`food-ae7ff`) with Firestore enabled
- Optional: [Firebase CLI](https://firebase.google.com/docs/cli) for deployment

### Local Development

Because the app uses ES modules and Firebase CDN imports, serve the files over HTTP (not `file://`):

```bash
npx serve .
```

Then open `http://localhost:3000` (or the port shown).

### Firebase Setup

1. Create a Firestore database with these collections:
   - `foods` — menu items (name, description, price, imageUrl, restaurant, category)
   - `carts` — shopping carts (items array)
   - `orders` — customer orders

2. Deploy the `verifyPayment` Cloud Function (already referenced in checkout).

3. Add Firestore indexes if prompted for compound queries on `orders`.

### Admin

- **Add/manage foods:** `add-food.html`
- **Manage orders:** `admin-orders.html`

## Project Structure

```
├── index.html          # Home — menu, search, recommendations
├── food-detail.html    # Single food item + add to cart
├── restaurant.html     # Vendor menu (?name=VendorName)
├── cart.html           # Shopping cart
├── checkout.html       # Checkout + M-Pesa payment
├── bills.html          # Customer order history
├── auth.html           # Login / register
├── add-food.html       # Admin: food CRUD
├── admin-orders.html   # Admin: order management
├── js/
│   ├── firebase-config.js
│   ├── cart-utils.js
│   ├── auth-utils.js
│   └── app.js
└── style.css
```

## Delivery Fee

Base fee: **Ksh. 15** for orders up to Ksh. 100.  
Above Ksh. 100: +Ksh. 2 for every additional Ksh. 10.

## Brand

**Kibandaski** — *Chakula cha kibanda, delivered.*

## License

MIT
