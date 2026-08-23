import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { usePageMeta } from "./usePageMeta";

function metaTags() {
  return document.head.querySelectorAll('meta[name="description"]');
}

describe("usePageMeta", () => {
  beforeEach(() => {
    document.head.innerHTML = "";
    document.title = "";
  });

  it("sets the document title and creates the description meta tag", () => {
    renderHook(() => usePageMeta("Shop | Skinpeccable", "Browse our products"));

    expect(document.title).toBe("Shop | Skinpeccable");
    expect(metaTags()).toHaveLength(1);
    expect(metaTags()[0].getAttribute("content")).toBe("Browse our products");
  });

  it("reuses an existing description meta tag", () => {
    const existing = document.createElement("meta");
    existing.setAttribute("name", "description");
    existing.setAttribute("content", "old");
    document.head.appendChild(existing);

    renderHook(() => usePageMeta("About", "new description"));

    expect(metaTags()).toHaveLength(1);
    expect(existing.getAttribute("content")).toBe("new description");
  });

  it("updates title and description when the inputs change", () => {
    const { rerender } = renderHook(
      ({ title, description }) => usePageMeta(title, description),
      { initialProps: { title: "One", description: "First" } }
    );

    rerender({ title: "Two", description: "Second" });

    expect(document.title).toBe("Two");
    expect(metaTags()).toHaveLength(1);
    expect(metaTags()[0].getAttribute("content")).toBe("Second");
  });
});
