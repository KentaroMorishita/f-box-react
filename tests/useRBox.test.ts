import { renderHook, act } from "@testing-library/react";
import { RBox } from "f-box-core";
import { useRBox, set } from "../src/useRBox";

describe("useRBox", () => {
  test("should initialize with a primitive value", () => {
    const { result } = renderHook(() => useRBox(10));

    const [value, box] = result.current;

    expect(value).toBe(10);
    expect(box.getValue()).toBe(10);
  });

  test("should initialize with an RBox instance", () => {
    const initialRBox = RBox.pack(20);
    const { result } = renderHook(() => useRBox(initialRBox));

    const [value, box] = result.current;

    expect(value).toBe(20);
    expect(box).toBe(initialRBox); // RBox instance should be the same
  });

  test("should initialize with a function", () => {
    const { result } = renderHook(() => useRBox(() => 30));

    const [value, box] = result.current;

    expect(value).toBe(30);
    expect(box.getValue()).toBe(30);
  });

  test("should update the value reactively", () => {
    const { result } = renderHook(() => useRBox(10));

    const [, box] = result.current;

    act(() => {
      box.setValue(() => 40);
    });

    const [updatedValue] = result.current;

    expect(updatedValue).toBe(40);
    expect(box.getValue()).toBe(40);
  });

  test("should reinitialize when dependencies change", () => {
    let initialValue = 50;

    const { result, rerender } = renderHook(() =>
      useRBox(() => initialValue, [initialValue])
    );

    const [value, box] = result.current;
    expect(value).toBe(50);
    expect(box.getValue()).toBe(50);

    // Change the dependency
    initialValue = 100;
    rerender();

    const [newValue, newBox] = result.current;
    expect(newValue).toBe(100);
    expect(newBox.getValue()).toBe(100);
  });

  test("should reuse the same RBox instance across renders without dependency change", () => {
    const { result, rerender } = renderHook(() => useRBox(60));

    const [, box] = result.current;

    rerender();

    const [, newBox] = result.current;

    expect(box).toBe(newBox); // RBox instance should remain the same
  });

  test("should support the set helper", () => {
    const { result } = renderHook(() => useRBox(10));

    const [, box] = result.current;
    const setValue = set(box);

    act(() => {
      setValue(20);
    });

    const [updatedValue] = result.current;

    expect(updatedValue).toBe(20);
    expect(box.getValue()).toBe(20);
  });
});
