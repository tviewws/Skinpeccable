import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { usePersistFn } from "./usePersistFn";

describe("usePersistFn", () => {
  it("returns the same function reference across re-renders", () => {
    const { result, rerender } = renderHook(({ fn }) => usePersistFn(fn), {
      initialProps: { fn: () => 1 },
    });

    const first = result.current;
    rerender({ fn: () => 2 });

    expect(result.current).toBe(first);
  });

  it("always invokes the latest callback", () => {
    const { result, rerender } = renderHook(({ fn }) => usePersistFn(fn), {
      initialProps: { fn: () => "first" },
    });

    expect(result.current()).toBe("first");

    rerender({ fn: () => "second" });

    expect(result.current()).toBe("second");
  });

  it("forwards arguments to the callback", () => {
    const spy = vi.fn((a: number, b: number) => a + b);
    const { result } = renderHook(() => usePersistFn(spy));

    expect(result.current(2, 3)).toBe(5);
    expect(spy).toHaveBeenCalledWith(2, 3);
  });

  it("preserves the call-site `this`", () => {
    const { result } = renderHook(() =>
      usePersistFn(function (this: { value: number }) {
        return this.value;
      })
    );

    const holder = { value: 7, run: result.current };

    expect(holder.run()).toBe(7);
  });
});
