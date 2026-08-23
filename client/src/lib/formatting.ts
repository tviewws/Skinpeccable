export function formatKsh(value: number | string): string {
  return `KSh ${typeof value === "number" ? value.toLocaleString() : value}`;
}
