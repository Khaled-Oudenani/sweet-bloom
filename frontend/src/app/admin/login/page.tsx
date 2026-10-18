"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Flower2 } from "lucide-react";
import { ApiError } from "@/lib/api";
import { adminLogin, getToken, setToken } from "@/lib/admin-api";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (getToken()) router.replace("/admin");
  }, [router]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { token } = await adminLogin(email.trim(), password);
      setToken(token);
      router.replace("/admin");
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.status === 429 ? "Too many attempts. Try again in a few minutes." : err.message
          : "Could not reach the server."
      );
      setLoading(false);
    }
  }

  const inputCls =
    "h-11 w-full rounded-2xl border-[1.5px] border-line bg-white px-4 text-sm outline-none focus:border-berry focus:ring-[3px] focus:ring-blush";

  return (
    <div className="flex min-h-screen items-center justify-center px-5">
      <form onSubmit={onSubmit} className="w-full max-w-sm space-y-5 rounded-2xl border border-line bg-white p-7 shadow-warm">
        <div className="flex flex-col items-center gap-2 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-blush text-berry"><Flower2 size={24} /></span>
          <h1 className="font-display text-2xl font-semibold text-cocoa">Sweet Bloom Admin</h1>
          <p className="text-xs text-cocoa-muted">Sign in to manage orders and products</p>
        </div>
        <label className="block space-y-1.5">
          <span className="text-xs font-semibold text-cocoa">Email</span>
          <input className={inputCls} type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" />
        </label>
        <label className="block space-y-1.5">
          <span className="text-xs font-semibold text-cocoa">Password</span>
          <input className={inputCls} type="password" required value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
        </label>
        {error && <p className="rounded-xl bg-danger/10 p-3 text-xs text-danger">{error}</p>}
        <button disabled={loading} className="h-12 w-full rounded-full bg-berry text-sm font-semibold text-white hover:bg-berry-dark disabled:opacity-60">
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </div>
  );
}