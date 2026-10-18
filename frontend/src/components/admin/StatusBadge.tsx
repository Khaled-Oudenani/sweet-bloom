const STYLES: Record<string, string> = {
  PENDING: "bg-caramel/25 text-cocoa",
  CONFIRMED: "bg-blush text-berry",
  PREPARING: "bg-sand text-cocoa",
  OUT_FOR_DELIVERY: "bg-pistachio text-pistachio-ink",
  DELIVERED: "bg-success/15 text-success",
  CANCELLED: "bg-danger/10 text-danger",
  RETURNED: "bg-line text-cocoa-soft",
};

export default function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-block whitespace-nowrap rounded-full px-3 py-1 text-[11px] font-bold ${STYLES[status] ?? "bg-sand text-cocoa"}`}>
      {status.replaceAll("_", " ")}
    </span>
  );
}