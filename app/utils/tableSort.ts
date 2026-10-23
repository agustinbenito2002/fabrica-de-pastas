export function textSorter<T>(
  getValue: (record: T) => unknown
): (left: T, right: T) => number {
  return (left, right) =>
    String(getValue(left) ?? "").localeCompare(
      String(getValue(right) ?? ""),
      "es",
      { numeric: true, sensitivity: "base" }
    );
}

export function numberSorter<T>(
  getValue: (record: T) => number | null | undefined
): (left: T, right: T) => number {
  return (left, right) => (getValue(left) ?? 0) - (getValue(right) ?? 0);
}
