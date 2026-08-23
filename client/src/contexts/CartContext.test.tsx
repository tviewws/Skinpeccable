import { act, renderHook } from "@testing-library/react";
import React from "react";
import { beforeEach, describe, expect, it } from "vitest";
import { CartProvider, useCart, type CartItem } from "./CartContext";

const serum: Omit<CartItem, "quantity"> = {
  id: "odoo_1",
  name: "Glow Serum",
  brand: "Skinpeccable",
  price: 2500,
  image: "/serum.png",
  category: "serums",
};

const cleanser: Omit<CartItem, "quantity"> = {
  id: "odoo_2",
  name: "Gentle Cleanser",
  brand: "Skinpeccable",
  price: 1200,
  image: "/cleanser.png",
  category: "cleansers",
};

function renderCart() {
  return renderHook(() => useCart(), {
    wrapper: ({ children }) => <CartProvider>{children}</CartProvider>,
  });
}

describe("useCart", () => {
  beforeEach(() => {
    (window as any).dataLayer = undefined;
  });

  it("throws when used outside of a CartProvider", () => {
    expect(() => renderHook(() => useCart())).toThrow(
      /must be used within CartProvider/
    );
  });

  it("starts empty and closed", () => {
    const { result } = renderCart();
    expect(result.current.items).toEqual([]);
    expect(result.current.isOpen).toBe(false);
    expect(result.current.totalItems).toBe(0);
    expect(result.current.totalPrice).toBe(0);
  });

  it("adds an item, opens the drawer and pushes an add_to_cart event", () => {
    const { result } = renderCart();

    act(() => result.current.addItem(serum));

    expect(result.current.items).toEqual([{ ...serum, quantity: 1 }]);
    expect(result.current.isOpen).toBe(true);

    const dataLayer = (window as any).dataLayer;
    expect(dataLayer).toHaveLength(1);
    expect(dataLayer[0]).toMatchObject({
      event: "add_to_cart",
      ecommerce: {
        currency: "KES",
        value: serum.price,
        items: [{ item_id: serum.id, item_name: serum.name, quantity: 1 }],
      },
    });
  });

  it("increments quantity instead of duplicating an existing item", () => {
    const { result } = renderCart();

    act(() => result.current.addItem(serum));
    act(() => result.current.addItem(serum));

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].quantity).toBe(2);
    expect(result.current.totalItems).toBe(2);
    expect(result.current.totalPrice).toBe(5000);
  });

  it("keeps distinct products separate and totals them", () => {
    const { result } = renderCart();

    act(() => result.current.addItem(serum));
    act(() => result.current.addItem(cleanser));

    expect(result.current.items.map(i => i.id)).toEqual([
      serum.id,
      cleanser.id,
    ]);
    expect(result.current.totalItems).toBe(2);
    expect(result.current.totalPrice).toBe(3700);
  });

  it("removes an item by id and ignores unknown ids", () => {
    const { result } = renderCart();

    act(() => result.current.addItem(serum));
    act(() => result.current.addItem(cleanser));
    act(() => result.current.removeItem(serum.id));
    act(() => result.current.removeItem("does-not-exist"));

    expect(result.current.items.map(i => i.id)).toEqual([cleanser.id]);
  });

  it("updates quantity and drops the item at zero or below", () => {
    const { result } = renderCart();

    act(() => result.current.addItem(serum));
    act(() => result.current.updateQuantity(serum.id, 4));
    expect(result.current.totalItems).toBe(4);
    expect(result.current.totalPrice).toBe(10000);

    act(() => result.current.updateQuantity(serum.id, 0));
    expect(result.current.items).toEqual([]);
  });

  it("clears the cart", () => {
    const { result } = renderCart();

    act(() => result.current.addItem(serum));
    act(() => result.current.clearCart());

    expect(result.current.items).toEqual([]);
    expect(result.current.totalPrice).toBe(0);
  });

  it("opens and closes the drawer", () => {
    const { result } = renderCart();

    act(() => result.current.openCart());
    expect(result.current.isOpen).toBe(true);

    act(() => result.current.closeCart());
    expect(result.current.isOpen).toBe(false);
  });
});
