"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { ApiError, submitReview } from "@/lib/api";

export default function ReviewForm({ slug }: { slug: string }) {
  const [authorName, setAuthorName] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      await submitReview(slug, { authorName, rating, comment: comment.trim() || undefined });
      setStatus("ok");
      setAuthorName("");
      setComment("");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong");
      setStatus("error");
    }
  }

  if (status === "ok") {
    return (
      <p className="rounded-2xl bg-pistachio p-5 text-sm font-semibold text-pistachio-ink">
        Thank you! Your review will appear after approval.
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border border-line bg-white p-5">
      <h3 className="font-display text-xl text-cocoa">Share your experience</h3>
      <div className="flex gap-1" role="radiogroup" aria-label="Rating">
        {[1, 2, 3, 4, 5].map((n) => (
          <button type="button" key={n} onClick={() => setRating(n)} aria-label={`${n} stars`}>
            <Star size={24} className={n <= rating ? "fill-caramel text-caramel" : "text-line"} />
          </button>
        ))}
      </div>
      <input
        required
        minLength={2}
        value={authorName}
        onChange={(e) => setAuthorName(e.target.value)}
        placeholder="Your name"
        className="h-11 w-full rounded-2xl border-[1.5px] border-line px-4 text-sm outline-none focus:border-berry focus:ring-[3px] focus:ring-blush"
      />
      <textarea
        value={comment}
        maxLength={1000}
        onChange={(e) => setComment(e.target.value)}
        rows={3}
        placeholder="Tell us about the taste (optional)"
        className="w-full rounded-2xl border-[1.5px] border-line px-4 py-3 text-sm outline-none focus:border-berry focus:ring-[3px] focus:ring-blush"
      />
      {status === "error" && <p className="text-xs text-danger">{error}</p>}
      <button
        disabled={status === "loading"}
        className="h-11 rounded-full bg-berry px-6 text-sm font-semibold text-white hover:bg-berry-dark disabled:opacity-60"
      >
        {status === "loading" ? "Sending..." : "Submit review"}
      </button>
    </form>
  );
}