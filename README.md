# F-Box React

**F-Box React** provides React hooks and utilities to seamlessly integrate [F-Box](https://github.com/KentaroMorishita/f-box-core) into your React applications. With `useBox`, `useRBox`, and `useRBoxForm`, you can manage state reactively and functionally, leveraging the abstractions provided by F-Box.

**F-Box React** は、[F-Box](https://github.com/KentaroMorishita/f-box-core) を React アプリケーションにシームレスに統合するためのフックとユーティリティを提供します。`useBox`、`useRBox`、`useRBoxForm` を活用して、F-Box が提供する抽象化を利用したリアクティブで関数型の状態管理を実現できます。

| Hook          | Description                                                                                                                      |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `useBox`      | A hook for managing static values with the `Box` abstraction. / 静的な値を`Box`抽象で管理するフック。                            |
| `useRBox`     | A hook for managing reactive state with `RBox`. / `RBox` を使用してリアクティブな状態を管理するフック。                          |
| `useRBoxForm` | A utility hook for form state management with validation. / バリデーション付きのフォーム状態管理を実現するユーティリティフック。 |

---

## Installation

Install via npm:

```bash
npm install f-box-react
```

> **Note**: `f-box-react` requires `f-box-core`, `react`, and `react-dom` as `peerDependencies`. Install them if not already available:

> **注記**: `f-box-react` は `f-box-core`、`react`、および `react-dom` を `peerDependencies` として必要とします。以下を実行してインストールしてください：

```bash
npm install f-box-core react react-dom
```

---

## Usage

### `useBox`

`useBox` allows you to work with static values encapsulated in a `Box`, using F-Box's operators like `["<$>"]`, `["<*>"]`, and `[">>="]`.

`useBox` を使用すると、F-Box の `Box` 抽象にカプセル化された静的な値を操作できます。`["<$>"]`、`["<*>"]`、`[">>="]` といった演算子を使用します。

#### Example

```tsx
import { useBox } from "f-box-react";

function App() {
  const [value, valueBox] = useBox(10); // Initial value is 10.

  // Derive new values using ["<$>"] / ["<$>"] を使って値を派生
  const [squared] = useBox(() => valueBox["<$>"]((x) => x * x));

  return (
    <div>
      <p>Original Value: {value}</p>
      <p>Squared Value: {squared}</p>
    </div>
  );
}
```

> **Important**: `useBox` does not allow direct updates with methods like `setValue`. Always use the provided operators (`["<$>"]`, `["<*>"]`, `[">>="]`) for value derivation.

> **重要**: `useBox` は `setValue` のような直接的な更新を許可しません。値の派生には必ず提供される演算子（`["<$>"]`、`["<*>"]`、`[">>="]`）を使用してください。

---

### `useRBox`

`useRBox` is the core hook for integrating F-Box's reactive state management (`RBox`) into React components. It allows seamless connection between reactive state and React's rendering lifecycle.

`useRBox`は、F-Box のリアクティブな状態管理（`RBox`）を React コンポーネントに統合するための主要なフックです。リアクティブな状態と React のレンダリングライフサイクルをシームレスに結びつけます。

---

#### Local State Example

Use `useRBox` to create and manage a local reactive state within a single component.

`useRBox`を使用して、1 つのコンポーネント内でローカルなリアクティブ状態を作成・管理します。

```tsx
import { useRBox, set } from "f-box-react";

function Counter() {
  const [count, countBox] = useRBox(0); // Initialize with 0.
  const setCount = set(countBox);

  const increment = () => setCount(count + 1);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={increment}>Increment</button>
    </div>
  );
}
```

---

#### Global State Example

`RBox` instances can be created and shared across multiple components for global state management. `useRBox` seamlessly connects to these instances.

`RBox`インスタンスを作成し、複数のコンポーネント間で共有することでグローバル状態を管理できます。

```tsx
import { RBox } from "f-box-core";
import { useRBox, set } from "f-box-react";

const countBox = RBox.pack(0); // Create a global reactive state.

function Counter() {
  const [count] = useRBox(countBox); // Bind global state to local variable.
  const setCount = set(countBox);

  const increment = () => setCount(count + 1);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={increment}>Increment</button>
    </div>
  );
}

function ResetButton() {
  const setCount = set(countBox);

  const reset = () => setCount(0); // Reset state to 0.

  return <button onClick={reset}>Reset</button>;
}
```

In this example, `Counter` and `ResetButton` share the same `countBox`. Updating the state in one component automatically reflects in the other.

この例では、`Counter`と`ResetButton`は同じ`countBox`を共有しています。一方のコンポーネントで状態を更新すると、もう一方にも自動的に反映されます。

---

### **`set` Helper / `set` ヘルパー**

The `set` helper simplifies updating `RBox` values while keeping their current state accessible. Normally, you would write:

`set` ヘルパーは、現在の値を引数として受け取りつつ、`RBox` の値を更新するコードを簡潔にします。通常は次のように書きます：

```tsx
baseBox.setValue((base) => base + 1);
// Note: `base` here is the current state (currentValue).
// 注: ここでの `base` は現在の状態 (currentValue) を指します。
```

However, when working with `useRBox`, you typically use destructuring like:

ただし、`useRBox` を使用している場合、以下のように分割代入を使うのが一般的です：

```tsx
const [base, baseBox] = useRBox(1);
```

In this case, the `set` helper allows you to simplify updates:

この場合、`set` ヘルパーを使うと更新処理を簡潔に記述できます：

```tsx
const setBase = set(baseBox);

setBase(base + 1); // Cleaner and reusable / より簡潔で再利用可能
```

Essentially, `set(baseBox)` is syntactic sugar for:

本質的に、`set(baseBox)` は以下のシンタックスシュガーです：

```tsx
baseBox.setValue(() => newValue);
```

### Why Use `set`? / なぜ `set` を使うのか？

By using `set`, you avoid repetitive arrow functions like `(base) => base + 1`. It improves code clarity, especially when destructuring state from `useRBox`.

`set` を使うことで、`(base) => base + 1` のような繰り返しのアロー関数を避けられます。特に、`useRBox` で状態を分割代入している場合、コードの可読性が向上します。

---

### Reactive Operators with `useRBox`

The power of `useRBox` lies in its ability to maintain reactivity while composing, transforming, and chaining values. Using operators like `<$>`, `<*>`, and `>>=`, you can build highly dynamic and interconnected state systems.

`useRBox`の強みは、値を合成、変換、連結しながらリアクティビティを維持できる点にあります。`<$>`、`<*>`、`>>=`といった演算子を使うことで、動的で相互接続された状態管理システムを構築できます。

---

### `<$>` in `useRBox` / `useRBox`での`<$>`の使用例

```tsx
import { useRBox, set } from "f-box-react";

function ReactiveExample() {
  const [base, baseBox] = useRBox(10); // Initialize with 10.
  const setBase = set(baseBox);

  // Derive squared value from base.
  const [squared] = useRBox(() => baseBox["<$>"]((x) => x * x));
  // Derive cubed value from base.
  const [cubed] = useRBox(() => baseBox["<$>"]((x) => x * x * x));

  return (
    <div>
      <p>Base: {base}</p>
      <p>Squared: {squared}</p>
      <p>Cubed: {cubed}</p>
      <button onClick={() => setBase(base + 1)}>Increment</button>
    </div>
  );
}
```

**Explanation:**

- `squared` and `cubed` are derived states that automatically update whenever `base` changes.
- The `set` helper simplifies updating `baseBox` values, ensuring reactive and clean state management.

**説明:**

- `squared` と `cubed` は派生状態で、`base` が変更されるたびに自動的に更新されます。
- `set` ヘルパーを使用することで、`baseBox` の値をリアクティブかつ簡潔に更新できます。

---

### `<*>` in `useRBox` / `useRBox`での`<*>`の使用例

```tsx
import { useRBox, set } from "f-box-react";

function CombineStates() {
  const [, addBox] = useRBox(() => (x: number) => (y: number) => x + y);
  const [, mulBox] = useRBox(() => (x: number) => (y: number) => x * y);
  const [v1, v1Box] = useRBox(5);
  const [v2, v2Box] = useRBox(10);
  const setV1 = set(v1Box);
  const setV2 = set(v2Box);

  const [total] = useRBox(() => addBox["<*>"](v1Box)["<*>"](v2Box));
  const [product] = useRBox(() => mulBox["<*>"](v1Box)["<*>"](v2Box));

  return (
    <div>
      <p>Value 1: {v1}</p>
      <p>Value 2: {v2}</p>
      <p>Total (v1 + v2): {total}</p>
      <p>Product (v1 * v2): {product}</p>
      <button onClick={() => setV1(v1 + 1)}>Increment Value 1</button>
      <button onClick={() => setV2(v2 + 1)}>Increment Value 2</button>
    </div>
  );
}
```

**Explanation:**

- `addBox` and `mulBox` initially hold curried functions:
  - `addBox` for addition `(x) => (y) => x + y`.
  - `mulBox` for multiplication `(x) => (y) => x * y`.
- `<*>` is used to apply these functions to `v1Box` and `v2Box`:
  - `addBox` computes `total` (sum).
  - `mulBox` computes `product` (multiplication).
- Changing `v1` or `v2` automatically updates both `total` and `product`, demonstrating seamless reactivity.
- The `set` helper simplifies updates to `v1Box` and `v2Box`.

**説明:**

- `addBox` と `mulBox` は初期値としてカリー化された関数を保持します：
  - `addBox` は加算 `(x) => (y) => x + y`。
  - `mulBox` は乗算 `(x) => (y) => x * y`。
- `<*>` を使って、これらの関数を `v1Box` と `v2Box` に適用します：
  - `addBox` は `total`（合計）を計算。
  - `mulBox` は `product`（積）を計算。
- `v1` または `v2` の変更に応じて、`total` と `product` が自動的に更新されます。
- `set` ヘルパーで `v1Box` と `v2Box` の更新が簡潔になります。

---

### `>>=` in `useRBox` / `useRBox`での`>>=`の使用例

```tsx
import { RBox } from "f-box-core";
import { useRBox, set } from "f-box-react";

function DependentStates() {
  const [base, baseBox] = useRBox(10); // Initialize with 10.
  const setBase = set(baseBox);

  // Step 1: Multiply base by 2.
  const [step1, step1Box] = useRBox(() =>
    baseBox[">>="]((x) => RBox.pack(x * 2))
  );

  // Step 2: Add 5 to step 1 result.
  const [step2] = useRBox(() =>
    step1Box[">>="]((x) => RBox.pack(x + 5))
  );

  return (
    <div>
      <p>Base: {base}</p>
      <p>Step 1 (Base * 2): {step1}</p>
      <p>Step 2 (Step 1 + 5): {step2}</p>
      <button onClick={() => setBase(base + 1)}>Increment Base</button>
    </div>
  );
}
```

**Explanation:**

- `step1` is derived from `baseBox` using `>>=`, doubling the base value.
- `step2` is derived from `step1Box`, adding 5 to the doubled value.
- Both `step1` and `step2` update automatically whenever `base` changes.
- The `set` helper ensures that `baseBox` updates are simple and reactive.

**説明:**

- `step1` は `baseBox` から `>>=` を使って派生し、基底値を 2 倍します。
- `step2` は `step1Box` から派生し、2 倍した値に 5 を加えます。
- `base` が変更されると、`step1` と `step2` が自動的に更新されます。
- `set` ヘルパーにより、`baseBox` の更新がシンプルでリアクティブに行えます。

---

#### Why Wrap with `() =>` in `useRBox`?

When using operators like `<$>`, `<*>`, or `>>=` with `useRBox`, it's important to wrap them in a function (`() =>`). React's `useMemo` is used internally to ensure efficient re-computation only when dependencies change.

`<$>`、`<*>`、`>>=`のような演算子を`useRBox`で使用する場合、必ずそれらを`() =>`でラップする必要があります。React の`useMemo`が内部的に使用され、依存関係が変化した場合にのみ効率的に再計算を行います。

---

#### Incorrect Usage (No `() =>`)

```tsx
import { useRBox } from "f-box-react";

function IncorrectExample() {
  const [, valueBox] = useRBox(10); // Initialize with 10.

  // Directly using valueBox without wrapping.
  const [squared] = useRBox(valueBox["<$>"]((x) => x * x)); // Incorrect!

  return <p>Squared: {squared}</p>;
}
```

**What Happens:**

- `valueBox["<$>"]` is executed immediately on every render.
- Leads to unnecessary computations and potential performance issues.

**動作:**

- `valueBox["<$>"]`がレンダリングごとに即座に実行されます。
- 不要な計算やパフォーマンス問題を引き起こします。

---

#### Correct Usage (With `() =>`)

```tsx
import { useRBox } from "f-box-react";

function CorrectExample() {
  const [, valueBox] = useRBox(10); // Initialize with 10.

  // Wrap valueBox usage with () =>.
  const [squared] = useRBox(() => valueBox["<$>"]((x) => x * x)); // Correct!

  return <p>Squared: {squared}</p>;
}
```

**What Happens:**

- The computation is deferred and memoized.
- React only re-computes `squared` when `valueBox` changes.

**動作:**

- 計算が遅延実行され、メモ化されます。
- `valueBox`が変化したときのみ React が`squared`を再計算します。

---

### `useRBoxForm`

`useRBoxForm` simplifies form state management by leveraging `RBox`. It provides validation, error handling, and utility functions to streamline form handling.

`useRBoxForm`は、`RBox`を活用してフォームの状態管理を簡素化します。バリデーション、エラーハンドリング、ユーティリティ関数を提供し、フォームの操作を効率化します。

---

#### **Full Example: Contact Form**

This example demonstrates how to manage a form using `useRBoxForm`.
It simplifies validation, error message rendering, and form submission logic.

以下の例は、`useRBoxForm`を使った基本的なフォーム管理の使用方法を示します。
バリデーション、エラーメッセージの表示、フォーム送信のロジックを簡潔に実現します。

```tsx
import { useRBoxForm } from "f-box-react";

type Form = {
  name: string;
  email: string;
  message: string;
};

const initialValues: Form = { name: "", email: "", message: "" };

const validate = (form: Form) => ({
  name: [
    () => form.name.trim().length >= 3, // Name must be at least 3 characters.
    () => /^[a-zA-Z]+$/.test(form.name), // Name must only contain letters.
  ],
  email: [
    () => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email), // Email format check.
  ],
  message: [
    () => form.message.trim().length >= 10, // Message must be 10+ characters.
  ],
});

function ContactForm() {
  const {
    form,
    handleChange,
    handleValidatedSubmit,
    renderErrorMessages,
  } = useRBoxForm<Form>(initialValues, validate);

  const handleSubmit = handleValidatedSubmit((form) => {
    alert(`Submitted successfully:\n${JSON.stringify(form, null, 2)}`);
  });

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Name:
        <input
          value={form.name}
          onChange={(e) => handleChange("name", e.target.value)}
        />
        {renderErrorMessages("name", [
          "Name must be at least 3 characters.",
          "Name must only contain letters.",
        ])}
      </label>
      <label>
        Email:
        <input
          value={form.email}
          onChange={(e) => handleChange("email", e.target.value)}
        />
        {renderErrorMessages("email", ["Invalid email format."])}
      </label>
      <label>
        Message:
        <textarea
          value={form.message}
          onChange={(e) => handleChange("message", e.target.value)}
        />
        {renderErrorMessages("message", [
          "Message must be at least 10 characters.",
        ])}
      </label>
      <button type="submit">Submit</button>
    </form>
  );
}
```

---

#### **Key Features**

1. **Validation and Error Handling:**
   - Define validation rules as an array of functions per field in the `validate` function.
   - Display validation errors dynamically using `renderErrorMessages`.

2. **Simplified Form Logic:**
   - `handleChange` to update field values and mark them as edited.
   - `handleValidatedSubmit` to handle form submission based on validation results.

3. **Reactive State Updates:**
   - Powered by `RBox`, the form and validation states remain synchronized reactively.

---

#### **主な特徴**

1. **バリデーションとエラーハンドリング:**
   - 各フィールドごとに複数のバリデーションルールを`validate`関数で定義。
   - `renderErrorMessages`を使用して、動的にエラーメッセージを表示。

2. **フォームロジックの簡略化:**
   - `handleChange`でフィールド値を更新し、編集済みとしてマーク。
   - `handleValidatedSubmit`で、バリデーション結果に基づいたフォーム送信を実現。

3. **リアクティブな状態管理:**
   - `RBox`を活用して、フォームとバリデーション状態をリアクティブに同期。

---

### **Advanced Customization**

`renderErrorMessages` supports custom components for rendering error messages. By default, it uses a `<span>` tag, but you can specify a custom component:

`renderErrorMessages`は、エラーメッセージのレンダリングにカスタムコンポーネントをサポートします。デフォルトでは`<span>`タグを使用しますが、カスタムコンポーネントを指定することも可能です。

```tsx
{renderErrorMessages(
  "name",
  ["Name must be at least 3 characters.", "Name must only contain letters."],
  CustomErrorComponent
)}
```

Example of a custom component:

カスタムコンポーネントの例:

```tsx
const CustomErrorComponent = ({ children }: { children: React.ReactNode }) => (
  <div className="error">{children}</div>
);
```

This customization allows you to flexibly change the style and structure of error rendering components.

このカスタマイズにより、エラー表示のスタイルやコンポーネント構造を柔軟に変更できます。

---

## License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.
