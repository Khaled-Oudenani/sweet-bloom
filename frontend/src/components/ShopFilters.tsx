"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { Search } from "lucide-react";
import type { Category } from "@/lib/api";

// تأكد أن هذه الـ slugs موجودة في جدول DietaryTag (Prisma Studio)
const DIETARY = [
  { slug: "halal", label: "Halal Certified" },
  { slug: "gluten-free", label: "Gluten-Free" },
  { slug: "nut-free", label: "Nut-Free" },
  { slug: "vegetarian", label: "Vegetarian" },
];

const SORTS = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: low to high" },
  { value: "price_desc", label: "Price: high to low" },
];

const chip = (active: boolean) =>
  `rounded-full border px-4 py-1.5 text-xs font-semibold transition-colors ${
    active
      ? "border-berry bg-berry text-white"
      : "border-line bg-white text-cocoa hover:border-berry"
  }`;

export default function ShopFilters({
  categories,
  total,
}: {
  categories: Category[];
  total: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [search, setSearch] = useState(params.get("search") ?? "");

  function update(changes: Record<string, string | null>) {
    const next = new URLSearchParams(params.toString());
    Object.entries(changes).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)));
    next.delete("limit"); // أي تغيير فلتر يرجع للبداية
    const qs = next.toString();
    startTransition(() => {
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    });
  }

  // debounce للبحث
  useEffect(() => {
    const t = setTimeout(() => {
      if ((params.get("search") ?? "") !== search.trim()) {
        update({ search: search.trim() || null });
      }
    }, 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const activeCategory = params.get("category");
  const activeDietary = (params.get("dietary") ?? "").split(",").filter(Boolean);

  function toggleDietary(slug: string) {
    const next = activeDietary.includes(slug)
      ? activeDietary.filter((s) => s !== slug)
      : [...activeDietary, slug];
    update({ dietary: next.length ? next.join(",") : null });
  }

  return (
    <div className={`space-y-5 rounded-2xl border border-line bg-white p-4 shadow-warm md:p-6 ${pending ? "opacity-70" : ""}`}>
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative min-w-0 flex-1">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-cocoa-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search cakes, macarons, cookies..."
            className="h-11 w-full rounded-full border-[1.5px] border-line bg-white pl-11 pr-4 text-sm outline-none focus:border-berry focus:ring-[3px] focus:ring-blush"
          />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <span className="text-cocoa-muted">Sort by</span>
          <select
            value={params.get("sort") ?? "featured"}
            onChange={(e) => update({ sort: e.target.value === "featured" ? null : e.target.value })}
            className="h-11 rounded-full border-[1.5px] border-line bg-white px-4 text-sm outline-none focus:border-berry"
          >
            {SORTS.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="space-y-2">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-cocoa-muted">Pastry category</p>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => update({ category: null })} className={chip(!activeCategory)}>
            All Items ({total})
          </button>
          {categories.map((c) => (
            <button key={c.id} onClick={() => update({ category: c.slug })} className={chip(activeCategory === c.slug)}>
              {c.name} ({c._count.products})
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-cocoa-muted">Dietary &amp; craft standards</p>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => update({ dietary: null })}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold ${
              activeDietary.length === 0 ? "bg-pistachio-ink text-white" : "bg-pistachio text-pistachio-ink"
            }`}>
            All
          </button>
          {DIETARY.map((d) => (
            <button key={d.slug} onClick={() => toggleDietary(d.slug)}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold ${
                activeDietary.includes(d.slug) ? "bg-pistachio-ink text-white" : "bg-pistachio text-pistachio-ink"
              }`}>
              {d.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}