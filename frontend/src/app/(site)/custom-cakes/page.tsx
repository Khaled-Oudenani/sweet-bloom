import { Cake, MessageCircle, Palette } from "lucide-react";
import CustomCakeForm from "@/components/CustomCakeForm";

export const metadata = { title: "Custom Cakes — Sweet Bloom" };

const STEPS = [
  { icon: Palette, title: "Tell us your vision", text: "Share the occasion, guests count, flavors and inspiration." },
  { icon: MessageCircle, title: "We contact you", text: "Our pastry chef calls within 24 hours for a tasting consultation and a clear price." },
  { icon: Cake, title: "Baked & delivered", text: "Your cake is baked fresh and delivered in a cold box across Laghouat." },
];

export default function CustomCakesPage() {
  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-5 pt-8 md:px-12 md:pt-12 lg:grid-cols-[1fr_1.1fr]">
      <div className="space-y-6">
        <span className="inline-block rounded-full bg-caramel px-3 py-1 text-[11px] font-semibold text-cocoa">
          Events &amp; Celebrations
        </span>
        <h1 className="font-display text-[34px] font-semibold leading-tight text-cocoa break-words md:text-[44px]">
          Bespoke &amp; Custom Creations
        </h1>
        <p className="leading-7">
          A wedding, an engagement or a birthday: we sculpt your sweet vision into reality, personalized by
          flavor, height, sponge and decoration.
        </p>
        <ol className="space-y-4">
          {STEPS.map(({ icon: Icon, title, text }, i) => (
            <li key={title} className="flex gap-4 rounded-2xl border border-line bg-white p-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blush text-berry">
                <Icon size={22} />
              </span>
              <div>
                <p className="font-display text-lg text-cocoa">{i + 1}. {title}</p>
                <p className="text-sm leading-6">{text}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
      <CustomCakeForm />
    </div>
  );
}