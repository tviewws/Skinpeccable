import { act, renderHook } from "@testing-library/react";
import React from "react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { ThemeProvider, useTheme } from "./ThemeContext";

function renderTheme(props: {
  defaultTheme?: "light" | "dark";
  switchable?: boolean;
}) {
  return renderHook(() => useTheme(), {
    wrapper: ({ children }) => (
      <ThemeProvider {...props}>{children}</ThemeProvider>
    ),
  });
}

describe("useTheme", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove("dark");
  });

  afterEach(() => {
    document.documentElement.classList.remove("dark");
  });

  it("throws when used outside of a ThemeProvider", () => {
    expect(() => renderHook(() => useTheme())).toThrow(
      /must be used within ThemeProvider/
    );
  });

  it("defaults to a non-switchable light theme", () => {
    const { result } = renderTheme({});
    expect(result.current.theme).toBe("light");
    expect(result.current.switchable).toBe(false);
    expect(result.current.toggleTheme).toBeUndefined();
    expect(document.documentElement.classList.contains("dark")).toBe(false);
    expect(localStorage.getItem("theme")).toBeNull();
  });

  it("applies the dark class for a dark default theme", () => {
    renderTheme({ defaultTheme: "dark" });
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });

  it("ignores stored themes when not switchable", () => {
    localStorage.setItem("theme", "dark");
    const { result } = renderTheme({ defaultTheme: "light" });
    expect(result.current.theme).toBe("light");
  });

  it("reads the stored theme when switchable", () => {
    localStorage.setItem("theme", "dark");
    const { result } = renderTheme({ switchable: true });
    expect(result.current.theme).toBe("dark");
  });

  it("toggles between themes and persists the choice when switchable", () => {
    const { result } = renderTheme({ switchable: true });

    expect(result.current.theme).toBe("light");
    expect(localStorage.getItem("theme")).toBe("light");

    act(() => result.current.toggleTheme!());

    expect(result.current.theme).toBe("dark");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(localStorage.getItem("theme")).toBe("dark");

    act(() => result.current.toggleTheme!());

    expect(result.current.theme).toBe("light");
    expect(document.documentElement.classList.contains("dark")).toBe(false);
    expect(localStorage.getItem("theme")).toBe("light");
  });
});
