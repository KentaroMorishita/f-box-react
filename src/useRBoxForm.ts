import { useRBox, set } from "./useRBox";

type Validation<T extends object> = {
  [K in keyof T]: boolean;
};

type UseRBoxFormResult<T extends object> = {
  form: T;
  handleChange: <K extends keyof T>(field: K, value: T[K]) => void;
  handleValidatedSubmit: (
    onSuccess: (form: T) => void,
    onError?: () => void
  ) => (e: React.FormEvent) => void;
  shouldShowError: <K extends keyof T>(field: K) => boolean;
  validation: Validation<T>;
  edited: Validation<T>;
  resetForm: () => void;
  markAllEdited: () => void;
};

export function useRBoxForm<T extends object>(
  initialValues: T,
  validate: (form: T) => Validation<T>
): UseRBoxFormResult<T> {
  const initialEdited = (value: boolean) =>
    Object.keys(initialValues).reduce(
      (acc, key) => ({ ...acc, [key]: value }),
      {} as Validation<T>
    );

  // RBoxes
  const [form, formBox] = useRBox<T>(initialValues);
  const [validation, validationBox] = useRBox(() => formBox["<$>"](validate));
  const [edited, editedBox] = useRBox<Validation<T>>(initialEdited(false));
  const [formValid] = useRBox(() =>
    validationBox["<$>"]((v) => Object.values(v).every((val) => val === true))
  );

  // setters
  const setForm = set(formBox);
  const setEdited = set(editedBox);

  // helpers
  const handleChange = <K extends keyof T>(field: K, value: T[K]) => {
    setForm({ ...form, [field]: value });
    setEdited({ ...edited, [field]: true });
  };

  const handleValidatedSubmit =
    (onSuccess: (form: T) => void, onError?: () => void) =>
    (e: React.FormEvent) => {
      e.preventDefault();
      markAllEdited();

      if (!formValid) {
        if (onError) onError();
        return;
      }
      onSuccess(form);
    };

  const shouldShowError = <K extends keyof T>(field: K) =>
    edited[field] && !validation[field];

  const resetForm = () => {
    setForm(initialValues);
    setEdited(initialEdited(false));
  };

  const markAllEdited = () => {
    setEdited(initialEdited(true));
  };

  return {
    form,
    handleChange,
    handleValidatedSubmit,
    shouldShowError,
    validation,
    edited,
    resetForm,
    markAllEdited,
  };
}
