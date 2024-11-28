import { useRBox } from "./useRBox";

type FormValues = Record<string, unknown>;

type ValidationRule = () => boolean;

type Validation<T extends FormValues> = {
  [K in keyof T]: ValidationRule[];
};

type Edited<T extends FormValues> = {
  [K in keyof T]: boolean;
};

type UseRBoxFormResult<T extends FormValues> = {
  form: T;
  handleChange: <K extends keyof T>(field: K, value: T[K]) => void;
  handleValidatedSubmit: (
    onSuccess: (form: T) => void,
    onError?: () => void
  ) => (e: React.FormEvent) => void;
  shouldShowError: <K extends keyof T>(field: K) => (index: number) => boolean;
  validation: Validation<T>;
  edited: Edited<T>;
  formValid: boolean;
  resetForm: () => void;
  markAllEdited: () => void;
};

export function useRBoxForm<T extends FormValues>(
  initialValues: T,
  validate: (form: T) => Validation<T>
): UseRBoxFormResult<T> {
  const initialEdited = (value: boolean): Edited<T> =>
    Object.keys(initialValues).reduce(
      (acc, key) => ({ ...acc, [key]: value }),
      {} as Edited<T>
    );

  // RBoxes
  const [form, formBox] = useRBox<T>(initialValues);
  const [validation, validationBox] = useRBox(() => formBox["<$>"](validate));
  const [edited, editedBox] = useRBox<Edited<T>>(initialEdited(false));
  const [formValid, formValidBox] = useRBox(() =>
    validationBox["<$>"]((v) =>
      Object.values(v)
        .flat()
        .every((rule) => rule())
    )
  );

  // helpers
  const handleChange = <K extends keyof T>(field: K, value: T[K]) => {
    formBox.setValue((prev) => ({ ...prev, [field]: value }));
    editedBox.setValue((prev) => ({ ...prev, [field]: true }));
  };

  const handleValidatedSubmit =
    (onSuccess: (form: T) => void, onError?: () => void) =>
    (e: React.FormEvent) => {
      e.preventDefault();
      markAllEdited();

      if (!formValidBox.getValue()) {
        if (onError) onError();
        return;
      }
      onSuccess(formBox.getValue());
    };

  const shouldShowError =
    <K extends keyof T>(field: K) =>
    (index: number): boolean =>
      edited[field] && !validation[field][index]();

  const resetForm = () => {
    formBox.setValue(() => initialValues);
    editedBox.setValue(() => initialEdited(false));
  };

  const markAllEdited = () => {
    editedBox.setValue((prev) =>
      Object.keys(prev).reduce(
        (acc, key) => ({ ...acc, [key]: true }),
        {} as Edited<T>
      )
    );
  };

  return {
    form,
    handleChange,
    handleValidatedSubmit,
    shouldShowError,
    validation,
    edited,
    formValid,
    resetForm,
    markAllEdited,
  };
}
