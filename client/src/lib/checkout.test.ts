import { describe, expect, it } from "vitest";
import {
  DELIVERY_ZONES,
  DISPLAY_ZONES,
  getDeliveryZone,
  getDiscountAmount,
  getOrderTotal,
  type DiscountResult,
} from "./checkout";

describe("DELIVERY_ZONES", () => {
  it("has unique ids and non-empty keyword lists", () => {
    const ids = DELIVERY_ZONES.map(z => z.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const zone of DELIVERY_ZONES) {
      expect(zone.keywords.length).toBeGreaterThan(0);
      expect(zone.fee).toBeGreaterThanOrEqual(0);
    }
  });

  it("stores keywords lowercased so matching is case-insensitive", () => {
    for (const zone of DELIVERY_ZONES) {
      for (const keyword of zone.keywords) {
        expect(keyword).toBe(keyword.toLowerCase());
      }
    }
  });
});

describe("DISPLAY_ZONES", () => {
  it("excludes the free store pick-up zone", () => {
    expect(DISPLAY_ZONES.map(z => z.id)).not.toContain("zone0");
    expect(DISPLAY_ZONES).toHaveLength(DELIVERY_ZONES.length - 1);
  });
});

describe("getDeliveryZone", () => {
  it("returns null when no keyword matches", () => {
    expect(getDeliveryZone("Mombasa, Nyali Beach")).toBeNull();
    expect(getDeliveryZone("")).toBeNull();
  });

  it("matches keywords regardless of case and surrounding text", () => {
    expect(getDeliveryZone("KILIMANI, Nairobi")?.id).toBe("zone2");
    expect(getDeliveryZone("12 Denis Pritt Road")?.id).toBe("zone1");
    expect(getDeliveryZone("WELLSFARGO agent, Ngara")?.id).toBe("zone3");
    expect(getDeliveryZone("Wells Fargo agent")?.id).toBe("wells_fargo");
  });

  it("prefers the earliest zone in the list when several match", () => {
    // "lavington mall" (zone0) is checked before "lavington" (zone1)
    expect(getDeliveryZone("Lavington Mall, Lavington")?.id).toBe("zone0");
    // "pickup" (zone0) wins over "pickup mtaani" (pickup_mtaani)
    expect(getDeliveryZone("Pickup Mtaani, Kilimani")?.id).toBe("zone0");
  });

  it("resolves the expected fee for each zone label", () => {
    expect(getDeliveryZone("store pickup")?.fee).toBe(0);
    expect(getDeliveryZone("Kileleshwa")?.fee).toBe(200);
    expect(getDeliveryZone("Yaya Centre")?.fee).toBe(300);
    expect(getDeliveryZone("Westlands")?.fee).toBe(350);
    expect(getDeliveryZone("Garden City, Thika Road")?.fee).toBe(500);
    expect(getDeliveryZone("Syokimau")?.fee).toBe(600);
    expect(getDeliveryZone("mtaani")?.fee).toBe(250);
  });
});

describe("getDiscountAmount", () => {
  const percentage: DiscountResult = {
    type: "percentage",
    value: 10,
    label: "10% off",
  };
  const fixed: DiscountResult = {
    type: "fixed",
    value: 500,
    label: "KSh 500 off",
  };

  it("is zero without a discount", () => {
    expect(getDiscountAmount(3500, null)).toBe(0);
  });

  it("rounds percentage discounts to the nearest shilling", () => {
    expect(getDiscountAmount(3500, percentage)).toBe(350);
    expect(getDiscountAmount(1234, percentage)).toBe(123);
    expect(getDiscountAmount(1235, percentage)).toBe(124);
  });

  it("caps fixed discounts at the subtotal", () => {
    expect(getDiscountAmount(3500, fixed)).toBe(500);
    expect(getDiscountAmount(300, fixed)).toBe(300);
    expect(getDiscountAmount(0, fixed)).toBe(0);
  });
});

describe("getOrderTotal", () => {
  it("adds delivery and subtracts the discount", () => {
    expect(getOrderTotal(3500, 300, null)).toBe(3800);
    expect(
      getOrderTotal(3500, 300, { type: "percentage", value: 10, label: "" })
    ).toBe(3450);
  });

  it("never lets a fixed discount push the goods below zero", () => {
    expect(
      getOrderTotal(300, 300, { type: "fixed", value: 1000, label: "" })
    ).toBe(300);
  });
});
