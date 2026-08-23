type EcommerceItem = Record<string, unknown>;

export function pushEcommerceEvent(
  event: string,
  value: number,
  items: EcommerceItem[]
): void {
  if (typeof window === "undefined") return;

  const dataLayer = ((window as any).dataLayer =
    (window as any).dataLayer || []);
  dataLayer.push({
    event,
    ecommerce: {
      currency: "KES",
      value,
      items,
    },
  });
}
