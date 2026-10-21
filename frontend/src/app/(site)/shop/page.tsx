// import Link from "next/link";
// import { Suspense } from "react";
// import { SearchX } from "lucide-react";
// import { getCategories, getProducts, type ProductQuery } from "@/lib/api";
// import ProductCard from "@/components/ProductCard";
// import ShopFilters from "@/components/ShopFilters";

// type SearchParams = Promise<Record<string, string | string[] | undefined>>;

// export const metadata = { title: "Shop — Sweet Bloom" };

// export default function ShopPage({ searchParams }: { searchParams: SearchParams }) {
//   return (
//     <div className="mx-auto max-w-6xl space-y-8 px-5 pt-8 md:px-12 md:pt-12">
//       <header>
//         <p className="text-[11px] font-semibold uppercase tracking-widest text-berry">Laghouat atelier edition</p>
//         <h1 className="font-display text-[34px] font-semibold text-cocoa break-words md:text-[44px]">Our Confectionery Shop</h1>
//         <p className="mt-2 max-w-xl text-sm">
//           Handcrafted cakes, macarons and pastries prepared fresh daily in Laghouat.
//         </p>
//       </header>
//       <Suspense fallback={<ShopSkeleton />}>
//         <ShopContent searchParams={searchParams} />
//       </Suspense>
//     </div>
//   );
// }

// async function ShopContent({ searchParams }: { searchParams: SearchParams }) {
//   const sp = await searchParams;
//   const get = (k: string) => {
//     const v = sp[k];
//     return Array.isArray(v) ? v[0] : v;
//   };

//   const limit = Math.min(Math.max(Number(get("limit")) || 8, 8), 48);
//   const query: ProductQuery = {
//     category: get("category"),
//     search: get("search"),
//     dietary: get("dietary"),
//     sort: (get("sort") as ProductQuery["sort"]) ?? "featured",
//     limit,
//   };

//   const [categories, result] = await Promise.all([
//     getCategories().catch(() => []),
//     getProducts(query).catch(() => null),
//   ]);
//   const total = categories.reduce((n, c) => n + c._count.products, 0);

//   const nextParams = new URLSearchParams();
//   Object.entries(sp).forEach(([k, v]) => {
//     const val = Array.isArray(v) ? v[0] : v;
//     if (val && k !== "limit") nextParams.set(k, val);
//   });
//   nextParams.set("limit", String(limit + 8));

//   return (
//     <>
//       <Suspense>
//         <ShopFilters categories={categories} total={total} />
//       </Suspense>

//       {!result ? (
//         <p className="rounded-2xl border border-line bg-white p-10 text-center text-sm">
//           We could not load the products right now. Please try again shortly.
//         </p>
//       ) : result.data.length === 0 ? (
//         <div className="flex flex-col items-center gap-3 rounded-2xl border border-line bg-white p-12 text-center">
//           <SearchX size={36} className="text-berry" />
//           <p className="font-display text-xl text-cocoa">No creations found</p>
//           <p className="text-sm">Try another search or remove some filters.</p>
//           <Link href="/shop" className="mt-2 rounded-full bg-berry px-6 py-2.5 text-sm font-semibold text-white hover:bg-berry-dark">
//             Clear filters
//           </Link>
//         </div>
//       ) : (
//         <>
//           <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
//             {result.data.map((p) => <ProductCard key={p.id} product={p} />)}
//           </div>
//           <div className="flex flex-col items-center gap-3 pt-2">
//             <p className="text-xs text-cocoa-muted">
//               Showing {result.data.length} of {result.meta.total} creations
//             </p>
//             <div className="h-1 w-40 overflow-hidden rounded-full bg-sand">
//               <div className="h-full bg-berry" style={{ width: `${(result.data.length / result.meta.total) * 100}%` }} />
//             </div>
//             {result.data.length < result.meta.total && (
//               <Link href={`/shop?${nextParams.toString()}`} scroll={false}
//                 className="rounded-full border border-line bg-white px-6 py-2.5 text-sm font-semibold text-cocoa transition-colors hover:border-berry">
//                 Load more pastries
//               </Link>
//             )}
//           </div>
//         </>
//       )}

//       <section className="flex flex-col items-start justify-between gap-4 rounded-2xl bg-blush p-6 md:flex-row md:items-center">
//         <div>
//           <h2 className="font-display text-xl text-cocoa">Laghouat Local Delivery &amp; Cash On Delivery</h2>
//           <p className="text-sm">Pay when your sweet parcel arrives.</p>
//         </div>
//         <Link href="/custom-cakes" className="rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-berry">
//           Book Custom Commission
//         </Link>
//       </section>
//     </>
//   );
// }

// function ShopSkeleton() {
//   return (
//     <div className="space-y-8">
//       <div className="h-48 animate-pulse rounded-2xl bg-sand" />
//       <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
//         {Array.from({ length: 6 }).map((_, i) => (
//           <div key={i} className="aspect-[3/4] animate-pulse rounded-2xl bg-sand" />
//         ))}
//       </div>
//     </div>
//   );
// }

// fix error

import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";
import { SearchX } from "lucide-react";
import { getCategories, getProducts, type ProductQuery } from "@/lib/api";
import ProductCard from "@/components/ProductCard";
import ShopFilters from "@/components/ShopFilters";
import { retry } from "@/lib/retry";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export const metadata = { title: "Shop — Sweet Bloom" };

export default function ShopPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <div className="mx-auto max-w-6xl space-y-8 px-5 pt-8 md:px-12 md:pt-12">
      <header>
        <p className="text-[11px] font-semibold uppercase tracking-widest text-berry">Laghouat atelier edition</p>
        <h1 className="font-display text-[34px] font-semibold text-cocoa break-words md:text-[44px]">Our Confectionery Shop</h1>
        <p className="mt-2 max-w-xl text-sm">
          Handcrafted cakes, macarons and pastries prepared fresh daily in Laghouat.
        </p>
      </header>
      <Suspense fallback={<ShopSkeleton />}>
        <ShopContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function ShopContent({ searchParams }: { searchParams: SearchParams }) {
  await connection(); // always render at request time, never at build time
  const sp = await searchParams;
  const get = (k: string) => {
    const v = sp[k];
    return Array.isArray(v) ? v[0] : v;
  };

  const limit = Math.min(Math.max(Number(get("limit")) || 8, 8), 48);
  const query: ProductQuery = {
    category: get("category"),
    search: get("search"),
    dietary: get("dietary"),
    sort: (get("sort") as ProductQuery["sort"]) ?? "featured",
    limit,
  };

  const [categories, result] = await Promise.all([
    retry(() => getCategories()).catch((e) => {
      console.error("[shop] getCategories failed:", e);
      return [];
    }),
    retry(() => getProducts(query)).catch((e) => {
      console.error("[shop] getProducts failed:", e);
      return null;
    }),
  ]);
  const total = categories.reduce((n, c) => n + c._count.products, 0);

  const nextParams = new URLSearchParams();
  Object.entries(sp).forEach(([k, v]) => {
    const val = Array.isArray(v) ? v[0] : v;
    if (val && k !== "limit") nextParams.set(k, val);
  });
  nextParams.set("limit", String(limit + 8));

  return (
    <>
      <Suspense>
        <ShopFilters categories={categories} total={total} />
      </Suspense>

      {!result ? (
        <p className="rounded-2xl border border-line bg-white p-10 text-center text-sm">
          We could not load the products right now. Please try again shortly.
        </p>
      ) : result.data.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-line bg-white p-12 text-center">
          <SearchX size={36} className="text-berry" />
          <p className="font-display text-xl text-cocoa">No creations found</p>
          <p className="text-sm">Try another search or remove some filters.</p>
          <Link href="/shop" className="mt-2 rounded-full bg-berry px-6 py-2.5 text-sm font-semibold text-white hover:bg-berry-dark">
            Clear filters
          </Link>
        </div>
      ) : (
        <>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {result.data.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
          <div className="flex flex-col items-center gap-3 pt-2">
            <p className="text-xs text-cocoa-muted">
              Showing {result.data.length} of {result.meta.total} creations
            </p>
            <div className="h-1 w-40 overflow-hidden rounded-full bg-sand">
              <div className="h-full bg-berry" style={{ width: `${(result.data.length / result.meta.total) * 100}%` }} />
            </div>
            {result.data.length < result.meta.total && (
              <Link href={`/shop?${nextParams.toString()}`} scroll={false}
                className="rounded-full border border-line bg-white px-6 py-2.5 text-sm font-semibold text-cocoa transition-colors hover:border-berry">
                Load more pastries
              </Link>
            )}
          </div>
        </>
      )}

      <section className="flex flex-col items-start justify-between gap-4 rounded-2xl bg-blush p-6 md:flex-row md:items-center">
        <div>
          <h2 className="font-display text-xl text-cocoa">Laghouat Local Delivery &amp; Cash On Delivery</h2>
          <p className="text-sm">Pay when your sweet parcel arrives.</p>
        </div>
        <Link href="/custom-cakes" className="rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-berry">
          Book Custom Commission
        </Link>
      </section>
    </>
  );
}

function ShopSkeleton() {
  return (
    <div className="space-y-8">
      <div className="h-48 animate-pulse rounded-2xl bg-sand" />
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="aspect-[3/4] animate-pulse rounded-2xl bg-sand" />
        ))}
      </div>
    </div>
  );
}