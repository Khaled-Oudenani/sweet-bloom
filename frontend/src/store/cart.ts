import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartItem = {
  variantId: number;
  productId: number;
  slug: string;
  name: string;
  variantLabel: string;
  price: number; // DZD للعرض فقط، السيرفر يعيد الحساب
  image?: string;
  quantity: number;
  inscription?: string;
};

const keyOf = (i: Pick<CartItem, "variantId" | "inscription">) =>
  `${i.variantId}|${i.inscription ?? ""}`;

type CartState = {
  items: CartItem[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (item: CartItem) => void;
  setQuantity: (variantId: number, inscription: string | undefined, qty: number) => void;
  removeItem: (variantId: number, inscription?: string) => void;
  clear: () => void;
};

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      isOpen: false,
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      addItem: (item) =>
        set((s) => {
          const exists = s.items.find((i) => keyOf(i) === keyOf(item));
          return {
            isOpen: true,
            items: exists
              ? s.items.map((i) =>
                  keyOf(i) === keyOf(item)
                    ? { ...i, quantity: i.quantity + item.quantity }
                    : i
                )
              : [...s.items, item],
          };
        }),
      setQuantity: (variantId, inscription, qty) =>
        set((s) => ({
          items: s.items
            .map((i) =>
              keyOf(i) === keyOf({ variantId, inscription })
                ? { ...i, quantity: qty }
                : i
            )
            .filter((i) => i.quantity > 0),
        })),
      removeItem: (variantId, inscription) =>
        set((s) => ({
          items: s.items.filter(
            (i) => keyOf(i) !== keyOf({ variantId, inscription })
          ),
        })),
      clear: () => set({ items: [] }),
    }),
    {
      name: "sweet-bloom-cart",
      partialize: (s) => ({ items: s.items }), // لا نحفظ isOpen
    }
  )
);