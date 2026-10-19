# Sweet Bloom 🌸

Full-stack e-commerce site for an artisan dessert shop in Laghouat, Algeria: cakes, cookies and pastries, ordered by guests with **cash on delivery** and priced in **Algerian dinars (DA)**.

- **Storefront:** browse, filter, product pages with variants, cart, checkout, custom cake requests, reviews.
- **Admin panel:** dashboard, orders, products with image upload, categories, reviews moderation, custom requests, coupons, delivery zones.
- No customer accounts. Only the admin logs in.

## Repository layout

```
sweet-bloom/
├── backend/    REST API: Node, Express, TypeScript, Prisma, Neon (PostgreSQL), ImageKit
├── frontend/   Next.js 16 app (storefront + /admin panel)
└── README.md   this file
```

Each part has its own README with setup details:

- [backend/README.md](backend/README.md): environment variables, scripts, full API reference.
- [frontend/README.md](frontend/README.md): environment variables, scripts, routes, structure.

## Tech stack

| Layer | Technology |
| --- | --- |
| Frontend | Next.js 16 (App Router), React, TypeScript, Tailwind CSS v4, zustand, lucide-react |
| Backend | Node.js, Express, TypeScript, Zod, JWT |
| Database | PostgreSQL on Neon, Prisma ORM |
| Images | ImageKit |
| Design | Google Stitch ("Artisan Confectionery & Pastry Studio") |

## Quick start (local)

Requirements: Node.js 20+, a Neon database, an ImageKit account.

```bash
# 1. Backend (http://localhost:4000)
cd backend
npm install
# create .env from the table in backend/README.md
npx prisma migrate dev
npm run seed
npm run dev

# 2. Frontend (http://localhost:3000), in a second terminal
cd frontend
npm install
# create .env.local from frontend/README.md
npm run dev
```

- Storefront: http://localhost:3000
- Admin: http://localhost:3000/admin/login (credentials come from `ADMIN_EMAIL` / `ADMIN_PASSWORD` in the backend `.env`, created by `npm run seed`)

## How the two parts talk

- The frontend calls the API at `NEXT_PUBLIC_API_URL` (default `http://localhost:4000/api`).
- Prices are **never trusted from the browser**: the server recomputes every total in `/api/orders/quote` and `/api/orders`.
- The admin token is a JWT stored in the browser (`sb-admin-token`) and sent as a Bearer header.
- CORS on the backend must allow the frontend origin (see Deployment).

## Deployment

| Part | Suggested host | Notes |
| --- | --- | --- |
| Backend | Render or Railway | Build: `npm install && npx prisma generate && npm run build`. Start: `npm start`. Set all `.env` variables in the host dashboard. |
| Frontend | Vercel | Root directory `frontend`. Set `NEXT_PUBLIC_API_URL` to the deployed API URL. |

Checklist:

1. Deploy the backend, then run `npx prisma migrate deploy` against the production database.
2. Set the backend CORS origin (`src/app.ts`) to the real frontend domain.
3. Deploy the frontend with `NEXT_PUBLIC_API_URL=https://<api-domain>/api`.
4. Change the admin password and use a fresh `JWT_SECRET` in production.
5. Never commit `.env` files.

## Business rules in short

- Payment: cash on delivery only. No tax.
- Money is stored as integer DA.
- Cancelling an order restores stock and releases the coupon use.
- Delivering an order marks it as paid.
- Reviews and products can be hidden instead of deleted, so old orders stay intact.

## Contact

Sweet Bloom, Cité El Wafaa, Laghouat, Algeria.
Built by [Khaled Oudenani](https://khaled-oudenani.vercel.app).