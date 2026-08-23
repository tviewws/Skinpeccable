import { renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useScrollReveal } from "./useScrollReveal";

type ObserverCallback = (
  entries: { isIntersecting: boolean; target: Element }[]
) => void;

let callbacks: ObserverCallback[];
let observed: Element[];
let options: IntersectionObserverInit[];
let disconnect: ReturnType<typeof vi.fn>;

beforeEach(() => {
  vi.useFakeTimers();
  callbacks = [];
  observed = [];
  options = [];
  disconnect = vi.fn();

  vi.stubGlobal(
    "IntersectionObserver",
    vi.fn((cb: ObserverCallback, opts: IntersectionObserverInit) => {
      callbacks.push(cb);
      options.push(opts);
      return {
        observe: (el: Element) => observed.push(el),
        disconnect,
        unobserve: vi.fn(),
        takeRecords: vi.fn(),
      };
    })
  );
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  document.body.innerHTML = "";
});

function addReveal(className = "reveal") {
  const el = document.createElement("div");
  el.className = className;
  document.body.appendChild(el);
  return el;
}

describe("useScrollReveal", () => {
  it("does not observe until the startup delay elapses", () => {
    addReveal();
    renderHook(() => useScrollReveal());

    expect(global.IntersectionObserver).not.toHaveBeenCalled();

    vi.advanceTimersByTime(50);

    expect(global.IntersectionObserver).toHaveBeenCalledTimes(1);
  });

  it("observes every .reveal element and ignores other elements", () => {
    const revealed = addReveal();
    const other = addReveal("no-reveal");
    renderHook(() => useScrollReveal());

    vi.advanceTimersByTime(50);

    expect(observed).toEqual([revealed]);
    expect(observed).not.toContain(other);
  });

  it("uses the configured threshold and root margin", () => {
    renderHook(() => useScrollReveal());
    vi.advanceTimersByTime(50);

    expect(options[0]).toEqual({
      threshold: 0.12,
      rootMargin: "0px 0px -40px 0px",
    });
  });

  it("adds the visible class only for intersecting entries", () => {
    const shown = addReveal();
    const hidden = addReveal();
    renderHook(() => useScrollReveal());
    vi.advanceTimersByTime(50);

    callbacks[0]([
      { isIntersecting: true, target: shown },
      { isIntersecting: false, target: hidden },
    ]);

    expect(shown.classList.contains("visible")).toBe(true);
    expect(hidden.classList.contains("visible")).toBe(false);
  });

  it("cancels the pending timer when unmounted early", () => {
    addReveal();
    const { unmount } = renderHook(() => useScrollReveal());

    unmount();
    vi.advanceTimersByTime(100);

    expect(global.IntersectionObserver).not.toHaveBeenCalled();
  });
});
