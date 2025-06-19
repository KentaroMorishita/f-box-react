# F-Box React

**F-Box React** provides React hooks and utilities to seamlessly integrate [F-Box](https://github.com/KentaroMorishita/f-box-core) into your React applications. Built on top of reactive functional programming concepts, it offers a unique approach to state management that combines the power of functional programming with React's reactive nature.

## Core Concepts

### RBox (Reactive Box)
RBox is the cornerstone of f-box-react's reactive state management. Unlike traditional state managers, RBox provides:
- **Functional Composition**: Chain operations using functional operators like `["<$>"]` (map), `["<*>"]` (apply), and `[">>="]` (bind)
- **Reactive Subscriptions**: Automatic re-rendering when state changes through React's `useSyncExternalStore`
- **Immutable Updates**: State changes produce new values while preserving referential transparency
- **Type Safety**: Full TypeScript integration with generic type parameters

### Functional Programming Patterns
F-Box React embraces functional programming principles:
- **Monadic Operations**: Use `[">>="]` for chaining computations that may fail
- **Functor Mapping**: Transform values with `["<$>"]` while preserving context
- **Applicative Style**: Combine multiple boxed values with `["<*>"]`
- **Either Types**: Handle success/error states with `Either<Error, T>` pattern

| Hook                 | Description                                                    |
| -------------------- | -------------------------------------------------------------- |
| `useBox`             | A hook for managing static values with the `Box` abstraction.  |
| `useRBox`            | A hook for managing reactive state with `RBox`.                |
| `useRBoxForm`        | A utility hook for form state management with validation.      |
| `useRBoxResource`    | A hook for async resource management with caching capabilities. |
| `useRBoxTransaction` | A utility hook for handling async state transitions with ease. |

## Installation

Install via npm:

```bash
npm install f-box-react
```

> **Note**: `f-box-react` requires `f-box-core`, `react`, and `react-dom` as `peerDependencies`. Install them if not already available:

```bash
npm install f-box-core react react-dom
```

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

### `useRBoxResource`

`useRBoxResource` provides powerful async resource management with built-in caching, error handling, and reactive state updates. It's perfect for managing API calls, data fetching, and other async operations.

#### Features
- **Automatic Caching**: SHA-256 based cache keys with configurable cache size
- **Error Handling**: Uses `Either<Error, T>` pattern for type-safe error management
- **Reactive Updates**: Built on `useRBox` for seamless React integration
- **Flexible Control**: Auto-run or manual execution modes
- **Loading States**: Independent loading state tracking

#### Example: Basic Usage

```tsx
import { useRBoxResource } from "f-box-react";
import { Task } from "f-box-core";

type User = { id: number; name: string; email: string };

function UserProfile({ userId }: { userId: number }) {
  const [result, isLoading, controller] = useRBoxResource(
    ({ id }: { id: number }) =>
      Task.from(async () => {
        const response = await fetch(`/api/users/${id}`);
        if (!response.ok) throw new Error('Failed to fetch user');
        return response.json() as User;
      }),
    { id: userId }
  );

  // Use Either pattern matching for error handling
  const content = result.match(
    (error) => <div>Error: {error.message}</div>,
    (user) => (
      <div>
        <h2>{user.name}</h2>
        <p>Email: {user.email}</p>
      </div>
    )
  );

  return (
    <div>
      {isLoading && <div>Loading...</div>}
      {content}
      <button onClick={controller.refetch}>Refresh</button>
    </div>
  );
}
```

#### Example: Manual Control with Caching

```tsx
import { useRBoxResource } from "f-box-react";
import { Task } from "f-box-core";

function SearchResults() {
  const [result, isLoading, { run, mutate, clearCache }] = useRBoxResource(
    ({ query, page }: { query: string; page: number }) =>
      Task.from(async () => {
        const response = await fetch(`/api/search?q=${query}&page=${page}`);
        return response.json();
      }),
    { query: "", page: 1 },
    {
      isAutoRun: false,    // Don't run automatically
      maxCacheSize: 50     // Cache up to 50 different queries
    }
  );

  const handleSearch = (query: string) => {
    mutate({ query, page: 1 }); // Updates params and triggers fetch
  };

  const handlePageChange = (page: number) => {
    mutate({ page }); // Partial update - preserves query
  };

  return (
    <div>
      <input
        type="text"
        onChange={(e) => handleSearch(e.target.value)}
        placeholder="Search..."
      />

      {isLoading && <div>Searching...</div>}

      {result.match(
        (error) => <div>Search failed: {error.message}</div>,
        (data) => (
          <div>
            <div>Results: {data.results.length}</div>
            <button onClick={() => handlePageChange(data.page + 1)}>
              Next Page
            </button>
          </div>
        )
      )}

      <button onClick={clearCache}>Clear Cache</button>
    </div>
  );
}
```

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

## Advanced Functional Programming Examples

### Combining Multiple RBoxes with Applicative Style

```tsx
import { useRBox } from "f-box-react";
import { RBox } from "f-box-core";

function Calculator() {
  const [a, aBox] = useRBox(5);
  const [b, bBox] = useRBox(3);
  const [operation, opBox] = useRBox('+');

  // Combine three RBoxes using applicative style
  const [result] = useRBox(() => {
    return RBox.pack((a: number) => (b: number) => (op: string) => {
      switch (op) {
        case '+': return a + b;
        case '-': return a - b;
        case '*': return a * b;
        case '/': return b !== 0 ? a / b : 0;
        default: return 0;
      }
    })["<*>"](aBox)["<*>"](bBox)["<*>"](opBox);
  }, []);

  return (
    <div>
      <input
        type="number"
        value={a}
        onChange={(e) => RBox.set(aBox)(Number(e.target.value))}
      />
      <select
        value={operation}
        onChange={(e) => RBox.set(opBox)(e.target.value)}
      >
        <option value="+">+</option>
        <option value="-">-</option>
        <option value="*">*</option>
        <option value="/">/</option>
      </select>
      <input
        type="number"
        value={b}
        onChange={(e) => RBox.set(bBox)(Number(e.target.value))}
      />
      <div>Result: {result}</div>
    </div>
  );
}
```

### Monadic Chaining with Error Handling

```tsx
import { useRBox } from "f-box-react";
import { RBox, Either } from "f-box-core";

type ValidationError = { field: string; message: string };
type User = { email: string; age: number };

function UserForm() {
  const [email, emailBox] = useRBox("");
  const [age, ageBox] = useRBox("");

  // Chain validations using monadic bind operator
  const [validationResult] = useRBox(() => {
    return RBox.pack(Either.right<ValidationError, string>(email))
      [">>="]((email) =>
        email.includes('@')
          ? Either.right(email)
          : Either.left({ field: 'email', message: 'Invalid email format' })
      )
      [">>="]((validEmail) => {
        const ageNum = parseInt(age);
        return isNaN(ageNum) || ageNum < 0
          ? Either.left({ field: 'age', message: 'Age must be a positive number' })
          : Either.right({ email: validEmail, age: ageNum } as User);
      });
  }, [email, age]);

  const handleSubmit = () => {
    validationResult.match(
      (error) => alert(`Validation Error: ${error.message}`),
      (user) => console.log('Valid user:', user)
    );
  };

  return (
    <div>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => RBox.set(emailBox)(e.target.value)}
      />
      <input
        type="number"
        placeholder="Age"
        value={age}
        onChange={(e) => RBox.set(ageBox)(e.target.value)}
      />
      <button onClick={handleSubmit}>Submit</button>

      {validationResult.match(
        (error) => <div style={{color: 'red'}}>{error.message}</div>,
        (user) => <div style={{color: 'green'}}>✓ Valid user data</div>
      )}
    </div>
  );
}
```

### Functional Composition with Data Transformation

```tsx
import { useRBox } from "f-box-react";
import { RBox } from "f-box-core";

type TodoItem = { id: number; text: string; completed: boolean };

function TodoList() {
  const [todos, todosBox] = useRBox<TodoItem[]>([
    { id: 1, text: "Learn f-box-react", completed: false },
    { id: 2, text: "Build awesome app", completed: true }
  ]);

  // Functional transformations using map operator
  const [completedCount] = useRBox(() =>
    todosBox["<$>"]((todos) => todos.filter(todo => todo.completed).length)
  );

  const [pendingTodos] = useRBox(() =>
    todosBox["<$>"]((todos) => todos.filter(todo => !todo.completed))
  );

  const [completionRate] = useRBox(() =>
    todosBox["<$>"]((todos) =>
      todos.length > 0 ? (completedCount / todos.length * 100).toFixed(1) : "0"
    )
  );

  const toggleTodo = (id: number) => {
    const updatedTodos = todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    );
    RBox.set(todosBox)(updatedTodos);
  };

  return (
    <div>
      <h3>Todo List</h3>
      <div>
        Completion Rate: {completionRate}% ({completedCount}/{todos.length})
      </div>

      <ul>
        {todos.map(todo => (
          <li key={todo.id}>
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => toggleTodo(todo.id)}
            />
            <span style={{
              textDecoration: todo.completed ? 'line-through' : 'none'
            }}>
              {todo.text}
            </span>
          </li>
        ))}
      </ul>

      <h4>Pending Tasks:</h4>
      <ul>
        {pendingTodos.map(todo => (
          <li key={todo.id}>{todo.text}</li>
        ))}
      </ul>
    </div>
  );
}
```

## Why Choose F-Box React?

### Performance Benefits
- **Minimal Re-renders**: Only components subscribed to changed RBoxes re-render
- **Efficient Subscriptions**: Uses React's `useSyncExternalStore` for optimal performance
- **Smart Caching**: Built-in caching in `useRBoxResource` reduces unnecessary API calls
- **Immutable Updates**: Prevents accidental mutations that can cause performance issues

### Developer Experience
- **Type Safety**: Full TypeScript integration with generic types and inference
- **Predictable State**: Functional programming principles ensure predictable state transitions
- **Composable Logic**: Easily combine and compose state logic using functional operators
- **Error Handling**: Built-in error handling patterns with `Either` types

### Unique Features
- **Functional Programming**: Brings FP concepts to React state management
- **Reactive by Design**: Built from the ground up for reactive programming
- **SSR Compatible**: Full server-side rendering support
- **Framework Agnostic Core**: Core logic can be reused across different frameworks

## Comparison with Other State Management Libraries

| Feature | F-Box React | Redux Toolkit | Zustand | Jotai |
|---------|-------------|---------------|---------|-------|
| **Learning Curve** | Medium (FP concepts) | High | Low | Medium |
| **Bundle Size** | Small | Large | Very Small | Small |
| **TypeScript Support** | Excellent | Good | Good | Excellent |
| **Functional Programming** | ✅ Core feature | ❌ | ❌ | Partial |
| **Built-in Async** | ✅ `useRBoxResource` | ❌ (need middleware) | ❌ | ❌ |
| **Reactive Updates** | ✅ Native | ❌ | ❌ | ✅ |
| **Error Handling** | ✅ `Either` types | Manual | Manual | Manual |
| **Caching** | ✅ Built-in | ❌ | ❌ | ❌ |
| **Form Handling** | ✅ `useRBoxForm` | Manual | Manual | Manual |

### When to Choose F-Box React
- **✅ You appreciate functional programming concepts**
- **✅ You need built-in async resource management with caching**
- **✅ You want type-safe error handling out of the box**
- **✅ You prefer reactive programming patterns**
- **✅ You need a small bundle size with powerful features**

### When to Consider Alternatives
- **❌ Your team is unfamiliar with functional programming**
- **❌ You need extensive middleware ecosystem (Redux)**
- **❌ You want the simplest possible API (Zustand)**
- **❌ You're building a simple app with minimal state needs**

## License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.
