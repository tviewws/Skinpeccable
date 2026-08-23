import { describe, expect, it } from "vitest";
import { isSoldOut, type Product } from "./products";

function makeProduct(price: Product["price"]): Product {
  return {
    id: "odoo_1",
    name: "Glow Serum",
    brand: "Skinpeccable",
    category: "serums",
    price,
    description: "A serum",
    image: "/placeholder.png",
  };
}

describe("isSoldOut", () => {
  it("is true only for the SOLD OUT sentinel price", () => {
    expect(isSoldOut(makeProduct("SOLD OUT"))).toBe(true);
    expect(isSoldOut(makeProduct(2500))).toBe(false);
  });

  it("treats a zero price as available rather than sold out", () => {
    expect(isSoldOut(makeProduct(0))).toBe(false);
  });
});
