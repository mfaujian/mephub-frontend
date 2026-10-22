# MEPhub Industrial: Frontend

MEPhub is a marketplace for **mechanical, electrical and plumbing (MEP) supplies**. It serves two kinds of buyers from one catalog:

- **Individuals (B2C):** browse, add to cart, check out in a few clicks.
- **Businesses (B2B):** search by part number (SKU), see volume prices, paste a parts list into **Quick order**, add a PO number, choose a delivery date and request **payment terms**.

This repository is the Next.js frontend. It talks to the Flask REST API in
[multivendor-ecommerce-backend](https://github.com/mfaujian/multivendor-ecommerce-backend)
(live on Railway). Built for the RevoU Full-Stack Software Engineering program, Module 3 (Checkpoints 1 to 3).

## Features

**Everyone**
- Home page with latest products, categories and brands (server component)
- Product list with search (name, SKU, brand), category, brand and sort filters, URL-driven and paginated
- Product detail with specifications table, volume-price table, live line total, datasheet link, made-to-order lead time
- Category listing, Quick order (paste `SKU, quantity` lines), shopping cart saved in `localStorage`

**Customer (role `user`)**
- Register and log in (`/register`, `/login`); the username in the header survives a refresh
- Cart page with quantities, totals, remove buttons, empty state and a disabled checkout button when empty
- Checkout (`/checkout`): saved delivery addresses, PO number, requested delivery date, notes, payment method
  (bank transfer or payment terms). Confirming calls `POST /orders`, clears the cart and opens `/orders`
- Orders list and detail (`/orders`, `/orders/[id]`), cancel a pending order, order again, print
- Address book (`/account/addresses`)

**Admin (role `admin`)**
- Product CRUD at `/dashboard` (`CreateProductForm`, `EditProductForm`), including supplier, SKU, volume pricing and made-to-order; a product in an active order cannot be deleted and the error is shown
- Category CRUD at `/dashboard/categories` (`CreateCategoryForm`); a category with products or subcategories cannot be deleted
- Read-only overview of all orders at `/dashboard/orders`, with search and status filter; order detail has admin actions (status, payment)

**Security and quality**
- Route guards: `ProtectedRoute`, `AdminRoute`, `PublicOnlyRoute`
- Toast notifications (react-hot-toast) for every success and error
- 73 Playwright end-to-end tests

## Technologies

Next.js 16 (App Router, cache components) · React 19 · TypeScript · Tailwind CSS 4 · react-hot-toast ·
Playwright · `next/navigation` (`useRouter`, `usePathname`, `useSearchParams`, `useParams`) ·
`localStorage` (session and cart persistence) · `NEXT_PUBLIC_API_BASE_URL` (API address)

## Folder structure

```
app/            pages and layouts (file-based routes)
components/     reusable UI (forms/, guards/ inside)
context/        AuthContext, CartContext
hooks/          useAuth, useCart, useAsyncData, useDebouncedValue
lib/            api.ts (server), api-client.ts (browser), cart, validation, formatting
types/          shared TypeScript types
tests/          Playwright end-to-end tests
```

## Run it locally

You need Node.js 22+, and the backend running (locally or on Railway) with the MEP demo data loaded.

```bash
git clone https://github.com/mfaujian/mephub-frontend.git
cd mephub-frontend
npm install
cp .env.example .env.local      # then edit the values (see below)
npm run dev                     # http://localhost:3000
```

`.env.local`:

| Variable | Meaning |
| --- | --- |
| `NEXT_PUBLIC_API_BASE_URL` | Address of the Flask API, e.g. `http://localhost:5000` |
| `E2E_ADMIN_EMAIL` / `E2E_ADMIN_PASSWORD` | Admin account used by the tests |
| `E2E_USER_EMAIL` / `E2E_USER_PASSWORD` | Customer account used by the tests |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Optional: enables the "Ask for a quotation on WhatsApp" button |

Never commit `.env.local`. Avoid `#` and `$` in passwords stored in `.env` files.

Demo accounts are created by the backend seeder (`python seed_mephub.py --yes`):
`admin@mephub.id` (admin), `buyer@mephub.id`, `kontraktor@mephub.id`, `e2e.buyer@mephub.id` (customers).

## Run the tests

```bash
npx playwright install chromium   # once
npm run test:e2e                  # builds the app, starts it and runs all tests
npm run test:e2e:report           # open the HTML report
```

The tests use the real backend. They create their own data (unique names and PO numbers), clean up after
themselves and can be repeated. Use a local backend with `RATELIMIT_LOGIN` loosened, see the backend README.

Other scripts: `npm run lint`, `npm run typecheck`, `npm run build`, `npm run start`.

## Screenshots

Save images in `docs/screenshots/` and keep these file names:

| Page | File |
| --- | --- |
| Home | `docs/screenshots/cp3-home.png` |
| Product listing | `docs/screenshots/cp3-products.png` |
| Product detail | `docs/screenshots/cp3-product-detail.png` |
| Category listing | `docs/screenshots/cp3-categories.png` |
| Register | `docs/screenshots/cp3-register.png` |
| Login | `docs/screenshots/cp3-login.png` |
| Admin dashboard | `docs/screenshots/cp3-dashboard.png` |

![Home](docs/screenshots/cp3-home.png)
![Product listing](docs/screenshots/cp3-products.png)
![Product detail](docs/screenshots/cp3-product-detail.png)
![Category listing](docs/screenshots/cp3-categories.png)
![Register](docs/screenshots/cp3-register.png)
![Login](docs/screenshots/cp3-login.png)
![Admin dashboard](docs/screenshots/cp3-dashboard.png)

## Rendering strategy

| Route | Strategy | Why |
| --- | --- | --- |
| `/`, `/products`, `/products/[id]`, `/categories` | Partial prerender: static shell, catalog data streamed from the API | Public data that changes often |
| `/login`, `/register`, `/cart`, `/checkout`, `/quick-order` | Static shell, client-side data | Depends on the browser (`localStorage`) |
| `/orders`, `/orders/[id]`, `/account/addresses` | Static shell, client-side data behind `ProtectedRoute` | Needs the logged-in user's token |
| `/dashboard`, `/dashboard/*` | Static shell, client-side data behind `AdminRoute` | Admin only |

## Notes and limits

- The session token is kept in `localStorage` (simple, required by the course). A production system would use an `HttpOnly` cookie.
- The server is the source of truth for prices, stock and minimum order quantities; the browser only displays them.
- Payment is simulated: bank transfer is marked paid by an admin, payment terms are approved by an admin.
````
