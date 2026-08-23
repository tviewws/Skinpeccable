import type { CartItem } from "@/contexts/CartContext";

export function toOrderItems(items: CartItem[]) {
  return items.map(i => ({
    name: i.name,
    price: i.price,
    qty: i.quantity,
  }));
}
