"use client";

import { useState } from "react";

export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/newsletter`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error();
      setStatus("ok");
      setEmail("");
    } catch {
      setStatus("error");
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-2">
      <div className="flex gap-2">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Your email address"
          className="h-11 min-w-0 flex-1 rounded-full border-[1.5px] border-line bg-white px-4 text-sm outline-none focus:border-berry focus:ring-[3px] focus:ring-blush"
        />
        <button
          disabled={status === "loading"}
          className="h-11 rounded-full bg-berry px-5 text-sm font-semibold text-white transition-colors hover:bg-berry-dark disabled:opacity-60"
        >
          Subscribe
        </button>
      </div>
      {status === "ok" && <p className="text-xs text-success">Thank you, you're on the list!</p>}
      {status === "error" && <p className="text-xs text-danger">Something went wrong. Try again.</p>}
    </form>
  );
}