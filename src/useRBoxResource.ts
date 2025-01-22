import { useRBox, set } from "./useRBox";
import { Either, Task, RBox } from "f-box-core";

const { right, left } = Either;

type Result<T> = Either<Error, Awaited<T>>;
type CacheMap<T> = Map<string, Result<T>>;

type RBoxResourceOptions<T> = {
  resultBox: RBox<Result<T>>;
  isLoadingBox: RBox<boolean>;
  cacheBox: RBox<CacheMap<T>>;
  isAutoRun: boolean;
  maxCacheSize: number;
};

type ResourceController<A> = {
  params: A;
  run: () => void;
  mutate: (args: Partial<A>) => void;
  refetch: () => void;
  clearCache: () => void;
};

const DEFAULT_IS_AUTO_RUN = true;
const DEFAULT_MAX_CACHE_SIZE = 100;
const DEFAULT_ERROR_OBJECT = new Error("No data yet");

const hash = (value: unknown, length: number = 16) => {
  const json = JSON.stringify(value);
  return Task.tryCatch<string>(
    async () => {
      if (typeof window !== "undefined" && window.crypto?.subtle) {
        const encoder = new TextEncoder();
        const data = encoder.encode(json);
        const hashBuffer = await crypto.subtle.digest("SHA-256", data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const fullHash = hashArray
          .map((b) => b.toString(16).padStart(2, "0"))
          .join("");
        return fullHash.slice(0, length);
      } else {
        const { createHash } = await import("crypto");
        const fullHash = createHash("sha256").update(json).digest("hex");
        return fullHash.slice(0, length);
      }
    },
    (err) => {
      console.error(err);
      return json;
    }
  );
};

export const castError = (err: unknown) =>
  err instanceof Error ? err : new Error(String(err));

export function useRBoxResource<T, A extends {}>(
  fetcher: (args: A) => Task<T>,
  initialParams: A = {} as A,
  options: Partial<RBoxResourceOptions<T>> = {}
): [Result<T>, boolean, ResourceController<A>] {
  const [result, resultBox] = useRBox<Result<T>>(
    () => options.resultBox ?? RBox.pack<Result<T>>(left(DEFAULT_ERROR_OBJECT))
  );
  const [isLoading, isLoadingBox] = useRBox(
    () => options.isLoadingBox ?? RBox.pack(false)
  );
  const [, cacheBox] = useRBox(
    () => options.cacheBox ?? RBox.pack<CacheMap<T>>(new Map())
  );

  const isAutoRun = options.isAutoRun ?? DEFAULT_IS_AUTO_RUN;
  const maxCacheSize = options.maxCacheSize ?? DEFAULT_MAX_CACHE_SIZE;
  const setResult = set(resultBox);

  const [params, paramsBox] = useRBox(initialParams);
  const mutate = (args: Partial<A>) =>
    paramsBox.setValue((prev) => ({ ...prev, ...args }));

  const runTask = async (currentParams: A, ignoreCache = false) => {
    const cacheKey = await hash(currentParams).run();
    const currentCache = cacheBox.getValue();
    const setCache = (result: Result<T>) =>
      cacheBox.setValue((prev) => {
        const updatedCache = new Map(prev);
        updatedCache.set(cacheKey, result);

        if (updatedCache.size > maxCacheSize) {
          const oldestKey = updatedCache.keys().next().value;
          if (oldestKey) updatedCache.delete(oldestKey);
        }
        return updatedCache;
      });

    if (!ignoreCache && currentCache.has(cacheKey)) {
      const cacheValue = currentCache.get(cacheKey)!;
      setResult(cacheValue);
      return;
    }

    isLoadingBox.setValue(true);

    Task.tryCatch<Result<T>>(
      async () => right(await fetcher(currentParams).run()),
      (err) => left(castError(err))
    )
      ["<$>"]((result) => {
        setResult(result);
        setCache(result);
      })
      .run()
      .finally(() => isLoadingBox.setValue(false));
  };

  const run = () => paramsBox["<$>"](runTask);
  const refetch = () => runTask(params, true);
  const clearCache = () => cacheBox.setValue(new Map());

  if (isAutoRun) {
    useRBox(run);
  }

  return [result, isLoading, { params, run, mutate, refetch, clearCache }];
}
