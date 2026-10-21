// import Link from "next/link";
// import { notFound } from "next/navigation";
// import { Suspense } from "react";
// import { ChevronRight } from "lucide-react";
// import { ApiError, getProduct } from "@/lib/api";
// import { BADGES } from "@/lib/badges";
// import ProductCard from "@/components/ProductCard";
// import ProductGallery from "@/components/ProductGallery";
// import ProductPurchase from "@/components/ProductPurchase";
// import ReviewForm from "@/components/ReviewForm";
// import Stars from "@/components/Stars";

// type Params = Promise<{ slug: string }>;

// export default function ProductPage({ params }: { params: Params }) {
//   return (
//     <Suspense fallback={<div className="mx-auto h-[70vh] max-w-6xl animate-pulse rounded-3xl bg-sand" />}>
//       <ProductContent params={params} />
//     </Suspense>
//   );
// }

// async function ProductContent({ params }: { params: Params }) {
//   const { slug } = await params;

//   let res;
//   try {
//     res = await getProduct(slug);
//   } catch (e) {
//     if (e instanceof ApiError && e.status === 404) notFound();
//     throw e;
//   }
//   const p = res.data;
//   const related = res.related ?? [];

//   const images = p.images.length
//     ? p.images.map((i) => ({ id: i.id, url: i.url, alt: i.alt }))
//     : p.imageUrl
//       ? [{ id: 0, url: p.imageUrl, alt: p.name }]
//       : [];

//   return (
//     <div className="mx-auto max-w-6xl space-y-16 px-5 pt-6 md:px-12 md:pt-8">
//       {/* breadcrumb */}
//       <nav className="flex flex-wrap items-center gap-1 text-xs text-cocoa-muted">
//         <Link href="/" className="hover:text-berry">Home</Link>
//         <ChevronRight size={12} />
//         <Link href="/shop" className="hover:text-berry">Shop</Link>
//         <ChevronRight size={12} />
//         <Link href={`/shop?category=${p.category.slug}`} className="hover:text-berry">{p.category.name}</Link>
//         <ChevronRight size={12} />
//         <span className="font-semibold text-cocoa">{p.name}</span>
//       </nav>

//       <section className="grid gap-8 lg:grid-cols-2 lg:gap-12">
//         <ProductGallery images={images} name={p.name} badge={p.badge ? BADGES[p.badge] : undefined} />

//         <div className="space-y-5 rounded-2xl border border-line bg-white p-5 md:p-7">
//           <div className="flex items-center justify-between gap-3">
//             <span className="rounded-full bg-blush px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-berry">
//               {p.category.name}
//             </span>
//             {p.reviewCount > 0 && (
//               <span className="flex items-center gap-2 text-xs">
//                 <Stars rating={p.rating} />
//                 <b className="text-cocoa">{p.rating.toFixed(1)}</b>
//                 <span className="text-cocoa-muted">({p.reviewCount} reviews)</span>
//               </span>
//             )}
//           </div>

//           <h1 className="font-display text-[30px] font-semibold leading-tight text-cocoa break-words md:text-4xl">
//             {p.name}
//           </h1>

//           <ProductPurchase product={p} />

//           {(p.dietaryTags.length > 0 || p.flavors.length > 0) && (
//             <div className="flex flex-wrap gap-2">
//               {p.dietaryTags.map((t) => (
//                 <span key={t.id} className="rounded-full bg-pistachio px-3 py-1 text-[11px] font-semibold text-pistachio-ink">
//                   {t.name}
//                 </span>
//               ))}
//               {p.flavors.map((f) => (
//                 <span key={f.id} className="rounded-full border border-line px-3 py-1 text-[11px] font-semibold text-cocoa-soft">
//                   {f.name}
//                 </span>
//               ))}
//             </div>
//           )}

//           <div className="divide-y divide-line border-t border-line">
//             {p.ingredients && (
//               <details className="group py-3">
//                 <summary className="cursor-pointer list-none text-xs font-bold uppercase tracking-widest text-cocoa">
//                   Artisan ingredients &amp; origin
//                 </summary>
//                 <p className="mt-2 text-sm leading-6">{p.ingredients}</p>
//               </details>
//             )}
//             {p.allergyInfo && (
//               <details className="group py-3">
//                 <summary className="cursor-pointer list-none text-xs font-bold uppercase tracking-widest text-cocoa">
//                   Allergens &amp; dietary notes
//                 </summary>
//                 <p className="mt-2 text-sm leading-6">{p.allergyInfo}</p>
//               </details>
//             )}
//           </div>
//         </div>
//       </section>

//       {/* reviews */}
//       <section>
//         <p className="text-[11px] font-semibold uppercase tracking-widest text-cocoa-muted">Patron testimonials</p>
//         <h2 className="mb-6 font-display text-[26px] text-cocoa md:text-3xl">Beloved Moments &amp; Celebrations</h2>
//         <div className="grid gap-5 lg:grid-cols-3">
//           <div className="grid gap-5 sm:grid-cols-2 lg:col-span-2">
//             {p.reviews.length === 0 ? (
//               <p className="rounded-2xl border border-line bg-white p-6 text-sm sm:col-span-2">
//                 No reviews yet. Be the first to share your experience.
//               </p>
//             ) : (
//               p.reviews.slice(0, 6).map((r) => (
//                 <figure key={r.id} className="flex flex-col gap-3 rounded-2xl border border-line bg-white p-5">
//                   <Stars rating={r.rating} />
//                   {r.comment && <blockquote className="flex-1 text-sm italic leading-6">“{r.comment}”</blockquote>}
//                   <figcaption className="border-t border-line pt-3 text-sm font-semibold text-cocoa">
//                     {r.authorName}
//                   </figcaption>
//                 </figure>
//               ))
//             )}
//           </div>
//           <ReviewForm slug={p.slug} />
//         </div>
//       </section>

//       {/* related */}
//       {related.length > 0 && (
//         <section>
//           <p className="text-[11px] font-semibold uppercase tracking-widest text-berry">Atelier complements</p>
//           <h2 className="mb-6 font-display text-[26px] text-cocoa md:text-3xl">Pairs Wonderfully With</h2>
//           <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
//             {related.map((r) => <ProductCard key={r.id} product={r} />)}
//           </div>
//         </section>
//       )}
//     </div>
//   );
// }

// fix error

import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { connection } from "next/server";
import { ChevronRight } from "lucide-react";
import { ApiError, getProduct } from "@/lib/api";
import { BADGES } from "@/lib/badges";
import ProductCard from "@/components/ProductCard";
import ProductGallery from "@/components/ProductGallery";
import ProductPurchase from "@/components/ProductPurchase";
import ReviewForm from "@/components/ReviewForm";
import Stars from "@/components/Stars";
import { retry } from "@/lib/retry";

type Params = Promise<{ slug: string }>;

export default function ProductPage({ params }: { params: Params }) {
  return (
    <Suspense fallback={<div className="mx-auto h-[70vh] max-w-6xl animate-pulse rounded-3xl bg-sand" />}>
      <ProductContent params={params} />
    </Suspense>
  );
}

async function ProductContent({ params }: { params: Params }) {
  await connection(); // always render at request time, never at build time
  const { slug } = await params;

  let res;
  try {
    res = await retry(() => getProduct(slug));
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) notFound();
    throw e;
  }
  const p = res.data;
  const related = res.related ?? [];

  const images = p.images.length
    ? p.images.map((i) => ({ id: i.id, url: i.url, alt: i.alt }))
    : p.imageUrl
      ? [{ id: 0, url: p.imageUrl, alt: p.name }]
      : [];

  return (
    <div className="mx-auto max-w-6xl space-y-16 px-5 pt-6 md:px-12 md:pt-8">
      {/* breadcrumb */}
      <nav className="flex flex-wrap items-center gap-1 text-xs text-cocoa-muted">
        <Link href="/" className="hover:text-berry">Home</Link>
        <ChevronRight size={12} />
        <Link href="/shop" className="hover:text-berry">Shop</Link>
        <ChevronRight size={12} />
        <Link href={`/shop?category=${p.category.slug}`} className="hover:text-berry">{p.category.name}</Link>
        <ChevronRight size={12} />
        <span className="font-semibold text-cocoa">{p.name}</span>
      </nav>

      <section className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        <ProductGallery images={images} name={p.name} badge={p.badge ? BADGES[p.badge] : undefined} />

        <div className="space-y-5 rounded-2xl border border-line bg-white p-5 md:p-7">
          <div className="flex items-center justify-between gap-3">
            <span className="rounded-full bg-blush px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-berry">
              {p.category.name}
            </span>
            {p.reviewCount > 0 && (
              <span className="flex items-center gap-2 text-xs">
                <Stars rating={p.rating} />
                <b className="text-cocoa">{p.rating.toFixed(1)}</b>
                <span className="text-cocoa-muted">({p.reviewCount} reviews)</span>
              </span>
            )}
          </div>

          <h1 className="font-display text-[30px] font-semibold leading-tight text-cocoa break-words md:text-4xl">
            {p.name}
          </h1>

          <ProductPurchase product={p} />

          {(p.dietaryTags.length > 0 || p.flavors.length > 0) && (
            <div className="flex flex-wrap gap-2">
              {p.dietaryTags.map((t) => (
                <span key={t.id} className="rounded-full bg-pistachio px-3 py-1 text-[11px] font-semibold text-pistachio-ink">
                  {t.name}
                </span>
              ))}
              {p.flavors.map((f) => (
                <span key={f.id} className="rounded-full border border-line px-3 py-1 text-[11px] font-semibold text-cocoa-soft">
                  {f.name}
                </span>
              ))}
            </div>
          )}

          <div className="divide-y divide-line border-t border-line">
            {p.ingredients && (
              <details className="group py-3">
                <summary className="cursor-pointer list-none text-xs font-bold uppercase tracking-widest text-cocoa">
                  Artisan ingredients &amp; origin
                </summary>
                <p className="mt-2 text-sm leading-6">{p.ingredients}</p>
              </details>
            )}
            {p.allergyInfo && (
              <details className="group py-3">
                <summary className="cursor-pointer list-none text-xs font-bold uppercase tracking-widest text-cocoa">
                  Allergens &amp; dietary notes
                </summary>
                <p className="mt-2 text-sm leading-6">{p.allergyInfo}</p>
              </details>
            )}
          </div>
        </div>
      </section>

      {/* reviews */}
      <section>
        <p className="text-[11px] font-semibold uppercase tracking-widest text-cocoa-muted">Patron testimonials</p>
        <h2 className="mb-6 font-display text-[26px] text-cocoa md:text-3xl">Beloved Moments &amp; Celebrations</h2>
        <div className="grid gap-5 lg:grid-cols-3">
          <div className="grid gap-5 sm:grid-cols-2 lg:col-span-2">
            {p.reviews.length === 0 ? (
              <p className="rounded-2xl border border-line bg-white p-6 text-sm sm:col-span-2">
                No reviews yet. Be the first to share your experience.
              </p>
            ) : (
              p.reviews.slice(0, 6).map((r) => (
                <figure key={r.id} className="flex flex-col gap-3 rounded-2xl border border-line bg-white p-5">
                  <Stars rating={r.rating} />
                  {r.comment && <blockquote className="flex-1 text-sm italic leading-6">“{r.comment}”</blockquote>}
                  <figcaption className="border-t border-line pt-3 text-sm font-semibold text-cocoa">
                    {r.authorName}
                  </figcaption>
                </figure>
              ))
            )}
          </div>
          <ReviewForm slug={p.slug} />
        </div>
      </section>

      {/* related */}
      {related.length > 0 && (
        <section>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-berry">Atelier complements</p>
          <h2 className="mb-6 font-display text-[26px] text-cocoa md:text-3xl">Pairs Wonderfully With</h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((r) => <ProductCard key={r.id} product={r} />)}
          </div>
        </section>
      )}
    </div>
  );
}