import { renderHook, act } from "@testing-library/react";
import { useRBoxResource, castError } from "../src/useRBoxResource";
import { Either, Task } from "f-box-core";

type MockData = { id: number; value: string };
let mockFetcher: ReturnType<typeof vi.fn>;

describe("castError", () => {
  test("should return the same Error instance if input is an Error", () => {
    const error = new Error("Test error");
    expect(castError(error)).toBe(error); // 同じインスタンスを返す
  });

  test("should create a new Error instance from a string", () => {
    const result = castError("String error");
    expect(result).toBeInstanceOf(Error);
    expect(result.message).toBe("String error");
  });

  test("should create a new Error instance from a number", () => {
    const result = castError(123);
    expect(result).toBeInstanceOf(Error);
    expect(result.message).toBe("123");
  });

  test("should create a new Error instance from an object", () => {
    const obj = { foo: "bar" };
    const result = castError(obj);
    expect(result).toBeInstanceOf(Error);
    expect(result.message).toBe("[object Object]");
  });

  test("should create a new Error instance from undefined", () => {
    const result = castError(undefined);
    expect(result).toBeInstanceOf(Error);
    expect(result.message).toBe("undefined");
  });
});

describe("useRBoxResource", () => {
  beforeEach(() => {
    mockFetcher = vi.fn(({ id }: { id: number }) =>
      Task.from<MockData>(async () => {
        if (id === 0) throw new Error("Invalid ID");
        return { id, value: `Value for ID ${id}` };
      })
    );
  });

  // 1. 初期化
  test("should initialize with default values", () => {
    const { result } = renderHook(() =>
      useRBoxResource(mockFetcher, { id: 1 }, { isAutoRun: true })
    );

    const [data, isLoading] = result.current;

    expect(Either.isLeft(data)).toBe(true); // 初期状態ではエラー
    expect(isLoading).toBe(false); // 初期状態ではローディングしていない
    expect(mockFetcher).not.toHaveBeenCalled(); // mockFetcherが呼び出されていないことを確認
  });

  // 2. 自動フェッチ
  test("should fetch data on initial render when isAutoRun is true", async () => {
    const { result } = renderHook(() =>
      useRBoxResource(mockFetcher, { id: 2 }, { isAutoRun: true })
    );

    expect(mockFetcher).not.toHaveBeenCalled(); // 初期状態では未呼び出しを確認

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 100)); // 非同期処理を待機
    });

    expect(mockFetcher).toHaveBeenCalledTimes(1); // モックが1回呼び出されたことを確認
    expect(mockFetcher).toHaveBeenCalledWith({ id: 2 }); // 正しい引数で呼び出されていることを確認

    const [data, isLoading] = result.current;

    expect(isLoading).toBe(false); // ロード状態が終了していることを確認
    expect(
      data.match(
        () => null,
        (value) => value
      )
    ).toEqual({
      id: 2,
      value: "Value for ID 2",
    });
  });

  // 3. 手動実行
  test("should allow manual execution with run", async () => {
    const { result } = renderHook(() =>
      useRBoxResource(mockFetcher, { id: 1 }, { isAutoRun: false })
    );

    expect(Either.isLeft(result.current[0])).toBe(true); // データ未取得

    act(() => {
      result.current[2].run();
    });

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 100)); // データ取得後を待機
    });

    const [data] = result.current;
    expect(Either.isRight(data)).toBe(true);
    expect(
      data.match(
        () => null,
        (value) => value
      )
    ).toEqual({
      id: 1,
      value: "Value for ID 1",
    });
  });

  // 4. パラメータ更新
  test("should update params and fetch data with mutate", async () => {
    const { result } = renderHook(() =>
      useRBoxResource(mockFetcher, { id: 1 })
    );

    act(() => {
      result.current[2].mutate({ id: 3 });
    });

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 100)); // データ取得後を待機
    });

    const [data] = result.current;
    expect(Either.isRight(data)).toBe(true);
    expect(
      data.match(
        () => null,
        (value) => value
      )
    ).toEqual({
      id: 3,
      value: "Value for ID 3",
    });
  });

  // 5. エラーハンドリング
  test("should handle errors correctly", async () => {
    const { result } = renderHook(() =>
      useRBoxResource(mockFetcher, { id: 0 })
    );

    act(() => {
      result.current[2].run();
    });

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 100)); // エラー結果を待機
    });

    const [data] = result.current;
    expect(Either.isLeft(data)).toBe(true);
    expect(
      data.match(
        (err) => err.message,
        () => null
      )
    ).toBe("Invalid ID");
  });

  // 6. キャッシュの利用
  test("should not fetch data if cache exists when mutate is called with the same params", async () => {
    const { result } = renderHook(() =>
      useRBoxResource(mockFetcher, { id: 5 })
    );

    act(() => {
      result.current[2].mutate({ id: 5 });
    });

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 100)); // データ取得後を待機
    });

    expect(mockFetcher).toHaveBeenCalledTimes(1); // 1回目のフェッチ

    act(() => {
      result.current[2].mutate({ id: 5 }); // 同じIDでmutateを呼び出し
    });

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 100)); // 待機
    });

    expect(mockFetcher).toHaveBeenCalledTimes(1); // 再フェッチは行われない
  });

  // 7. キャッシュクリア後の再フェッチ
  test("should fetch data after cache is cleared", async () => {
    const { result } = renderHook(() =>
      useRBoxResource(mockFetcher, { id: 6 })
    );

    act(() => {
      result.current[2].mutate({ id: 6 });
    });

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 100)); // データ取得後を待機
    });

    expect(mockFetcher).toHaveBeenCalledTimes(1); // 1回目のフェッチ

    act(() => {
      result.current[2].clearCache(); // キャッシュをクリア
    });

    act(() => {
      result.current[2].mutate({ id: 6 }); // 再度同じIDでmutateを呼び出し
    });

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 100)); // 再フェッチを待機
    });

    expect(mockFetcher).toHaveBeenCalledTimes(2); // 再フェッチが実行される
  });

  // 8. エラー後のリフェッチ
  test("should allow refetching after an error", async () => {
    const { result } = renderHook(() =>
      useRBoxResource(mockFetcher, { id: 0 })
    );

    act(() => {
      result.current[2].run(); // エラーを発生させる
    });

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 100)); // エラー結果を待機
    });

    expect(mockFetcher).toHaveBeenCalledTimes(1); // 1回目の呼び出し（エラー発生）

    act(() => {
      result.current[2].mutate({ id: 7 }); // 正常な ID に変更
    });

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 100)); // 再フェッチを待機
    });

    expect(mockFetcher).toHaveBeenCalledTimes(2); // 2回目の呼び出し
    const [data] = result.current;
    expect(Either.isRight(data)).toBe(true); // 正常にデータを取得していることを確認
    expect(
      data.match(
        () => null,
        (value) => value
      )
    ).toEqual({
      id: 7,
      value: "Value for ID 7",
    });
  });

  // 9. キャッシュクリア時の動作
  test("should fetch data again after clearing the cache", async () => {
    const { result } = renderHook(() =>
      useRBoxResource(mockFetcher, { id: 6 })
    );

    act(() => {
      result.current[2].run(); // 初回フェッチ
    });

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 100)); // データ取得後を待機
    });

    expect(mockFetcher).toHaveBeenCalledTimes(1);

    act(() => {
      result.current[2].clearCache(); // キャッシュをクリア
    });

    act(() => {
      result.current[2].refetch(); // 再フェッチを実行
    });

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 100)); // 待機
    });

    expect(mockFetcher).toHaveBeenCalledTimes(2); // 再フェッチが実行されることを確認
  });
});
