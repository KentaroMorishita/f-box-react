import { useMemo } from "react";
import { Box } from "f-box-core";

export function useBox<T>(source: Box<T>): [T, Box<T>];
export function useBox<T>(
  source: T | (() => T | Box<T>),
  deps?: React.DependencyList
): [T, Box<T>];
export function useBox<T>(
  source: T | Box<T> | (() => T | Box<T>),
  deps: React.DependencyList = []
): [T, Box<T>] {
  const box = useMemo<Box<T>>(() => {
    const value =
      typeof source === "function" ? (source as () => T | Box<T>)() : source;
    return Box.isBox(value) ? (value as Box<T>) : Box.pack(value as T);
  }, deps);

  const value = box.getValue();

  return [value, box];
}
