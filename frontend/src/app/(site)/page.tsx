// import Image from "next/image";
// import Link from "next/link";
// import { Suspense } from "react";
// import {
//   ArrowRight, Cake, Check, Croissant, Flower2, Sparkles, Truck, Wheat, Banknote,
// } from "lucide-react";
// import { getCategories, getProducts, getTestimonials } from "@/lib/api";
// import { formatDA } from "@/lib/format";
// import ProductCard from "@/components/ProductCard";
// import Stars from "@/components/Stars";
// import { Reveal, Stagger, StaggerItem, Float, Parallax } from "@/components/motion/Motion";

// export default function HomePage() {
//   return (
//     <Suspense fallback={<div className="mx-auto h-[70vh] max-w-7xl animate-pulse rounded-3xl bg-sand" />}>
//       <HomeContent />
//     </Suspense>
//   );
// }

// async function HomeContent() {
//   const [categories, products, testimonials] = await Promise.all([
//     getCategories().catch(() => []),
//     getProducts({ sort: "featured", limit: 4 }).then((r) => r.data).catch(() => []),
//     getTestimonials().catch(() => []),
//   ]);
//   const hero = products[0];

//   return (
//     <div className="mx-auto max-w-7xl space-y-14 px-5 pt-8 md:space-y-16 md:px-12 md:pt-12">
//       {/* ---------- Hero ---------- */}
//       <section className="grid items-center gap-10 lg:grid-cols-2">
//         <div className="space-y-6">
//           <span className="inline-flex items-center gap-2 rounded-full bg-blush px-4 py-1.5 text-xs font-semibold text-berry">
//             <Flower2 size={14} /> Handcrafted in Laghouat, Algeria
//           </span>
//           <h1 className="font-display text-[34px] font-semibold leading-[42px] tracking-tight text-cocoa md:text-[44px] md:leading-[52px]">
//             Baked with Love,
//             <br />
//             <em className="text-berry">Served with Joy</em>
//           </h1>
//           <p className="max-w-xl text-[17px] leading-7">
//             From sunrise in our Laghouat atelier, we handcraft small-batch celebration
//             cakes, ethereal macarons and slow-laminated viennoiseries.
//           </p>
//           <div className="flex flex-wrap gap-3">
//             <Link href="/shop"
//               className="inline-flex h-12 items-center gap-2 rounded-full bg-berry px-7 text-sm font-semibold text-white transition-colors hover:bg-berry-dark">
//               Order Fresh Bakes <ArrowRight size={16} />
//             </Link>
//             <Link href="/custom-cakes"
//               className="inline-flex h-12 items-center rounded-full bg-blush px-7 text-sm font-semibold text-berry transition-colors hover:bg-blush-dark">
//               Request Custom Cake
//             </Link>
//           </div>
//           <ul className="flex flex-wrap gap-x-6 gap-y-2 pt-2 text-xs font-semibold text-cocoa-soft">
//             <li className="flex items-center gap-2"><Sparkles size={14} className="text-caramel" /> 100% Fresh Daily</li>
//             <li className="flex items-center gap-2"><Wheat size={14} className="text-caramel" /> Pure Butter &amp; Vanilla</li>
//             <li className="flex items-center gap-2"><Banknote size={14} className="text-caramel" /> Cash on Delivery</li>
//           </ul>
//         </div>

//         <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-sand shadow-warm lg:aspect-[1/1]">
//           {hero?.imageUrl && (
//             <Image src={hero.imageUrl} alt={hero.name} fill priority
//               sizes="(min-width:1024px) 50vw, 100vw" className="object-cover" />
//           )}
//           {hero && (
//             <Link href={`/shop/${hero.slug}`}
//               className="absolute bottom-4 left-4 right-4 flex items-center justify-between rounded-2xl bg-white/90 p-4 backdrop-blur">
//               <div>
//                 <p className="text-[11px] font-semibold uppercase tracking-wider text-cocoa-muted">Chef&apos;s signature</p>
//                 <p className="font-display text-lg text-cocoa">{hero.name}</p>
//               </div>
//               <p className="text-sm font-bold text-berry">From {formatDA(hero.basePrice)}</p>
//             </Link>
//           )}
//         </div>
//       </section>

//       {/* ---------- Categories ---------- */}
//       {categories.length > 0 && (
//         <section>
//           <p className="text-[11px] font-semibold uppercase tracking-widest text-cocoa-muted">Explore our kitchen</p>
//           <h2 className="mb-6 font-display text-[28px] text-cocoa md:text-4xl">Curated Categories</h2>
//           <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
//             {categories.map((c) => (
//               <Link key={c.id} href={`/shop?category=${c.slug}`}
//                 className="flex flex-col items-center gap-3 rounded-2xl border border-line bg-white p-4 text-center transition-all hover:-translate-y-0.5 hover:shadow-bloom">
//                 <span className="relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-blush text-berry">
//                   {c.imageUrl ? (
//                     <Image src={c.imageUrl} alt={c.name} fill sizes="80px" className="object-cover" />
//                   ) : (
//                     <Flower2 size={28} />
//                   )}
//                 </span>
//                 <span>
//                   <span className="block font-display text-base text-cocoa">{c.name}</span>
//                   <span className="text-xs text-cocoa-muted">{c._count.products} items</span>
//                 </span>
//               </Link>
//             ))}
//           </div>
//         </section>
//       )}

//       {/* ---------- Best sellers ---------- */}
//       <section>
//         <div className="mb-6 flex items-end justify-between gap-4">
//           <div>
//             <p className="text-[11px] font-semibold uppercase tracking-widest text-cocoa-muted">Artisan&apos;s choice</p>
//             <h2 className="font-display text-[28px] text-cocoa md:text-4xl">Our Best Sellers</h2>
//           </div>
//           <Link href="/shop" className="hidden items-center gap-1 text-sm font-semibold text-berry sm:flex">
//             View all <ArrowRight size={16} />
//           </Link>
//         </div>
//         {products.length > 0 ? (
//           <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
//             {products.map((p) => <ProductCard key={p.id} product={p} />)}
//           </div>
//         ) : (
//           <p className="rounded-2xl border border-line bg-white p-8 text-center text-sm">
//             Our bakes are being prepared. Please check back in a moment.
//           </p>
//         )}
//       </section>

//       {/* ---------- Artisan standard ---------- */}
//       <section className="-mx-5 bg-sand px-5 py-16 md:-mx-12 md:px-12">
//         <div className="mx-auto max-w-7xl">
//           <div className="mx-auto mb-10 max-w-2xl text-center">
//             <p className="text-[11px] font-semibold uppercase tracking-widest text-cocoa-muted">The artisan standard</p>
//             <h2 className="font-display text-[28px] text-cocoa md:text-4xl">Purity in Every Whisk &amp; Fold</h2>
//           </div>
//           <div className="grid gap-5 md:grid-cols-3">
//             {[
//               { icon: Croissant, title: "Fresh Daily", text: "Every entremet, macaron and brioche is prepared each morning. What remains at night is donated, never resold." },
//               { icon: Sparkles, title: "Artisan Handmade", text: "Formulated with fine local ingredients, real butter and Madagascar vanilla beans. No artificial flavorings." },
//               { icon: Truck, title: "Fast Local Delivery", text: "Delivered safely across Laghouat and neighboring wilayas. Inspect your box, then pay in cash on delivery." },
//             ].map(({ icon: Icon, title, text }) => (
//               <div key={title} className="rounded-2xl border border-line bg-white p-6">
//                 <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-blush text-berry">
//                   <Icon size={22} />
//                 </span>
//                 <h3 className="mb-2 font-display text-xl text-cocoa">{title}</h3>
//                 <p className="text-sm leading-6">{text}</p>
//               </div>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* ---------- Custom cakes ---------- */}
//       <section className="grid items-center gap-8 overflow-hidden rounded-3xl border border-line bg-white md:grid-cols-2">
//         <div className="flex aspect-[4/3] items-center justify-center bg-blush text-berry md:aspect-auto md:h-full">
//           <Cake size={96} strokeWidth={1.2} />
//         </div>
//         <div className="space-y-4 p-6 md:p-10">
//           <span className="inline-block rounded-full bg-caramel px-3 py-1 text-[11px] font-semibold text-cocoa">
//             Events &amp; Celebrations
//           </span>
//           <h2 className="font-display text-[28px] text-cocoa md:text-4xl">Bespoke &amp; Custom Creations</h2>
//           <p className="leading-7">
//             A wedding, a birthday or an Eid gathering: our pastry makers sculpt your sweet
//             vision into reality, personalized by flavor, height and decoration.
//           </p>
//           <ul className="space-y-2 text-sm">
//             {["Personalized taste consultations", "Gluten-friendly and lower-sugar options", "Delivery and table setup in Laghouat"].map((t) => (
//               <li key={t} className="flex items-center gap-2">
//                 <Check size={16} className="text-success" /> {t}
//               </li>
//             ))}
//           </ul>
//           <Link href="/custom-cakes"
//             className="inline-flex h-12 items-center rounded-full bg-berry px-7 text-sm font-semibold text-white transition-colors hover:bg-berry-dark">
//             Request a Custom Cake
//           </Link>
//         </div>
//       </section>

//       {/* ---------- Testimonials ---------- */}
//       {testimonials.length > 0 && (
//         <section>
//           <p className="text-center text-[11px] font-semibold uppercase tracking-widest text-cocoa-muted">Voices from our patrons</p>
//           <h2 className="mb-8 text-center font-display text-[28px] text-cocoa md:text-4xl">Beloved Moments &amp; Reviews</h2>
//           <div className="grid gap-5 md:grid-cols-3">
//             {testimonials.slice(0, 3).map((t) => (
//               <figure key={t.id} className="flex flex-col gap-4 rounded-2xl border border-line bg-white p-6">
//                 <Stars rating={t.rating} />
//                 <blockquote className="flex-1 text-sm italic leading-6">“{t.comment}”</blockquote>
//                 <figcaption className="flex items-center gap-3 border-t border-line pt-4">
//                   <span className="flex h-9 w-9 items-center justify-center rounded-full bg-blush text-xs font-bold text-berry">
//                     {t.authorName.slice(0, 2).toUpperCase()}
//                   </span>
//                   <span className="text-sm font-semibold text-cocoa">{t.authorName}</span>
//                 </figcaption>
//               </figure>
//             ))}
//           </div>
//         </section>
//       )}
//     </div>
//   );
// }

// with motion

import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import {
  ArrowRight, Cake, Check, Croissant, Flower2, Sparkles, Truck, Wheat, Banknote,
} from "lucide-react";
import { getCategories, getProducts, getTestimonials } from "@/lib/api";
import { formatDA } from "@/lib/format";
import ProductCard from "@/components/ProductCard";
import Stars from "@/components/Stars";
import { Reveal, Stagger, StaggerItem, Float, Parallax } from "@/components/motion/Motion";
import { retry } from "@/lib/retry";

export default function HomePage() {
  return (
    <Suspense fallback={<div className="mx-auto h-[70vh] max-w-7xl animate-pulse rounded-3xl bg-sand" />}>
      <HomeContent />
    </Suspense>
  );
}

async function HomeContent() {
  // const [categories, products, testimonials] = await Promise.all([
  //   getCategories().catch(() => []),
  //   getProducts({ sort: "featured", limit: 4 }).then((r) => r.data).catch(() => []),
  //   getTestimonials().catch(() => []),
  // ]);
  const [categories, products, testimonials] = await Promise.all([
   retry(() => getCategories()).catch(() => []),
   retry(() => getProducts({ sort: "featured", limit: 4 })).then((r) => r.data).catch(() => []),
   retry(() => getTestimonials()).catch(() => []),
  ]);
  const hero = products[0];

  return (
    <div className="mx-auto max-w-7xl space-y-14 px-5 pt-8 md:space-y-16 md:px-12 md:pt-12">
      {/* ---------- Hero ---------- */}
      <section className="grid items-center gap-10 lg:grid-cols-2">
        <Stagger onMount stagger={0.12} delay={0.1} className="space-y-6">
          <StaggerItem>
            <span className="inline-flex items-center gap-2 rounded-full bg-blush px-4 py-1.5 text-xs font-semibold text-berry">
              <Flower2 size={14} /> Handcrafted in Laghouat, Algeria
            </span>
          </StaggerItem>
          <StaggerItem>
          <h1 className="font-display text-[34px] font-semibold leading-[42px] tracking-tight text-cocoa md:text-[44px] md:leading-[52px]">
            Baked with Love,
            <br />
            <em className="text-berry">Served with Joy</em>
          </h1>
          </StaggerItem>
          <StaggerItem>
            <p className="max-w-xl text-[17px] leading-7">
              From sunrise in our Laghouat atelier, we handcraft small-batch celebration
              cakes, ethereal macarons and slow-laminated viennoiseries.
            </p>
          </StaggerItem>
          <StaggerItem>
          <div className="flex flex-wrap gap-3">
            <Link href="/shop"
              className="inline-flex h-12 items-center gap-2 rounded-full bg-berry px-7 text-sm font-semibold text-white transition-colors hover:bg-berry-dark">
              Order Fresh Bakes <ArrowRight size={16} />
            </Link>
            <Link href="/custom-cakes"
              className="inline-flex h-12 items-center rounded-full bg-blush px-7 text-sm font-semibold text-berry transition-colors hover:bg-blush-dark">
              Request Custom Cake
            </Link>
          </div>
          </StaggerItem>
          <StaggerItem>
          <ul className="flex flex-wrap gap-x-6 gap-y-2 pt-2 text-xs font-semibold text-cocoa-soft">
            <li className="flex items-center gap-2"><Sparkles size={14} className="text-caramel" /> 100% Fresh Daily</li>
            <li className="flex items-center gap-2"><Wheat size={14} className="text-caramel" /> Pure Butter &amp; Vanilla</li>
            <li className="flex items-center gap-2"><Banknote size={14} className="text-caramel" /> Cash on Delivery</li>
          </ul>
          </StaggerItem>
        </Stagger>

        <Parallax offset={24}>
        <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-sand shadow-warm lg:aspect-[1/1]">
          {hero?.imageUrl && (
            <Image src={hero.imageUrl} alt={hero.name} fill priority
              sizes="(min-width:1024px) 50vw, 100vw" className="object-cover" />
          )}
          {hero && (
            <Float amount={6} duration={5} className="absolute bottom-4 left-4 right-4">
              <Link href={`/shop/${hero.slug}`}
                className="flex items-center justify-between rounded-2xl bg-white/90 p-4 backdrop-blur">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-cocoa-muted">Chef&apos;s signature</p>
                  <p className="font-display text-lg text-cocoa">{hero.name}</p>
                </div>
                <p className="text-sm font-bold text-berry">From {formatDA(hero.basePrice)}</p>
              </Link>
            </Float>
          )}
        </div>
        </Parallax>
      </section>

      {/* ---------- Categories ---------- */}
      {categories.length > 0 && (
        <section>
          <Reveal className="mb-6">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-cocoa-muted">Explore our kitchen</p>
            <h2 className="font-display text-[28px] text-cocoa md:text-4xl">Curated Categories</h2>
          </Reveal>
          <Stagger stagger={0.07} className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {categories.map((c) => (
              <StaggerItem key={c.id} className="min-w-0 *:h-full">
              <Link href={`/shop?category=${c.slug}`}
                className="flex flex-col items-center gap-3 rounded-2xl border border-line bg-white p-4 text-center transition-all hover:-translate-y-0.5 hover:shadow-bloom">
                <span className="relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-blush text-berry">
                  {c.imageUrl ? (
                    <Image src={c.imageUrl} alt={c.name} fill sizes="80px" className="object-cover" />
                  ) : (
                    <Flower2 size={28} />
                  )}
                </span>
                <span>
                  <span className="block font-display text-base text-cocoa">{c.name}</span>
                  <span className="text-xs text-cocoa-muted">{c._count.products} items</span>
                </span>
              </Link>
              </StaggerItem>
            ))}
          </Stagger>
        </section>
      )}

      {/* ---------- Best sellers ---------- */}
      <section>
        <Reveal className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-cocoa-muted">Artisan&apos;s choice</p>
            <h2 className="font-display text-[28px] text-cocoa md:text-4xl">Our Best Sellers</h2>
          </div>
          <Link href="/shop" className="hidden items-center gap-1 text-sm font-semibold text-berry sm:flex">
            View all <ArrowRight size={16} />
          </Link>
        </Reveal>
        {products.length > 0 ? (
          <Stagger stagger={0.1} className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((p) => (
              <StaggerItem key={p.id} className="min-w-0 *:h-full">
                <ProductCard product={p} />
              </StaggerItem>
            ))}
          </Stagger>
        ) : (
          <p className="rounded-2xl border border-line bg-white p-8 text-center text-sm">
            Our bakes are being prepared. Please check back in a moment.
          </p>
        )}
      </section>

      {/* ---------- Artisan standard ---------- */}
      <section className="-mx-5 bg-sand px-5 py-16 md:-mx-12 md:px-12">
        <div className="mx-auto max-w-7xl">
          <Reveal className="mx-auto mb-10 max-w-2xl text-center">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-cocoa-muted">The artisan standard</p>
            <h2 className="font-display text-[28px] text-cocoa md:text-4xl">Purity in Every Whisk &amp; Fold</h2>
          </Reveal>
          <Stagger stagger={0.12} className="grid gap-5 md:grid-cols-3">
            {[
              { icon: Croissant, title: "Fresh Daily", text: "Every entremet, macaron and brioche is prepared each morning. What remains at night is donated, never resold." },
              { icon: Sparkles, title: "Artisan Handmade", text: "Formulated with fine local ingredients, real butter and Madagascar vanilla beans. No artificial flavorings." },
              { icon: Truck, title: "Fast Local Delivery", text: "Delivered safely across Laghouat and neighboring wilayas. Inspect your box, then pay in cash on delivery." },
            ].map(({ icon: Icon, title, text }) => (
              <StaggerItem key={title} className="min-w-0">
                <div className="h-full rounded-2xl border border-line bg-white p-6">
                  <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-blush text-berry">
                    <Icon size={22} />
                  </span>
                  <h3 className="mb-2 font-display text-xl text-cocoa">{title}</h3>
                  <p className="text-sm leading-6">{text}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* ---------- Custom cakes ---------- */}
      <Reveal>
      <section className="grid items-center gap-8 overflow-hidden rounded-3xl border border-line bg-white md:grid-cols-2">
        <div className="flex aspect-[4/3] items-center justify-center bg-blush text-berry md:aspect-auto md:h-full">
          <Float amount={10} duration={5}>
            <Cake size={96} strokeWidth={1.2} />
          </Float>
        </div>
        <div className="space-y-4 p-6 md:p-10">
          <span className="inline-block rounded-full bg-caramel px-3 py-1 text-[11px] font-semibold text-cocoa">
            Events &amp; Celebrations
          </span>
          <h2 className="font-display text-[28px] text-cocoa md:text-4xl">Bespoke &amp; Custom Creations</h2>
          <p className="leading-7">
            A wedding, a birthday or an Eid gathering: our pastry makers sculpt your sweet
            vision into reality, personalized by flavor, height and decoration.
          </p>
          <ul className="space-y-2 text-sm">
            {["Personalized taste consultations", "Gluten-friendly and lower-sugar options", "Delivery and table setup in Laghouat"].map((t) => (
              <li key={t} className="flex items-center gap-2">
                <Check size={16} className="text-success" /> {t}
              </li>
            ))}
          </ul>
          <Link href="/custom-cakes"
            className="inline-flex h-12 items-center rounded-full bg-berry px-7 text-sm font-semibold text-white transition-colors hover:bg-berry-dark">
            Request a Custom Cake
          </Link>
        </div>
      </section>
      </Reveal>

      {/* ---------- Testimonials ---------- */}
      {testimonials.length > 0 && (
        <section>
          <Reveal className="mb-8">
            <p className="text-center text-[11px] font-semibold uppercase tracking-widest text-cocoa-muted">Voices from our patrons</p>
            <h2 className="text-center font-display text-[28px] text-cocoa md:text-4xl">Beloved Moments &amp; Reviews</h2>
          </Reveal>
          <Stagger stagger={0.12} className="grid gap-5 md:grid-cols-3">
            {testimonials.slice(0, 3).map((t) => (
              <StaggerItem key={t.id} className="min-w-0 *:h-full">
              <figure className="flex flex-col gap-4 rounded-2xl border border-line bg-white p-6">
                <Stars rating={t.rating} />
                <blockquote className="flex-1 text-sm italic leading-6">“{t.comment}”</blockquote>
                <figcaption className="flex items-center gap-3 border-t border-line pt-4">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-blush text-xs font-bold text-berry">
                    {t.authorName.slice(0, 2).toUpperCase()}
                  </span>
                  <span className="text-sm font-semibold text-cocoa">{t.authorName}</span>
                </figcaption>
              </figure>
              </StaggerItem>
            ))}
          </Stagger>
        </section>
      )}
    </div>
  );
}