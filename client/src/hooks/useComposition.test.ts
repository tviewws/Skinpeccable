import { renderHook } from "@testing-library/react";
import type React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useComposition } from "./useComposition";

type Handlers = ReturnType<typeof useComposition<HTMLInputElement>>;

function compositionEvent() {
  return {} as React.CompositionEvent<HTMLInputElement>;
}

function keyEvent(key: string, shiftKey = false) {
  return {
    key,
    shiftKey,
    stopPropagation: vi.fn(),
  } as unknown as React.KeyboardEvent<HTMLInputElement> & {
    stopPropagation: ReturnType<typeof vi.fn>;
  };
}

// The hook defers clearing the composing flag through two nested timeouts.
function flushCompositionEnd() {
  vi.advanceTimersByTime(1);
}

let handlers: Handlers;
let onKeyDown: ReturnType<typeof vi.fn>;
let onCompositionStart: ReturnType<typeof vi.fn>;
let onCompositionEnd: ReturnType<typeof vi.fn>;

beforeEach(() => {
  vi.useFakeTimers();
  onKeyDown = vi.fn();
  onCompositionStart = vi.fn();
  onCompositionEnd = vi.fn();
  const { result } = renderHook(() =>
    useComposition<HTMLInputElement>({
      onKeyDown,
      onCompositionStart,
      onCompositionEnd,
    })
  );
  handlers = result.current;
});

afterEach(() => {
  vi.useRealTimers();
});

describe("useComposition", () => {
  it("is not composing initially and forwards key events", () => {
    expect(handlers.isComposing()).toBe(false);

    const event = keyEvent("Enter");
    handlers.onKeyDown(event);

    expect(onKeyDown).toHaveBeenCalledWith(event);
    expect(event.stopPropagation).not.toHaveBeenCalled();
  });

  it("marks composing on composition start and calls the original handler", () => {
    handlers.onCompositionStart(compositionEvent());

    expect(handlers.isComposing()).toBe(true);
    expect(onCompositionStart).toHaveBeenCalledTimes(1);
  });

  it("swallows Enter and Escape while composing", () => {
    handlers.onCompositionStart(compositionEvent());

    for (const key of ["Enter", "Escape"]) {
      const event = keyEvent(key);
      handlers.onKeyDown(event);
      expect(event.stopPropagation).toHaveBeenCalledTimes(1);
    }

    expect(onKeyDown).not.toHaveBeenCalled();
  });

  it("still forwards shift+Enter and other keys while composing", () => {
    handlers.onCompositionStart(compositionEvent());

    const shiftEnter = keyEvent("Enter", true);
    const letter = keyEvent("a");
    handlers.onKeyDown(shiftEnter);
    handlers.onKeyDown(letter);

    expect(shiftEnter.stopPropagation).not.toHaveBeenCalled();
    expect(letter.stopPropagation).not.toHaveBeenCalled();
    expect(onKeyDown).toHaveBeenCalledTimes(2);
  });

  it("stays composing until the deferred timers run after composition end", () => {
    handlers.onCompositionStart(compositionEvent());
    handlers.onCompositionEnd(compositionEvent());

    expect(onCompositionEnd).toHaveBeenCalledTimes(1);
    expect(handlers.isComposing()).toBe(true);

    flushCompositionEnd();

    expect(handlers.isComposing()).toBe(false);
  });

  it("forwards Enter again once composition has fully ended", () => {
    handlers.onCompositionStart(compositionEvent());
    handlers.onCompositionEnd(compositionEvent());
    flushCompositionEnd();

    const event = keyEvent("Enter");
    handlers.onKeyDown(event);

    expect(event.stopPropagation).not.toHaveBeenCalled();
    expect(onKeyDown).toHaveBeenCalledWith(event);
  });

  it("cancels pending end timers when a new composition starts", () => {
    handlers.onCompositionStart(compositionEvent());
    handlers.onCompositionEnd(compositionEvent());
    handlers.onCompositionStart(compositionEvent());

    flushCompositionEnd();

    expect(handlers.isComposing()).toBe(true);
  });

  it("returns stable handler references across re-renders", () => {
    const { result, rerender } = renderHook(() =>
      useComposition<HTMLInputElement>({ onKeyDown })
    );
    const first = result.current;

    rerender();

    expect(result.current.onKeyDown).toBe(first.onKeyDown);
    expect(result.current.onCompositionStart).toBe(first.onCompositionStart);
    expect(result.current.onCompositionEnd).toBe(first.onCompositionEnd);
    expect(result.current.isComposing).toBe(first.isComposing);
  });

  it("works without any options passed", () => {
    const { result } = renderHook(() => useComposition<HTMLInputElement>());

    expect(() => {
      result.current.onCompositionStart(compositionEvent());
      result.current.onKeyDown(keyEvent("Enter"));
      result.current.onCompositionEnd(compositionEvent());
    }).not.toThrow();
  });
});
