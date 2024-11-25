# F-Box React

**F-Box React** provides React hooks and utilities to seamlessly integrate [F-Box Core](https://github.com/KentaroMorishita/f-box-core) into your React applications. With `useBox`, `useRBox`, and `useRBoxForm`, you can manage state reactively and functionally, leveraging the abstractions provided by F-Box Core.

**F-Box React** は、[F-Box Core](https://github.com/KentaroMorishita/f-box-core) を React アプリケーションにシームレスに統合するためのフックとユーティリティを提供します。`useBox`、`useRBox`、`useRBoxForm` を活用して、F-Box Core が提供する抽象化を利用したリアクティブで関数型の状態管理を実現できます。

| Hook          | Description                                                                                                                                                                    |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `useBox`      | A hook for managing static values with the `Box` abstraction. / 静的な値を`Box`抽象で管理するフック。                                                                           |
| `useRBox`     | A hook for managing reactive state with `RBox`. / `RBox` を使用してリアクティブな状態を管理するフック。                                                                         |
| `useRBoxForm` | A utility hook for form state management with validation. / バリデーション付きのフォーム状態管理を実現するユーティリティフック。                                                 |

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

`useBox` allows you to work with static values encapsulated in a `Box`, using F-Box Core's operators like `["<$>"]`, `["<*>"]`, and `[">>="]`.

`useBox` を使用すると、F-Box Core の `Box` 抽象にカプセル化された静的な値を操作できます。`["<$>"]`、`["<*>"]`、`[">>="]` といった演算子を使用します。

#### Example

```tsx
import { useBox } from "f-box-react";

function App() {
  const [value, box] = useBox(10); // Initial value is 10 / 初期値は10

  // Derive new values using ["<$>"] / ["<$>"] を使って値を派生
  const [squared] = useBox(() => box["<$>"]((x) => x * x));

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

`useRBox`は、F-Boxのリアクティブな状態管理（`RBox`）をReactコンポーネントに統合するための主要なフックです。リアクティブな状態とReactのレンダリングライフサイクルをシームレスに結びつけます。

---

#### Local State Example

Use `useRBox` to create and manage a local reactive state within a single component.

`useRBox`を使用して、1つのコンポーネント内でローカルなリアクティブ状態を作成・管理します。

```tsx
import { useRBox, set } from "f-box-react";

function Counter() {
  const [count, countBox] = useRBox(0); // Initialize with 0
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
  const [count] = useRBox(countBox);
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

  const reset = () => setCount(0);

  return <button onClick={reset}>Reset</button>;
}
```

In this example, `Counter` and `ResetButton` share the same `countBox`. Updating the state in one component automatically reflects in the other.

この例では、`Counter`と`ResetButton`は同じ`countBox`を共有しています。一方のコンポーネントで状態を更新すると、もう一方にも自動的に反映されます。

---

### Reactive Operators with `useRBox`

The power of `useRBox` lies in its ability to maintain reactivity while composing, transforming, and chaining values. Using operators like `<$>`, `<*>`, and `>>=`, you can build highly dynamic and interconnected state systems.

`useRBox`の強みは、値を合成、変換、連結しながらリアクティビティを維持できる点にあります。`<$>`、`<*>`、`>>=`といった演算子を使うことで、動的で相互接続された状態管理システムを構築できます。

---

#### `<$>` in `useRBox` / `useRBox`での`<$>`の使用例

```tsx
import { useRBox } from "f-box-react";

function ReactiveExample() {
  const [baseValue, baseBox] = useRBox(10);
  const [squared] = useRBox(() => baseBox["<$>"]((x) => x * x));
  const [cubed] = useRBox(() => baseBox["<$>"]((x) => x * x * x));

  return (
    <div>
      <p>Base Value: {baseValue}</p>
      <p>Squared: {squared}</p>
      <p>Cubed: {cubed}</p>
      <button onClick={() => baseBox.setValue(baseValue + 1)}>Increment</button>
    </div>
  );
}
```

**Explanation:**
- `squared` and `cubed` update automatically whenever `baseValue` changes.
- This demonstrates the seamless reactivity between `RBox` values.

**説明:**
- `baseValue`が変更されるたびに`squared`と`cubed`が自動で更新されます。
- `RBox`値間のスムーズなリアクティビティを示しています。

---

#### `<*>` in `useRBox` / `useRBox`での`<*>`の使用例

```tsx
import { useRBox } from "f-box-react";

function CombineStates() {
  // multiplierBox contains a function: (x: number) => number
  const [multiplierFn, multiplierBox] = useRBox(() => (x: number) => x * 2);
  const [value, valueBox] = useRBox(5);

  // Compute the product using <*>
  const [product] = useRBox(() => multiplierBox["<*>"](valueBox));

  // Update functions
  const incrementMultiplier = () =>
    multiplierBox.setValue((fn) => (x: number) => fn(x) + 1);

  const incrementValue = () => valueBox.setValue((current) => current + 1);

  return (
    <div>
      <p>Multiplier Function: (x) => {multiplierFn(1)}</p>
      <p>Value: {value}</p>
      <p>Product: {product}</p>
      <button onClick={incrementMultiplier}>Increment Multiplier</button>
      <button onClick={incrementValue}>Increment Value</button>
    </div>
  );
}
```

**Explanation:**
- `multiplierBox` initially holds a function `(x) => x * 2`.
- The `<*>` operator applies the function inside `multiplierBox` to the value inside `valueBox`, producing the `product`.
- Changes to either the function in `multiplierBox` or the value in `valueBox` trigger an update to `product`.

**説明:**
- `multiplierBox` は初期値として `(x) => x * 2` という関数を持ちます。
- `<*>` 演算子は、`multiplierBox` 内の関数を `valueBox` 内の値に適用し、`product` を生成します。
- `multiplierBox` 内の関数または `valueBox` 内の値が変更されると、`product` が更新されます。


---

#### `>>=` in `useRBox` / `useRBox`での`>>=`の使用例

```tsx
import { useRBox } from "f-box-react";

function DependentStates() {
  const [baseValue, baseBox] = useRBox(10);

  const [step1] = useRBox(() => baseBox[">>="]((x) => RBox.pack(x * 2)));
  const [step2] = useRBox(() => step1[">>="]((x) => RBox.pack(x + 5)));

  return (
    <div>
      <p>Base Value: {baseValue}</p>
      <p>Step 1 (x * 2): {step1}</p>
      <p>Step 2 (x + 5): {step2}</p>
      <button onClick={() => baseBox.setValue(baseValue + 1)}>Increment</button>
    </div>
  );
}
```

**Explanation:**
- The state `step2` depends on `step1`, and both update whenever `baseValue` changes.
- This is useful for scenarios requiring a chain of reactive transformations.

**説明:**
- 状態`step2`は`step1`に依存しており、`baseValue`が変更されると両方が更新されます。
- リアクティブな変換の連鎖が必要なシナリオに役立ちます。

---

#### Why Wrap with `() =>` in `useRBox`?

When using operators like `<$>`, `<*>`, or `>>=` with `useRBox`, it's important to wrap them in a function (`() =>`). React's `useMemo` is used internally to ensure efficient re-computation only when dependencies change.

`<$>`、`<*>`、`>>=`のような演算子を`useRBox`で使用する場合、必ずそれらを`() =>`でラップする必要があります。Reactの`useMemo`が内部的に使用され、依存関係が変化した場合にのみ効率的に再計算を行います。

---

#### Incorrect Usage (No `() =>`)

```tsx
import { useRBox } from "f-box-react";

function IncorrectExample() {
  const [valueBox] = useRBox(10);
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
  const [valueBox] = useRBox(10);
  const [squared] = useRBox(() => valueBox["<$>"]((x) => x * x)); // Correct!

  return <p>Squared: {squared}</p>;
}
```

**What Happens:**
- The computation is deferred and memoized.
- React only re-computes `squared` when `valueBox` changes.

**動作:**
- 計算が遅延実行され、メモ化されます。
- `valueBox`が変化したときのみReactが`squared`を再計算します。

---

### `useRBoxForm`

`useRBoxForm` simplifies form state management by leveraging `RBox`. It provides validation, error handling, and utility functions to streamline form handling.

`useRBoxForm`は、`RBox`を活用してフォームの状態管理を簡素化します。バリデーション、エラーハンドリング、ユーティリティ関数を提供し、フォームの操作を効率化します。

---

#### Full Example: Contact Form

```tsx
import { useRBoxForm } from "f-box-react";

type Form = {
  name: string;
  email: string;
  message: string;
};

const initialValues: Form = { name: "", email: "", message: "" };

const validate = (form: Form) => ({
  name: form.name.trim().length >= 3,
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email),
  message: form.message.trim().length >= 10,
});

function ContactForm() {
  const { form, handleChange, handleValidatedSubmit, shouldShowError } =
    useRBoxForm<Form>(initialValues, validate);

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
        {shouldShowError("name") && <span>Name is invalid.</span>}
      </label>
      <label>
        Email:
        <input
          value={form.email}
          onChange={(e) => handleChange("email", e.target.value)}
        />
        {shouldShowError("email") && <span>Email is invalid.</span>}
      </label>
      <label>
        Message:
        <textarea
          value={form.message}
          onChange={(e) => handleChange("message", e.target.value)}
        />
        {shouldShowError("message") && <span>Message is too short.</span>}
      </label>
      <button type="submit">Submit</button>
    </form>
  );
}
```

**Key Features:**
- Validation and error handling using the `validate` function.
- Simplifies form logic with `handleChange`, `shouldShowError`, and `handleValidatedSubmit`.
- Fully reactive updates powered by `RBox`.

**主な特徴:**
- `validate`関数を使用したバリデーションとエラーハンドリング。
- `handleChange`、`shouldShowError`、`handleValidatedSubmit`でフォームロジックを簡略化。
- `RBox`による完全リアクティブな更新。


---

## License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.