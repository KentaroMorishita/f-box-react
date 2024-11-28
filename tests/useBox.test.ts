import { renderHook } from "@testing-library/react";
import { Box } from "f-box-core";
import { useBox } from "../src/useBox";

describe("useBox", () => {
  test("should initialize with a primitive value", () => {
    const { result } = renderHook(() => useBox(10));

    const [value, box] = result.current;

    expect(value).toBe(10);
    expect(box.getValue()).toBe(10);
  });

  test("should initialize with a Box instance", () => {
    const initialBox = Box.pack(20);
    const { result } = renderHook(() => useBox(initialBox));

    const [value, box] = result.current;

    expect(value).toBe(20);
    expect(box).toBe(initialBox); // Box instance should be the same
  });

  test("should initialize with a function", () => {
    const { result } = renderHook(() => useBox(() => 30));

    const [value, box] = result.current;

    expect(value).toBe(30);
    expect(box.getValue()).toBe(30);
  });

  test("should reuse the same Box instance when dependencies do not change", () => {
    const { result, rerender } = renderHook(() => useBox(40));

    const [, box] = result.current;

    rerender();

    const [, newBox] = result.current;

    expect(box).toBe(newBox); // Same Box instance should be reused
  });

  test("should create a new Box instance when dependencies change", () => {
    let initialValue = 50;

    const { result, rerender } = renderHook(() =>
      useBox(() => initialValue, [initialValue])
    );

    const [, box] = result.current;
    expect(box.getValue()).toBe(50);

    // Change the dependency
    initialValue = 100;
    rerender();

    const [, newBox] = result.current;

    expect(newBox.getValue()).toBe(100);
    expect(box).not.toBe(newBox); // Box instance should be new
  });

  test("should only recompute when dependencies change", () => {
    const computeMock = vi.fn(() => 60);

    const { result, rerender } = renderHook(
      ({ compute }) => useBox(() => compute(), [compute]),
      { initialProps: { compute: computeMock } }
    );

    // 初回の評価を確認
    const [, box] = result.current;
    expect(box.getValue()).toBe(60);
    expect(computeMock).toHaveBeenCalledTimes(1);

    // 同じ依存関係で再レンダリング
    rerender({ compute: computeMock });
    expect(result.current[0]).toBe(60); // 値は変わらない
    expect(computeMock).toHaveBeenCalledTimes(1); // 再評価されない

    // 新しい依存関係を設定
    const newComputeMock = vi.fn(() => 120);
    rerender({ compute: newComputeMock });

    // 新しい結果を取得
    const [newValue, newBox] = result.current;

    // 新しい値の評価を確認
    expect(newValue).toBe(120);
    expect(newBox.getValue()).toBe(120);
    expect(newComputeMock).toHaveBeenCalledTimes(1); // 新しい関数が1回だけ呼び出される
    expect(computeMock).toHaveBeenCalledTimes(1); // 古い関数は呼び出されない
  });
});
