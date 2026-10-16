# Sweet Bloom API

REST API for **Sweet Bloom**, a dessert shop (cakes, cookies, macarons, brownies, pastries).
Guest checkout with **cash on delivery (COD)**, an admin dashboard API, images hosted on ImageKit.

- **Stack:** Node.js · Express · TypeScript · PostgreSQL (Neon) · Prisma · Zod · JWT
- **Currency:** DZD. All prices are **integers** (no decimals).
- **Auth:** admin only (JWT). Customers never log in; they order as guests.

---

## Table of contents

1. [Getting started](#getting-started)
2. [Conventions](#conventions)
3. [Enums](#enums)
4. [Public endpoints](#public-endpoints)
5. [Authentication](#authentication)
6. [Admin endpoints](#admin-endpoints)
7. [Business rules](#business-rules)
8. [Rate limits](#rate-limits)
9. [Frontend integration notes](#frontend-integration-notes)

---

## Getting started

### Environment variables (`.env`)

| Variable | Description |
| --- | --- |
| `PORT` | Server port (default `4000`) |
| `DATABASE_URL` | Neon **pooled** connection string (contains `-pooler`) |
| `DIRECT_URL` | Neon **direct** connection string, used by migrations |
| `JWT_SECRET` | Long random string used to sign admin tokens |
| `ADMIN_EMAIL` | Admin email created by the seed |
| `ADMIN_PASSWORD` | Admin password created by the seed (stored hashed) |
| `IMAGEKIT_PRIVATE_KEY` | ImageKit private key (server side only) |

Never commit `.env`. Generate a secret with:
`node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`

### Scripts

```bash
npm install
npx prisma migrate dev     # apply migrations
npm run seed               # admin, categories, sample products, zones, BLOOM20 coupon
npm run dev                # http://localhost:4000
npm run studio             # Prisma Studio (DB browser)
npm run build && npm start # production build
```

### Project structure

```
prisma/            schema.prisma, migrations, seed.ts
src/
  config/          prisma client, imagekit client
  controllers/     request handlers
  middlewares/     auth (JWT), upload (multer)
  routes/          route definitions
  schemas/         Zod schemas (orders, shared)
  services/        order pricing + creation (transactional)
  utils/           HttpError, slugify, pagination
  app.ts           express app + error handler
  server.ts        entry point
```

---

## Conventions

**Base URL:** `http://localhost:4000/api`

**Success responses**

```json
{ "data": { }, "meta": { "page": 1, "limit": 8, "total": 6, "totalPages": 1 } }
```

`meta` appears on paginated lists. Deletes return `204 No Content`.

**Error responses**

```json
{ "message": "Validation error", "errors": [ { "path": ["phone"], "message": "Invalid Algerian phone number" } ] }
```

| Status | Meaning |
| --- | --- |
| `400` | Validation error or business rule failure (bad coupon, wilaya not served, ...) |
| `401` | Missing, invalid or expired admin token |
| `404` | Resource not found |
| `409` | Conflict (duplicate slug/code, out of stock, cancelled order) |
| `429` | Rate limit exceeded |
| `500` | Unexpected server error |

**Admin requests** need the header `Authorization: Bearer <token>`.

**Pagination:** `?page=1&limit=20`.

**Phone numbers:** Algerian mobile format `05XXXXXXXX`, `06XXXXXXXX`, `07XXXXXXXX` or `+213...`. Spaces, dots and dashes are stripped.

---

## Enums

| Enum | Values |
| --- | --- |
| `ProductBadge` | `BESTSELLER`, `NEW`, `CHEFS_PICK`, `POPULAR`, `LIMITED` |
| `OrderStatus` | `PENDING`, `CONFIRMED`, `PREPARING`, `OUT_FOR_DELIVERY`, `DELIVERED`, `CANCELLED`, `RETURNED` |
| `DeliveryType` | `DELIVERY`, `PICKUP` |
| `TimeWindow` | `MORNING`, `AFTERNOON`, `EVENING` |
| `PaymentMethod` | `COD` |
| `DiscountType` | `PERCENT`, `FIXED` |
| `RequestStatus` | `NEW`, `CONTACTED`, `DONE` |

---

## Public endpoints

No authentication required.

### Health

`GET /api/health` → `{ "status": "ok" }`

### Categories

`GET /api/categories`

Active categories ordered by `sortOrder`, with the number of active products.

```json
{ "data": [ { "id": 1, "name": "Cakes", "slug": "cakes", "imageUrl": null, "sortOrder": 1, "_count": { "products": 1 } } ] }
```

### Products

`GET /api/products`

| Query | Type | Description |
| --- | --- | --- |
| `category` | string | Category slug, e.g. `macarons` |
| `search` | string | Case-insensitive match on name and short description |
| `minPrice`, `maxPrice` | int | Filter on `basePrice` (lowest variant price) |
| `dietary` | csv | Dietary tag slugs, **all** must match: `gluten-free,vegan` |
| `flavor` | csv | Flavor slugs, **any** may match: `strawberry,pistachio` |
| `sort` | enum | `featured` (default), `price_asc`, `price_desc`, `newest` |
| `page` | int | Default `1` |
| `limit` | int | Default `8`, max `50` |

Each product contains: product fields, `category`, `variants[]` (active, cheapest first), `dietaryTags[]`, `flavors[]`, `images[]`, plus `rating` and `reviewCount` (approved reviews only).

```json
{
  "data": [{
    "id": 1,
    "name": "Strawberry Blossom Cloud Cake",
    "slug": "strawberry-blossom-cloud-cake",
    "shortDescription": "Layers of light genoise...",
    "imageUrl": "https://ik.imagekit.io/...",
    "badge": "BESTSELLER",
    "basePrice": 4500,
    "isFeatured": true,
    "category": { "id": 1, "name": "Cakes", "slug": "cakes" },
    "variants": [ { "id": 1, "label": "6\"", "serves": "4-6 guests", "price": 4500, "stock": 10 } ],
    "dietaryTags": [ { "id": 5, "name": "Halal", "slug": "halal" } ],
    "flavors": [ { "id": 1, "name": "Strawberry", "slug": "strawberry" } ],
    "images": [],
    "rating": 4.8,
    "reviewCount": 12
  }],
  "meta": { "page": 1, "limit": 8, "total": 6, "totalPages": 1 }
}
```

`GET /api/products/:slug`

Full product with `ingredients`, `allergyInfo`, `images`, the 20 latest approved `reviews`, and `related` products (same category, up to 4) as a sibling of `data`:

```json
{ "data": { "...": "product", "reviews": [] }, "related": [ ] }
```

### Reviews

`POST /api/products/:slug/reviews` · rate limited

```json
{ "authorName": "Sara", "rating": 5, "comment": "Amazing cake!" }
```

`rating` is an integer 1-5, `comment` is optional (max 1000). Returns `201`. The review is stored as **pending** and only appears after admin approval.

`GET /api/testimonials`

Up to 9 latest approved reviews with rating ≥ 4 and a comment. For the home page testimonials section.

### Delivery zones

`GET /api/delivery-zones`

```json
{ "data": [ { "wilaya": "Laghouat", "fee": 300, "freeAbove": 5000 } ] }
```

Use it to fill the wilaya dropdown at checkout.

### Order quote

`POST /api/orders/quote`

Calculates totals without creating anything. Use it for the order summary (coupon preview, delivery fee).

```json
{
  "items": [ { "variantId": 1, "quantity": 2 } ],
  "deliveryType": "DELIVERY",
  "wilaya": "Laghouat",
  "couponCode": "BLOOM20"
}
```

| Field | Required | Notes |
| --- | --- | --- |
| `items` | yes | 1-30 lines: `variantId`, `quantity` (1-20), optional `inscription` (max 100) |
| `deliveryType` | no | Default `DELIVERY` |
| `wilaya` | no | If omitted for delivery, `deliveryFee` is `0` (not yet known) |
| `couponCode` | no | Case-insensitive |

```json
{
  "data": {
    "items": [ { "productId": 1, "variantId": 1, "productName": "Strawberry Blossom Cloud Cake", "variantLabel": "6\"", "unitPrice": 4500, "quantity": 2 } ],
    "subtotal": 9000,
    "discount": 1800,
    "deliveryFee": 0,
    "total": 7200,
    "couponCode": "BLOOM20"
  }
}
```

### Create order

`POST /api/orders` · rate limited

```json
{
  "customerName": "Ahmed Test",
  "phone": "0541929912",
  "email": "ahmed@example.com",
  "wilaya": "Laghouat",
  "address": "Cite 1000 logements, Laghouat",
  "notes": "Call before arriving",
  "deliveryType": "DELIVERY",
  "deliveryDate": "2026-10-20",
  "timeWindow": "MORNING",
  "isGift": true,
  "giftMessage": "Happy birthday!",
  "couponCode": "BLOOM20",
  "items": [ { "variantId": 1, "quantity": 1, "inscription": "Happy 28th Birthday" } ]
}
```

| Field | Required | Notes |
| --- | --- | --- |
| `customerName` | yes | 2-80 chars |
| `phone` | yes | Algerian mobile number |
| `email` | no | Valid email or empty |
| `wilaya`, `address` | for `DELIVERY` | Address min 5 chars. Not needed for `PICKUP` |
| `deliveryDate` | no | Not in the past |
| `timeWindow` | no | `MORNING`, `AFTERNOON`, `EVENING` |
| `isGift`, `giftMessage` | no | Message max 250 chars, kept only when `isGift` is true |
| `notes` | no | Max 500 chars |
| `couponCode`, `items` | see quote | |

Returns `201` with the order and its items. `orderNumber` looks like `SB-20261015-0007`.

```json
{
  "data": {
    "id": 7,
    "orderNumber": "SB-20261015-0007",
    "status": "PENDING",
    "paymentMethod": "COD",
    "isPaid": false,
    "subtotal": 4500,
    "discount": 900,
    "deliveryFee": 300,
    "total": 3900,
    "items": [ { "productName": "Strawberry Blossom Cloud Cake", "variantLabel": "6\"", "unitPrice": 4500, "quantity": 1, "inscription": "Happy 28th Birthday" } ]
  }
}
```

Possible errors: `400` (invalid item, wilaya not served, invalid/expired coupon, minimum order), `409` (not enough stock).

### Custom cake request

`POST /api/custom-cake-requests` · rate limited

```json
{ "name": "Karim", "phone": "0661234567", "email": "k@example.com", "eventDate": "2026-12-20", "guests": 80, "description": "Three-tier wedding cake with gold leaf" }
```

`name`, `phone`, `description` (10-1500 chars) are required. Returns `201`.

### Newsletter

`POST /api/newsletter` · rate limited

```json
{ "email": "test@example.com" }
```

Returns `201` whether or not the email was already subscribed.

---

## Authentication

### Login

`POST /api/auth/login` · rate limited

```json
{ "email": "admin@sweetbloom.dz", "password": "..." }
```

```json
{ "token": "eyJhbGci...", "admin": { "id": 1, "email": "admin@sweetbloom.dz", "name": "Admin" } }
```

Token lifetime is 7 days. Wrong credentials return `401 Invalid email or password` (same message for unknown email and wrong password).

### Current admin

`GET /api/auth/me` · requires token

```json
{ "admin": { "id": 1, "email": "admin@sweetbloom.dz", "name": "Admin" } }
```

Use it on app start to check that a stored token is still valid. The two auth endpoints return `token` and `admin` at the top level, without the `data` wrapper.

---

## Admin endpoints

Every endpoint in this section requires `Authorization: Bearer <token>`.

### Products

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/api/admin/products` | List including hidden. Query: `search`, `status=all\|active\|inactive`, `categoryId`, `page`, `limit` (default 20) |
| `GET` | `/api/admin/products/:id` | Full product for the edit form (all variants, images, tags, flavors) |
| `POST` | `/api/products` | Create product → `201` |
| `PUT` | `/api/products/:id` | Update (partial). If `variants` is sent, **all variants are replaced** |
| `DELETE` | `/api/products/:id` | Soft delete (`isActive=false`) → `204`. Restore with `PUT { "isActive": true }` |

Create body:

```json
{
  "name": "Lemon Meringue Tart",
  "slug": "lemon-meringue-tart",
  "categoryId": 6,
  "shortDescription": "Zesty lemon curd under toasted meringue.",
  "description": "...",
  "ingredients": "...",
  "allergyInfo": "Contains gluten, eggs, dairy",
  "badge": "NEW",
  "isFeatured": false,
  "isActive": true,
  "variants": [ { "label": "Single", "serves": "1 person", "price": 700, "stock": 15 } ],
  "dietaryTagIds": [5],
  "flavorIds": [4]
}
```

`slug` is optional (generated from `name`). `variants` needs at least one. `basePrice` is computed automatically from the cheapest variant. A duplicate slug returns `409`.

### Product images (ImageKit)

Upload with `multipart/form-data`, field name **`image`**. JPG, PNG or WebP, max 5 MB.

| Method | Path | Description |
| --- | --- | --- |
| `POST` | `/api/admin/products/:id/images` | Upload an image (optional text field `alt`). The first image becomes the cover automatically |
| `PATCH` | `/api/admin/products/:id/images/:imageId/cover` | Make this image the cover (`product.imageUrl`) |
| `DELETE` | `/api/admin/products/:id/images/:imageId` | Delete from DB and ImageKit. The cover moves to the next image if needed |
| `POST` | `/api/admin/uploads` | Generic upload, returns `{ data: { url, fileId } }` (e.g. category images) |

### Categories

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/api/admin/categories` | All categories with product counts |
| `POST` | `/api/admin/categories` | `{ "name": "Tarts", "slug"?, "description"?, "imageUrl"?, "sortOrder"?, "isActive"? }` |
| `PUT` | `/api/admin/categories/:id` | Partial update |
| `DELETE` | `/api/admin/categories/:id` | Deletes if empty, otherwise only hides (`isActive=false`) |

### Orders

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/api/admin/orders` | Query: `status`, `search` (order number, name or phone), `page`, `limit` |
| `GET` | `/api/admin/orders/:id` | Order with items |
| `PATCH` | `/api/admin/orders/:id/status` | `{ "status": "CONFIRMED" }` |
| `PATCH` | `/api/admin/orders/:id/paid` | `{ "isPaid": true }` |

Status rules:

- Setting `CANCELLED` **restores stock** and releases one use of the coupon.
- A cancelled order can not be changed anymore (`409`).
- Setting `DELIVERED` marks the order as paid (cash collected). It can be changed with `/paid`.

### Reviews

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/api/admin/reviews` | Query: `status=pending\|approved\|all` (default `pending`), `page`, `limit` |
| `POST` | `/api/admin/reviews` | Add manually: `{ productId, authorName, rating, comment?, isApproved? }` (approved by default) |
| `PATCH` | `/api/admin/reviews/:id` | `{ "isApproved": true }` |
| `DELETE` | `/api/admin/reviews/:id` | |

### Custom cake requests

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/api/admin/custom-requests` | Query: `status`, `page`, `limit` |
| `PATCH` | `/api/admin/custom-requests/:id/status` | `{ "status": "CONTACTED" }` |

### Newsletter

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/api/admin/newsletter` | Subscribers, paginated |
| `DELETE` | `/api/admin/newsletter/:id` | |

### Coupons

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/api/admin/coupons` | |
| `POST` | `/api/admin/coupons` | `{ "code": "EID25", "type": "PERCENT", "value": 25, "minOrder"?: 3000, "maxUses"?: 100, "expiresAt"?: "2026-12-31", "isActive"? }` |
| `PUT` | `/api/admin/coupons/:id` | Partial update |
| `DELETE` | `/api/admin/coupons/:id` | |

`code` is stored uppercase (3-20 chars: `A-Z`, `0-9`, `-`, `_`). `PERCENT` value must be ≤ 100.

### Delivery zones

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/api/admin/delivery-zones` | Includes inactive zones |
| `POST` | `/api/admin/delivery-zones` | `{ "wilaya": "Biskra", "fee": 700, "freeAbove": 9000, "isActive"? }` |
| `PUT` | `/api/admin/delivery-zones/:id` | Partial update |
| `DELETE` | `/api/admin/delivery-zones/:id` | |

### Dashboard stats

`GET /api/admin/stats`

```json
{
  "data": {
    "ordersToday": 3,
    "pendingOrders": 2,
    "pendingReviews": 1,
    "newCustomRequests": 1,
    "revenueDelivered30d": 52000,
    "revenuePipeline": 14500,
    "ordersByStatus": { "PENDING": 2, "DELIVERED": 8 },
    "topProducts": [ { "productId": 1, "name": "Strawberry Blossom Cloud Cake", "sold": 14 } ],
    "lowStock": [ { "id": 3, "label": "Box of 6", "stock": 2, "product": { "id": 2, "name": "Pastel Parisian Macaron Box" } } ],
    "recentOrders": [ { "id": 7, "orderNumber": "SB-20261015-0007", "customerName": "Ahmed Test", "total": 3900, "status": "PENDING", "createdAt": "..." } ],
    "dailySales": [ { "day": "2026-10-15", "orders": 3, "revenue": 11200 } ]
  }
}
```

- `revenueDelivered30d`: sum of `DELIVERED` orders in the last 30 days.
- `revenuePipeline`: sum of orders not yet delivered (`PENDING` to `OUT_FOR_DELIVERY`).
- `topProducts` and `dailySales` exclude `CANCELLED` and `RETURNED`.
- `lowStock`: active variants with stock ≤ 5.
- `dailySales` covers the last 14 days, days are in UTC.

---

## Business rules

- **Prices are never trusted from the client.** Orders send only `variantId` and `quantity`; unit prices, discounts, delivery fee and total are recomputed from the database.
- **Order creation is one transaction:** stock decrement, coupon usage and order insert succeed or fail together. Stock is decremented with a conditional update (`stock >= qty`), so the last item can not be sold twice.
- **Coupons:** must be active, not expired, below `maxUses`, and the subtotal must reach `minOrder`. `PERCENT` is rounded down; `FIXED` never exceeds the subtotal.
- **Delivery fee:** from the wilaya's zone. It is `0` for `PICKUP`, and `0` when `subtotal - discount >= freeAbove`.
- **Order items keep a snapshot** (`productName`, `variantLabel`, `unitPrice`), so old orders do not change when products are edited or hidden.
- **Products are never hard-deleted** (soft delete), because orders reference them.
- **Reviews** are moderated: public submissions are hidden until approved.

---

## Rate limits

| Endpoint | Limit |
| --- | --- |
| `POST /api/auth/login` | 10 per 15 minutes per IP |
| `POST /api/orders` | 20 per hour per IP |
| `POST /api/products/:slug/reviews` | 10 per hour per IP |
| `POST /api/custom-cake-requests` | 5 per hour per IP |
| `POST /api/newsletter` | 10 per hour per IP |

Exceeding a limit returns `429`.

---

## Frontend integration notes

- **Cart:** keep it in `localStorage` as `[{ variantId, quantity, inscription? }]`. Call `/api/orders/quote` to show totals, and `/api/orders` on submit. Do not store prices you intend to trust.
- **Checkout flow:** load `/api/delivery-zones` for the wilaya select, quote on every change (items, wilaya, coupon), then place the order. Payment is cash on delivery only, so there is no payment step.
- **Money:** integers in DZD. Format with `Intl.NumberFormat("fr-DZ")` or similar.
- **Images:** product images are ImageKit URLs. Append a transformation for smaller files, e.g. `url + "?tr=w-600"`.
- **Admin token:** returned by `/api/auth/login`; send it as a Bearer token. On `401`, clear it and redirect to the login page.
- **CORS:** the API currently allows `http://localhost:3000`. Change the origin in `src/app.ts` to the real domain before deploying.
- **Reviews:** after `POST .../reviews` show "Thank you, your review will appear after approval".