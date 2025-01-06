import { renderHook, act } from "@testing-library/react";
import { useRBoxTransaction } from "../src/useRBoxTransaction";

describe("useRBoxTransaction", () => {
  test("should initialize with isPending set to false", () => {
    const { result } = renderHook(() => useRBoxTransaction());

    const [isPending] = result.current;

    // Ensure the initial state of isPending is false
    expect(isPending).toBe(false);
  });

  test("should set isPending to true during async transaction", async () => {
    const { result } = renderHook(() => useRBoxTransaction());

    const [, startTransaction] = result.current;

    const mockAction = vi.fn(
      async () => new Promise<void>((resolve) => setTimeout(resolve, 100))
    );

    // Before starting the async transaction
    expect(result.current[0]).toBe(false);

    // Start the async transaction
    act(() => {
      startTransaction(mockAction);
    });

    // During the async transaction
    expect(result.current[0]).toBe(true);

    // Wait for the async transaction to complete
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 100));
    });

    // After the async transaction
    expect(result.current[0]).toBe(false);
    expect(mockAction).toHaveBeenCalled();
  });

  test("should handle multiple transactions sequentially", async () => {
    const { result } = renderHook(() => useRBoxTransaction());

    const [, startTransaction] = result.current;

    const mockAction1 = vi.fn(
      async () => new Promise<void>((resolve) => setTimeout(resolve, 100))
    );
    const mockAction2 = vi.fn(
      async () => new Promise<void>((resolve) => setTimeout(resolve, 100))
    );

    // Start the first async transaction
    act(() => {
      startTransaction(mockAction1);
    });

    // During the first async transaction
    expect(result.current[0]).toBe(true);

    // Wait for the first async transaction to complete
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 100));
    });

    // After the first async transaction
    expect(result.current[0]).toBe(false);

    // Start the second async transaction
    act(() => {
      startTransaction(mockAction2);
    });

    // During the second async transaction
    expect(result.current[0]).toBe(true);

    // Wait for the second async transaction to complete
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 100));
    });

    // After the second async transaction
    expect(result.current[0]).toBe(false);

    // Ensure both mock functions were called
    expect(mockAction1).toHaveBeenCalled();
    expect(mockAction2).toHaveBeenCalled();
  });
});
