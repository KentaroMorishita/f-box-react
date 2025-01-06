import { renderHook, act } from "@testing-library/react";
import { useRBoxForm } from "../src/useRBoxForm";

type Form = {
  name: string;
  age: number;
  isChecked: boolean;
};

const initialValues: Form = {
  name: "",
  age: 0,
  isChecked: false,
};

const validate = (form: Form) => ({
  name: [
    () => form.name.trim().length >= 3,
    () => /^[a-zA-Z]+$/.test(form.name),
  ],
  age: [() => form.age > 18],
  isChecked: [() => form.isChecked === true],
});

describe("useRBoxForm", () => {
  test("should initialize with initial values and default state", () => {
    const { result } = renderHook(() => useRBoxForm(initialValues, validate));

    const { form, validation, edited } = result.current;

    expect(form).toEqual(initialValues);

    // validationを評価して結果を比較
    expect(
      Object.fromEntries(
        Object.entries(validation).map(([key, rules]) => [
          key,
          rules.map((rule) => rule()),
        ])
      )
    ).toEqual({
      name: [false, false],
      age: [false],
      isChecked: [false],
    });

    expect(edited).toEqual({
      name: false,
      age: false,
      isChecked: false,
    });
  });

  test("should update form values and mark field as edited on handleChange", () => {
    const { result } = renderHook(() => useRBoxForm(initialValues, validate));

    act(() => {
      result.current.handleChange("name", "John");
    });

    const { form, edited, validation } = result.current;

    expect(form.name).toBe("John");
    expect(edited.name).toBe(true);

    // validationを評価して結果を比較
    expect(validation.name.map((rule) => rule())).toEqual([true, true]); // Name "John" satisfies both rules
  });

  test("should validate correctly for invalid inputs", () => {
    const { result } = renderHook(() => useRBoxForm(initialValues, validate));

    act(() => {
      result.current.handleChange("name", "Jo"); // Too short, fails rule 1
    });

    const { validation, shouldShowError } = result.current;

    // validationを評価して結果を比較
    expect(validation.name.map((rule) => rule())).toEqual([false, true]); // Fails length rule, passes regex

    // shouldShowErrorを使った検証
    expect(shouldShowError("name")(0)).toBe(true); // Rule 0 should fail
    expect(shouldShowError("name")(1)).toBe(false); // Rule 1 should pass
  });

  test("should reset form values and edited state on resetForm", () => {
    const { result } = renderHook(() => useRBoxForm(initialValues, validate));

    act(() => {
      result.current.handleChange("name", "John");
      result.current.handleChange("age", 25);
      result.current.resetForm();
    });

    const { form, edited } = result.current;

    expect(form).toEqual(initialValues);
    expect(edited).toEqual({
      name: false,
      age: false,
      isChecked: false,
    });
  });

  test("should mark all fields as edited on markAllEdited", () => {
    const { result } = renderHook(() => useRBoxForm(initialValues, validate));

    act(() => {
      result.current.markAllEdited();
    });

    const { edited } = result.current;

    expect(edited).toEqual({
      name: true,
      age: true,
      isChecked: true,
    });
  });

  test("should call onSuccess when form is valid on handleValidatedSubmit", () => {
    const { result } = renderHook(() => useRBoxForm(initialValues, validate));

    const onSuccess = vi.fn();
    const onError = vi.fn();

    act(() => {
      // 正しいフォーム値をセット
      result.current.handleChange("name", "John");
      result.current.handleChange("age", 25);
      result.current.handleChange("isChecked", true);

      result.current.handleValidatedSubmit(
        onSuccess,
        onError
      )({
        preventDefault: vi.fn(),
      } as unknown as React.FormEvent);
    });

    // 結果を検証
    expect(onSuccess).toHaveBeenCalledWith({
      name: "John",
      age: 25,
      isChecked: true,
    });
    expect(onError).not.toHaveBeenCalled();
  });

  test("should call onError when form is invalid on handleValidatedSubmit", () => {
    const { result } = renderHook(() => useRBoxForm(initialValues, validate));

    const onSuccess = vi.fn();
    const onError = vi.fn();

    act(() => {
      result.current.handleChange("name", "Jo"); // Invalid name
      result.current.handleValidatedSubmit(
        onSuccess,
        onError
      )({ preventDefault: vi.fn() } as any);
    });

    expect(onSuccess).not.toHaveBeenCalled();
    expect(onError).toHaveBeenCalled();
  });
  test("should render error messages correctly for invalid fields", () => {
    const { result } = renderHook(() => useRBoxForm(initialValues, validate));

    act(() => {
      result.current.handleChange("name", "Jo"); // Invalid: Too short
      result.current.handleChange("age", 16); // Invalid: Too young
      result.current.handleChange("isChecked", false); // Invalid: Not checked
    });

    const nameErrorMessages = result.current.renderErrorMessages("name", [
      "Name must be at least 3 characters.",
      "Name must only contain letters.",
    ]);

    const ageErrorMessages = result.current.renderErrorMessages("age", [
      "Age must be greater than 18.",
    ]);

    const isCheckedErrorMessages = result.current.renderErrorMessages(
      "isChecked",
      ["You must check this box."]
    );

    // エラーメッセージのスナップショットテスト
    expect(nameErrorMessages).toMatchSnapshot();
    expect(ageErrorMessages).toMatchSnapshot();
    expect(isCheckedErrorMessages).toMatchSnapshot();
  });

  test("should render error messages with a custom component", () => {
    const { result } = renderHook(() => useRBoxForm(initialValues, validate));

    act(() => {
      result.current.handleChange("name", "Jo"); // Invalid: Too short
    });

    const CustomErrorComponent = ({
      children,
    }: {
      children: React.ReactNode;
    }) => <div className="error">{children}</div>;

    const nameErrorMessages = result.current.renderErrorMessages(
      "name",
      [
        "Name must be at least 3 characters.",
        "Name must only contain letters.",
      ],
      CustomErrorComponent
    );

    expect(nameErrorMessages).toMatchSnapshot();
  });

  test("should render nothing when there are no validation errors", () => {
    const { result } = renderHook(() => useRBoxForm(initialValues, validate));

    act(() => {
      result.current.handleChange("name", "John"); // Valid: Correct name
    });

    const nameErrorMessages = result.current.renderErrorMessages("name", [
      "Name must be at least 3 characters.",
      "Name must only contain letters.",
    ]);

    expect(nameErrorMessages).toMatchSnapshot();
  });

  test("should set isPending to true during async submission", async () => {
    const mockSubmit: ReturnType<typeof vi.fn> = vi.fn(
      async () => new Promise<void>((resolve) => setTimeout(resolve, 100))
    );

    const { result } = renderHook(() => useRBoxForm(initialValues, validate));

    expect(result.current.isPending).toBe(false);

    act(() => {
      result.current.handleChange("name", "John"); // Valid name
      result.current.handleChange("age", 25); // Valid age
      result.current.handleChange("isChecked", true); // Valid checkbox
    });

    const eventMock = { preventDefault: vi.fn() } as unknown as React.FormEvent;

    // 非同期処理の開始をトリガー
    act(() => {
      result.current.handleValidatedSubmit(mockSubmit)(eventMock);
    });

    // 非同期処理中にisPendingがtrueであることを確認
    expect(result.current.isPending).toBe(true);

    // 非同期処理が完了するのを待つ
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 100));
    });

    // 非同期処理後にisPendingがfalseに戻ることを確認
    expect(mockSubmit).toHaveBeenCalledWith({
      name: "John",
      age: 25,
      isChecked: true,
    });
    expect(result.current.isPending).toBe(false);
  });

  test("should not call onSuccess and keep isPending false if form is invalid", () => {
    const mockSubmit = vi.fn();
    const { result } = renderHook(() => useRBoxForm(initialValues, validate));

    act(() => {
      result.current.handleChange("name", "Jo"); // Invalid name
    });

    const eventMock = { preventDefault: vi.fn() } as unknown as React.FormEvent;

    act(() => {
      result.current.handleValidatedSubmit(mockSubmit)(eventMock);
    });

    expect(mockSubmit).not.toHaveBeenCalled();
    expect(result.current.isPending).toBe(false);
  });
});
