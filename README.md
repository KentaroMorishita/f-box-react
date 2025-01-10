# F-Box React

**F-Box React** provides React hooks and utilities to seamlessly integrate [F-Box](https://github.com/KentaroMorishita/f-box-core) into your React applications. With `useBox`, `useRBox`, `useRBoxForm`, and `useRBoxTransaction`, you can manage state reactively and functionally, leveraging the abstractions provided by F-Box.

| Hook                 | Description                                                    |
| -------------------- | -------------------------------------------------------------- |
| `useBox`             | A hook for managing static values with the `Box` abstraction.  |
| `useRBox`            | A hook for managing reactive state with `RBox`.                |
| `useRBoxForm`        | A utility hook for form state management with validation.      |
| `useRBoxTransaction` | A utility hook for handling async state transitions with ease. |

---

## Installation

Install via npm:

```bash
npm install f-box-react
```

> **Note**: `f-box-react` requires `f-box-core`, `react`, and `react-dom` as `peerDependencies`. Install them if not already available:

```bash
npm install f-box-core react react-dom
```

---

## Usage

### `useBox`

`useBox` allows you to work with static values encapsulated in a `Box`, using F-Box's operators like `["<$>"]`, `["<*>"]`, and `[">>="]`.

#### Example

```tsx
import { useBox } from "f-box-react";

function App() {
  const [value, valueBox] = useBox(10); // Initial value is 10.

  // Derive new values using ["<$>"]
  const [squared] = useBox(() => valueBox["<$>"]((x) => x * x));

  return (
    <div>
      <p>Original Value: {value}</p>
      <p>Squared Value: {squared}</p>
    </div>
  );
}
```

---

### `useRBox`

`useRBox` is the core hook for integrating F-Box's reactive state management (`RBox`) into React components. It allows seamless connection between reactive state and React's rendering lifecycle.

#### Example: Local State

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

#### Example: Global State

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

---

### `useRBoxForm`

`useRBoxForm` simplifies form state management by leveraging `RBox`. It provides validation, error handling, and utility functions to streamline form handling.

#### Example

```tsx
import { useRBoxForm } from "f-box-react";

type Form = {
  name: string;
  email: string;
  message: string;
};

const initialValues: Form = { name: "", email: "", message: "" };

const validate = (form: Form) => ({
  name: [() => form.name.length >= 3, () => /^[a-zA-Z]+$/.test(form.name)],
  email: [() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)],
  message: [() => form.message.length >= 10],
});

function ContactForm() {
  const { form, handleChange, handleValidatedSubmit, renderErrorMessages } =
    useRBoxForm<Form>(initialValues, validate);

  const handleSubmit = handleValidatedSubmit((form) => {
    console.log("Form submitted:", form);
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

### `useRBoxTransaction`

A hook for managing asynchronous state transitions reactively. It tracks whether a transaction is pending and ensures state updates are encapsulated within the transaction lifecycle.

#### Example

```tsx
import { useRBoxTransaction } from "f-box-react";

function AsyncAction() {
  const [isPending, startTransaction] = useRBoxTransaction();

  const performAction = async () => {
    await startTransaction(async () => {
      console.log("Transaction started");
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate async work
      console.log("Transaction finished");
    });
  };

  return (
    <div>
      <p>{isPending ? "Processing..." : "Idle"}</p>
      <button onClick={performAction} disabled={isPending}>
        Perform Async Action
      </button>
    </div>
  );
}
```

---

## License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.
