import { Star } from "lucide-react";

export default function Stars({ rating, size = 14 }: { rating: number; size?: number }) {
  const filled = Math.round(rating);
  return (
    <span className="inline-flex gap-0.5" aria-label={`${rating} out of 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={size}
          className={n <= filled ? "fill-caramel text-caramel" : "text-line"}
        />
      ))}
    </span>
  );
}