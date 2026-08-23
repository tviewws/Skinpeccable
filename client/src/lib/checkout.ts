/*
 * SKINPECCABLE GLOWTIQUE — Checkout pricing logic
 * Delivery zones, zone matching and discount/total maths.
 * Update prices / keywords here when rates change.
 */

export interface DeliveryZone {
  id: string;
  label: string;
  fee: number;
  keywords: string[];
}

export type DiscountResult = {
  type: "percentage" | "fixed";
  value: number;
  label: string;
};

export const DELIVERY_ZONES: DeliveryZone[] = [
  {
    id: "zone0",
    label: "Zone 0 — Store Pick-Up",
    fee: 0,
    keywords: [
      "lavington mall",
      "pick up",
      "pickup",
      "collect in store",
      "store pickup",
    ],
  },
  {
    id: "zone1",
    label: "Zone 1 — Lavington & Surrounds",
    fee: 200,
    keywords: [
      "lavington",
      "denis pritt",
      "kileleshwa",
      "valley arcade",
      "riverside drive",
      "spring valley",
      "abc place",
      "mpaka road",
      "parklands",
    ],
  },
  {
    id: "zone2",
    label: "Zone 2 — Central Nairobi",
    fee: 300,
    keywords: [
      "hurlingham",
      "yaya",
      "kilimani",
      "upper hill",
      "upperhill",
      "serena",
      "cbd",
      "city centre",
      "city center",
      "chiromo",
      "nairobi hospital",
      "knh",
      "prestige",
      "strathmore",
      "coptic",
      "madaraka",
      "oshwal",
      "highrise",
      "nairobi west",
      "nyayo",
    ],
  },
  {
    id: "zone3",
    label: "Zone 3 — Mid Nairobi",
    fee: 350,
    keywords: [
      "westgate",
      "ngara",
      "eastleigh",
      "pangani",
      "muthaiga",
      "utalii",
      "t-mall",
      "capital centre",
      "dci",
      "balozi",
      "aga khan",
      "mp shah",
      "dagoretti",
      "buruburu",
      "donholm",
      "jericho",
      "kasarani",
      "kangemi",
      "highridge",
      "westlands",
    ],
  },
  {
    id: "zone4",
    label: "Zone 4 — Outer Nairobi",
    fee: 500,
    keywords: [
      "trm",
      "thika road",
      "thika rd",
      "garden city",
      "usiu",
      "zimmerman",
      "githurai",
      "kahawa wendani",
      "kariobangi",
      "lucky summer",
      "loresho",
      "peponi",
      "uthiru",
      "kabete",
      "delta",
      "village market",
      "runda",
      "gigiri",
      "karura",
    ],
  },
  {
    id: "zone5",
    label: "Zone 5 — Nairobi Environs",
    fee: 600,
    keywords: [
      "ruaka",
      "ndenderu",
      "ruiru",
      "syokimau",
      "mlolongo",
      "embakasi",
      "pipeline",
      "tassia",
      "ngong road",
      "rongai",
      "athi river",
      "kitengela",
      "ngong",
      "kahawa",
      "juja",
    ],
  },
  {
    id: "pickup_mtaani",
    label: "Pick Up Mtaani — Next Day",
    fee: 250,
    keywords: ["pick up mtaani", "pickup mtaani", "mtaani"],
  },
  {
    id: "wells_fargo",
    label: "Wells Fargo — Next Day",
    fee: 350,
    keywords: ["wells fargo", "wellsfargo"],
  },
];

// Zones shown in the sidebar fee guide (exclude zone0 — it's free / pick-up only)
export const DISPLAY_ZONES = DELIVERY_ZONES.filter(z => z.id !== "zone0");

// Match a typed/autocompleted address to a delivery zone
export function getDeliveryZone(address: string): DeliveryZone | null {
  const lower = address.toLowerCase();
  for (const zone of DELIVERY_ZONES) {
    if (zone.keywords.some(kw => lower.includes(kw))) {
      return zone;
    }
  }
  return null;
}

// Discount value in KES for a subtotal, never exceeding the subtotal
export function getDiscountAmount(
  subtotal: number,
  discount: DiscountResult | null
): number {
  if (!discount) return 0;
  if (discount.type === "percentage") {
    return Math.round((subtotal * discount.value) / 100);
  }
  return Math.min(discount.value, subtotal);
}

export function getOrderTotal(
  subtotal: number,
  deliveryFee: number,
  discount: DiscountResult | null
): number {
  return subtotal + deliveryFee - getDiscountAmount(subtotal, discount);
}
