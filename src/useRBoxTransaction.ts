import { RBox } from "f-box-core";
import { useRBox, set } from "./useRBox";

export type UseRBoxTransactionResult = [
  boolean,
  (action: () => Promise<void>) => Promise<void>
];

export function useRBoxTransaction(
  isPengingBox: RBox<boolean>
): UseRBoxTransactionResult {
  const [isPending] = useRBox(isPengingBox);
  const setIsPending = set(isPengingBox);
  const startTransaction = async (action: () => Promise<void>) => {
    setIsPending(true);
    await action();
    setIsPending(false);
  };

  return [isPending, startTransaction];
}
