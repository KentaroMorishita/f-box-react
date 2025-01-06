import { useRBox, set } from "./useRBox";

export type UseRBoxTransactionResult = [
  boolean,
  (action: () => Promise<void>) => Promise<void>
];

export function useRBoxTransaction(): UseRBoxTransactionResult {
  const [isPending, isPengingBox] = useRBox(false);
  const setIsPending = set(isPengingBox);
  const startTransaction = async (action: () => Promise<void>) => {
    setIsPending(true);
    await action();
    setIsPending(false);
  };

  return [isPending, startTransaction];
}
