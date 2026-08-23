import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useIsMobile } from "./useMobile";

const listeners = new Set<() => void>();
let removeListener: ReturnType<typeof vi.fn>;

function setWidth(width: number) {
  Object.defineProperty(window, "innerWidth", {
    configurable: true,
    writable: true,
    value: width,
  });
}

beforeEach(() => {
  listeners.clear();
  removeListener = vi.fn((_event: string, handler: () => void) => {
    listeners.delete(handler);
  });
  vi.stubGlobal(
    "matchMedia",
    vi.fn((query: string) => ({
      media: query,
      matches: window.innerWidth < 768,
      addEventListener: (_event: string, handler: () => void) => {
        listeners.add(handler);
      },
      removeEventListener: removeListener,
    }))
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("useIsMobile", () => {
  it("is false on wide viewports", () => {
    setWidth(1280);
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);
  });

  it("is true below the 768px breakpoint", () => {
    setWidth(500);
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(true);
  });

  it("treats exactly 768px as desktop", () => {
    setWidth(768);
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);
  });

  it("queries one pixel below the breakpoint", () => {
    setWidth(1024);
    renderHook(() => useIsMobile());
    expect(window.matchMedia).toHaveBeenCalledWith("(max-width: 767px)");
  });

  it("updates when the media query fires a change", () => {
    setWidth(1024);
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);

    setWidth(400);
    act(() => listeners.forEach(handler => handler()));

    expect(result.current).toBe(true);
  });

  it("removes its listener on unmount", () => {
    setWidth(1024);
    const { unmount } = renderHook(() => useIsMobile());

    unmount();

    expect(removeListener).toHaveBeenCalledWith("change", expect.any(Function));
    expect(listeners.size).toBe(0);
  });
});
