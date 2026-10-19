# Sweet Bloom: Frontend

Next.js 16 (App Router, Turbopack) storefront and admin panel for Sweet Bloom. It consumes the REST API in `../backend`.

## Stack

Next.js 16 · React · TypeScript · Tailwind CSS v4 · zustand · lucide-react · `next/image` (ImageKit)

## Setup

```bash
npm install
```

Create `.env.local`:

| Variable | Description | Example |
| --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | Base URL of the backend API, with `/api` | `http://localhost:4000/api` |

> Check the exact variable name your `src/lib/api.ts` reads and keep it identical here and in the hosting dashboard.

## Scripts

```bash
npm run dev     # http://localhost:3000
npm run build   # production build (also type-checks)
npm start       # serve the production build
npm run lint
```

## Routes

**Storefront** (`src/app/(site)/`)

| Route | Page |
| --- | --- |
| `/` | Home |
| `/shop` | Catalogue with filters in the URL |
| `/shop/[slug]` | Product page, variants, reviews |
| `/checkout` | Guest checkout, cash on delivery |
| `/order-confirmed` | Confirmation |
| `/custom-cakes` | Custom cake request form |
| `/contact` | Phone, WhatsApp, map, hours |

**Admin** (`src/app/admin/`), JWT-protected

| Route | Page |
| --- | --- |
| `/admin/login` | Sign in |
| `/admin` | Dashboard |
| `/admin/orders`, `/admin/orders/[id]` | Orders and status |
| `/admin/products`, `/new`, `/[id]` | Products and image upload |
| `/admin/categories` | Categories |
| `/admin/reviews` | Review moderation |
| `/admin/custom-requests` | Custom cake requests |
| `/admin/coupons` | Coupons |
| `/admin/delivery-zones` | Delivery fees per wilaya |

## Structure

```
src/
├── app/
│   ├── (site)/          public pages + layout (Navbar, Footer, CartDrawer)
│   └── admin/           login/ and (panel)/ with the AdminShell guard
├── components/          storefront components
│   └── admin/           admin views and forms
├── lib/
│   ├── api.ts           public API client and types
│   ├── admin-api.ts     admin API client (Bearer token)
│   ├── format.ts        formatDA → "4,500 DA"
│   ├── badges.ts        product badge labels
│   └── site.ts          phone, WhatsApp, address, hours
└── store/cart.ts        zustand cart (localStorage: sweet-bloom-cart)
```

## Conventions

- **Design tokens** live in `src/app/globals.css` (`@theme inline`): cream, berry, blush, caramel, pistachio, cocoa. Fonts: Playfair Display (headings) and DM Sans (body).
- **Prerendering rules (Next 16):** no `new Date()` in Server Components; wrap `usePathname`/`useSearchParams` consumers in `<Suspense>`; wrap data fetching and `await params` in a Suspense child of a sync page.
- **Cart:** stores display prices only. The server recomputes totals.
- **Admin auth:** JWT in `localStorage` (`sb-admin-token`). A 401 clears it and redirects to `/admin/login`.
- Admin pages are `noindex`.

## Deployment (Vercel)

1. Import the repo and set **Root Directory** to `frontend`.
2. Add `NEXT_PUBLIC_API_URL` (production API URL).
3. Add the production domain to the backend CORS origin.
4. Product images load from `ik.imagekit.io`, already allowed in `next.config`.