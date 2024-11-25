import { useMemo } from "react";
import { useSyncExternalStore } from "react";
import { RBox } from "f-box-core";

export function useRBox<T>(source: RBox<T>): [T, RBox<T>];
export function useRBox<T>(
  source: T | (() => T | RBox<T>),
  deps?: React.DependencyList
): [T, RBox<T>];
export function useRBox<T>(
  source: T | RBox<T> | (() => T | RBox<T>),
  deps: React.DependencyList = []
): [T, RBox<T>] {
  const box = useMemo<RBox<T>>(() => {
    const value =
      typeof source === "function" ? (source as () => T | RBox<T>)() : source;
    return RBox.isRBox(value) ? (value as RBox<T>) : RBox.pack(value as T);
  }, deps);

  const value = useSyncExternalStore(
    (onStoreChange) => {
      const key = box.subscribe(onStoreChange);
      return () => box.unsubscribe(key);
    },
    () => box.getValue()
  );

  return [value, box];
}

export const set = RBox.set;
