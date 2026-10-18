"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { ApiError } from "@/lib/api";
import { getAdminProduct, type AdminProductDetail } from "@/lib/admin-api";
import ProductForm from "./ProductForm";
import ProductImages from "./ProductImages";

export default function ProductEditView() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<AdminProductDetail | null>(null);
  const [error, setError] = useState("");
  const [version, setVersion] = useState(0);

  const load = useCallback(async () => {
    try {
      setProduct(await getAdminProduct(Number(id)));
      setVersion((v) => v + 1);
      setError("");
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Could not load the product");
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  if (error) return <p className="rounded-xl bg-danger/10 p-4 text-sm text-danger">{error}</p>;
  if (!product) return <div className="h-96 animate-pulse rounded-2xl bg-sand" />;

  return (
    <div className="space-y-5">
      <Link href="/admin/products" className="inline-flex items-center gap-1 text-sm font-semibold text-berry">
        <ArrowLeft size={16} /> Back to products
      </Link>
      <h1 className="font-display text-3xl font-semibold text-cocoa">{product.name}</h1>
      <div className="grid items-start gap-5 xl:grid-cols-[1fr_380px]">
        <ProductForm key={version} product={product} onSaved={load} />
        <ProductImages product={product} onChange={load} />
      </div>
    </div>
  );
}