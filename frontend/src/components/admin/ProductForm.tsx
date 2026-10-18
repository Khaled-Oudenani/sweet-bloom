"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { ApiError } from "@/lib/api";
import {
  createProduct, getAdminCategories, getTags, updateProduct,
  type AdminProductDetail, type ProductPayload, type TagItem,
} from "@/lib/admin-api";

const BADGES = [
  { value: "", label: "No badge" },
  { value: "BESTSELLER", label: "Bestseller" },
  { value: "NEW", label: "New" },
  { value: "CHEFS_PICK", label: "Chef's Pick" },
  { value: "POPULAR", label: "Popular" },
  { value: "LIMITED", label: "Limited Batch" },
];

const inputCls =
  "h-11 w-full rounded-2xl border-[1.5px] border-line bg-white px-4 text-sm outline-none focus:border-berry focus:ring-[3px] focus:ring-blush";
const areaCls =
  "w-full rounded-2xl border-[1.5px] border-line bg-white px-4 py-3 text-sm outline-none focus:border-berry focus:ring-[3px] focus:ring-blush";
const card = "space-y-4 rounded-2xl border border-line bg-white p-5";

type Row = { key: string; label: string; serves: string; price: string; stock: string };
const newRow = (): Row => ({ key: crypto.randomUUID(), label: "", serves: "", price: "", stock: "10" });

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-semibold text-cocoa">{label}</span>
      {children}
      {error && <span className="block text-xs text-danger">{error}</span>}
    </label>
  );
}

export default function ProductForm({ product, onSaved }: { product?: AdminProductDetail; onSaved?: () => void }) {
  const router = useRouter();
  const editing = !!product;

  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
  const [dietary, setDietary] = useState<TagItem[]>([]);
  const [flavors, setFlavors] = useState<TagItem[]>([]);

  const [name, setName] = useState(product?.name ?? "");
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [categoryId, setCategoryId] = useState(product?.categoryId ? String(product.categoryId) : "");
  const [shortDescription, setShort] = useState(product?.shortDescription ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [ingredients, setIngredients] = useState(product?.ingredients ?? "");
  const [allergyInfo, setAllergy] = useState(product?.allergyInfo ?? "");
  const [badge, setBadge] = useState(product?.badge ?? "");
  const [isFeatured, setFeatured] = useState(product?.isFeatured ?? false);
  const [isActive, setActive] = useState(product?.isActive ?? true);
  const [rows, setRows] = useState<Row[]>(
    product?.variants.length
      ? product.variants.map((v) => ({ key: crypto.randomUUID(), label: v.label, serves: v.serves ?? "", price: String(v.price), stock: String(v.stock) }))
      : [newRow()]
  );
  const [tagIds, setTagIds] = useState<number[]>(product?.dietaryTags.map((t) => t.id) ?? []);
  const [flavorIds, setFlavorIds] = useState<number[]>(product?.flavors.map((t) => t.id) ?? []);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState("");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getAdminCategories().then(setCategories).catch(() => setServerError("Could not load categories"));
    getTags().then((t) => { setDietary(t.dietaryTags); setFlavors(t.flavors); }).catch(() => {});
  }, []);

  const toggle = (list: number[], set: (v: number[]) => void, id: number) =>
    set(list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);

  const updateRow = (key: string, patch: Partial<Row>) =>
    setRows((rs) => rs.map((r) => (r.key === key ? { ...r, ...patch } : r)));

  function validate() {
    const e: Record<string, string> = {};
    if (name.trim().length < 2) e.name = "Name is required";
    if (!categoryId) e.categoryId = "Select a category";
    if (rows.length === 0) e.variants = "Add at least one size";
    rows.forEach((r) => {
      const price = Number(r.price);
      const stock = Number(r.stock);
      if (!r.label.trim() || !Number.isInteger(price) || price < 1 || !Number.isInteger(stock) || stock < 0) {
        e.variants = "Each size needs a label, a price (integer DA) and a stock (0 or more)";
      }
    });
    return e;
  }

  async function onSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    setServerError("");
    setSaved(false);
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length) return;

    const payload: ProductPayload = {
      name: name.trim(),
      slug: slug.trim() || undefined,
      categoryId: Number(categoryId),
      shortDescription: shortDescription.trim() || undefined,
      description: description.trim() || undefined,
      ingredients: ingredients.trim() || undefined,
      allergyInfo: allergyInfo.trim() || undefined,
      badge: badge || (editing ? null : undefined),
      isFeatured,
      isActive,
      variants: rows.map((r) => ({
        label: r.label.trim(),
        serves: r.serves.trim() || undefined,
        price: Number(r.price),
        stock: Number(r.stock),
      })),
      dietaryTagIds: tagIds,
      flavorIds,
    };

    setSaving(true);
    try {
      if (product) {
        await updateProduct(product.id, payload);
        setSaved(true);
        onSaved?.();
      } else {
        const res = await createProduct(payload);
        const id = res?.data?.id;
        router.push(id ? `/admin/products/${id}` : "/admin/products"); // الصور تُرفع من صفحة التعديل
      }
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.errors?.length) {
          const map: Record<string, string> = {};
          err.errors.forEach((x) => { const k = String(x.path[0] ?? ""); if (k && !map[k]) map[k] = x.message; });
          setErrors(map);
        }
        setServerError(err.status === 409 ? "A product with this slug already exists." : err.message);
      } else {
        setServerError("Could not reach the server.");
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      <section className={card}>
        <h2 className="font-display text-xl text-cocoa">Basic information</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Name *" error={errors.name}>
            <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} />
          </Field>
          <Field label="Slug (optional, auto-generated)" error={errors.slug}>
            <input className={inputCls} value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="strawberry-cake" />
          </Field>
          <Field label="Category *" error={errors.categoryId}>
            <select className={inputCls} value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
              <option value="">Select a category</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </Field>
          <Field label="Badge">
            <select className={inputCls} value={badge} onChange={(e) => setBadge(e.target.value)}>
              {BADGES.map((b) => <option key={b.value} value={b.value}>{b.label}</option>)}
            </select>
          </Field>
        </div>
        <Field label="Short description (shown on cards)" error={errors.shortDescription}>
          <input className={inputCls} value={shortDescription} onChange={(e) => setShort(e.target.value)} />
        </Field>
        <Field label="Full description" error={errors.description}>
          <textarea className={areaCls} rows={4} value={description} onChange={(e) => setDescription(e.target.value)} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Ingredients" error={errors.ingredients}>
            <textarea className={areaCls} rows={3} value={ingredients} onChange={(e) => setIngredients(e.target.value)} />
          </Field>
          <Field label="Allergy information" error={errors.allergyInfo}>
            <textarea className={areaCls} rows={3} value={allergyInfo} onChange={(e) => setAllergy(e.target.value)} placeholder="Contains gluten, eggs, dairy" />
          </Field>
        </div>
      </section>

      <section className={card}>
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl text-cocoa">Sizes, prices &amp; stock</h2>
          <button type="button" onClick={() => setRows((r) => [...r, newRow()])}
            className="flex items-center gap-1 rounded-full bg-blush px-3 py-1.5 text-xs font-semibold text-berry hover:bg-blush-dark">
            <Plus size={14} /> Add size
          </button>
        </div>
        <div className="space-y-3">
          {rows.map((r) => (
            <div key={r.key} className="grid grid-cols-2 gap-2 rounded-xl bg-cream p-3 sm:grid-cols-[1.2fr_1.2fr_1fr_1fr_auto]">
              <input className={inputCls} placeholder='Label (e.g. 6")' value={r.label} onChange={(e) => updateRow(r.key, { label: e.target.value })} />
              <input className={inputCls} placeholder="Serves (e.g. 4-6)" value={r.serves} onChange={(e) => updateRow(r.key, { serves: e.target.value })} />
              <input className={inputCls} placeholder="Price DA" inputMode="numeric" value={r.price} onChange={(e) => updateRow(r.key, { price: e.target.value })} />
              <input className={inputCls} placeholder="Stock" inputMode="numeric" value={r.stock} onChange={(e) => updateRow(r.key, { stock: e.target.value })} />
              <button type="button" disabled={rows.length === 1} onClick={() => setRows((rs) => rs.filter((x) => x.key !== r.key))}
                className="flex h-11 items-center justify-center text-danger disabled:opacity-30" aria-label="Remove size">
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
        {errors.variants && <p className="text-xs text-danger">{errors.variants}</p>}
        {editing && <p className="text-[11px] text-cocoa-muted">Saving replaces all sizes with the rows above. Customers with this item in their basket may need to re-add it.</p>}
      </section>

      <section className={card}>
        <h2 className="font-display text-xl text-cocoa">Dietary tags &amp; flavors</h2>
        <div className="space-y-2">
          <p className="text-xs font-semibold text-cocoa">Dietary</p>
          <div className="flex flex-wrap gap-2">
            {dietary.map((t) => (
              <button type="button" key={t.id} onClick={() => toggle(tagIds, setTagIds, t.id)}
                className={`rounded-full px-4 py-1.5 text-xs font-semibold ${tagIds.includes(t.id) ? "bg-pistachio-ink text-white" : "bg-pistachio text-pistachio-ink"}`}>
                {t.name}
              </button>
            ))}
            {dietary.length === 0 && <span className="text-xs text-cocoa-muted">No tags found.</span>}
          </div>
        </div>
        <div className="space-y-2">
          <p className="text-xs font-semibold text-cocoa">Flavors</p>
          <div className="flex flex-wrap gap-2">
            {flavors.map((t) => (
              <button type="button" key={t.id} onClick={() => toggle(flavorIds, setFlavorIds, t.id)}
                className={`rounded-full px-4 py-1.5 text-xs font-semibold ${flavorIds.includes(t.id) ? "bg-berry text-white" : "border border-line bg-white text-cocoa"}`}>
                {t.name}
              </button>
            ))}
            {flavors.length === 0 && <span className="text-xs text-cocoa-muted">No flavors found.</span>}
          </div>
        </div>
      </section>

      <section className={`${card} sm:flex-row`}>
        <label className="flex items-center gap-3 text-sm font-semibold text-cocoa">
          <input type="checkbox" className="h-5 w-5 accent-berry" checked={isActive} onChange={(e) => setActive(e.target.checked)} />
          Visible in the shop
        </label>
        <label className="flex items-center gap-3 text-sm font-semibold text-cocoa">
          <input type="checkbox" className="h-5 w-5 accent-berry" checked={isFeatured} onChange={(e) => setFeatured(e.target.checked)} />
          Featured (shown on the home page)
        </label>
      </section>

      {serverError && <p className="rounded-xl bg-danger/10 p-3 text-sm text-danger">{serverError}</p>}
      {saved && <p className="rounded-xl bg-success/15 p-3 text-sm font-semibold text-success">Product saved.</p>}

      <button disabled={saving} className="h-12 rounded-full bg-berry px-8 text-sm font-semibold text-white hover:bg-berry-dark disabled:opacity-60">
        {saving ? "Saving..." : editing ? "Save changes" : "Create product"}
      </button>
    </form>
  );
}