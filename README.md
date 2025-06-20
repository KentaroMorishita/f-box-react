# F-Box React

[![npm version](https://badge.fury.io/js/f-box-react.svg)](https://badge.fury.io/js/f-box-react)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**F-Box React** is a TypeScript library that provides React hooks and utilities to seamlessly integrate [F-Box Core](https://github.com/KentaroMorishita/f-box-core) functional programming patterns into React applications. It focuses on reactive state management using RBox (Reactive Box) and functional programming abstractions.

## Features

- **Reactive State Management**: Reactive state management using RBox
- **Functional Programming**: Support for functional operators like `["<$>"]`, `["<*>"]`, `[">>="]`
- **Type Safety**: Complete type safety through TypeScript generics
- **SSR Support**: Full server-side rendering compatibility
- **Lightweight**: Minimal dependencies with lightweight design

## Installation

```bash
npm install f-box-react
```

**Required dependencies** (peerDependencies):
```bash
npm install f-box-core react react-dom
```

## API Reference

## Main Hooks

### useBox
A hook for managing static values with Box abstraction

```tsx
import { useBox } from "f-box-react";

function App() {
  const [value, valueBox] = useBox(10);
  const [squared] = useBox(() => valueBox["<$>"]((x) => x * x));

  return (
    <div>
      <p>Original Value: {value}</p>
      <p>Squared Value: {squared}</p>
    </div>
  );
}
```

### useRBox
Core reactive state management hook using RBox. This is the foundation hook that all other hooks are built upon.

#### Function Signatures

```tsx
// Pattern 1: Pass an existing RBox
function useRBox<T>(source: RBox<T>): [T, RBox<T>];

// Pattern 2: Create a new RBox from a value or factory function
function useRBox<T>(
  source: T | (() => T | RBox<T>),
  deps?: React.DependencyList
): [T, RBox<T>];
```

#### Usage Patterns

**Pattern 1: Local State (Most Common)**
```tsx
import { useRBox, set } from "f-box-react";

function Counter() {
  // Creates a new RBox with initial value 0
  const [count, countBox] = useRBox(0);
  const setCount = set(countBox);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
}
```

**Pattern 2: Global State**
```tsx
import { RBox } from "f-box-core";
import { useRBox, set } from "f-box-react";

// Create global RBox outside component
const globalCountBox = RBox.pack(0);

function Counter() {
  // Use existing RBox - shares state globally
  const [count] = useRBox(globalCountBox);
  const setCount = set(globalCountBox);

  return (
    <div>
      <p>Global Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
}

function ResetButton() {
  // Another component using the same global state
  const setCount = set(globalCountBox);
  return <button onClick={() => setCount(0)}>Reset</button>;
}
```

**Pattern 3: Factory Function**
```tsx
function TimestampComponent() {
  // Factory function runs only on mount (empty deps array)
  const [timestamp] = useRBox(() => Date.now(), []);

  return <div>Created at: {new Date(timestamp).toLocaleString()}</div>;
}
```

**Pattern 4: Factory Function with Dependencies**
```tsx
function UserProfile({ userId }: { userId: number }) {
  // Factory function re-runs when userId changes
  const [userBox] = useRBox(() => {
    // Create initial state based on userId
    return { id: userId, name: `User ${userId}`, loading: true };
  }, [userId]);

  // userBox is recreated whenever userId changes
  return <div>User ID: {userBox.id}</div>;
}
```

**Pattern 5: Factory Function Returning RBox**
```tsx
function ComplexState({ config }: { config: Config }) {
  // Factory can return either a value or an existing RBox
  const [state, stateBox] = useRBox(() => {
    if (config.useGlobalState) {
      return getGlobalStateBox(); // Returns existing RBox
    } else {
      return createInitialState(config); // Returns plain value
    }
  }, [config]);

  return <div>State: {JSON.stringify(state)}</div>;
}
```

**Pattern 6: Computed State**
```tsx
function Calculator() {
  const [a, aBox] = useRBox(5);
  const [b, bBox] = useRBox(3);
  
  // Derive computed state from other RBoxes
  const [sum] = useRBox(() => {
    return RBox.pack(0)["<$>"](() => a + b);
  }, [a, b]);

  return <div>Sum: {sum}</div>;
}
```

#### Key Points

- **Return Value**: Always returns `[currentValue, rbox]` tuple
- **Reactivity**: Components automatically re-render when RBox value changes
- **Global State**: Pass existing RBox to share state across components
- **Local State**: Pass initial value to create component-local state
- **Factory Functions**: Use for computed initial values or conditional RBox creation
- **Dependencies**: Factory functions re-run when dependencies change
- **SSR Safe**: Uses `useSyncExternalStore` for server-side rendering compatibility

### useRBoxForm
Form state management hook with validation

```tsx
import { useRBoxForm } from "f-box-react";

type Form = {
  name: string;
  email: string;
};

const initialValues: Form = { name: "", email: "" };

const validate = (form: Form) => ({
  name: [() => form.name.length >= 2],
  email: [() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)],
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
        {renderErrorMessages("name", ["Name must be at least 2 characters"])}
      </label>
      <label>
        Email:
        <input
          value={form.email}
          onChange={(e) => handleChange("email", e.target.value)}
        />
        {renderErrorMessages("email", ["Please enter a valid email address"])}
      </label>
      <button type="submit">Submit</button>
    </form>
  );
}
```

### useRBoxResource
Asynchronous resource management hook with caching capabilities

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

### useRBoxTransaction
Asynchronous state transition management hook

```tsx
import { useRBoxTransaction } from "f-box-react";

function AsyncAction() {
  const [isPending, startTransaction] = useRBoxTransaction();

  const performAction = async () => {
    await startTransaction(async () => {
      console.log("Processing started");
      await new Promise((resolve) => setTimeout(resolve, 2000));
      console.log("Processing completed");
    });
  };

  return (
    <div>
      <p>{isPending ? "Processing..." : "Idle"}</p>
      <button onClick={performAction} disabled={isPending}>
        Execute Async Process
      </button>
    </div>
  );
}
```

## Contributing

Pull requests and issue reports are welcome.

### Development Environment Setup

```bash
# Clone the repository
git clone https://github.com/YourUsername/f-box-react.git
cd f-box-react

# Install dependencies
npm install

# Start development server
npm run dev
```

### Development Commands

```bash
npm run dev      # Start Vite development server
npm run build    # Build the library
npm run lint     # TypeScript type checking
npm test         # Run tests with Vitest in watch mode
npm run coverage # Run tests with coverage report
```

### Testing

- Framework: Vitest + React Testing Library
- Environment: jsdom
- Run specific tests: `npm test -- useRBox.test.ts`

## Support

- [GitHub Issues](https://github.com/YourUsername/f-box-react/issues) - Bug reports and feature requests
- [F-Box Core](https://github.com/KentaroMorishita/f-box-core) - Core library

## License

MIT License - See the [LICENSE](./LICENSE) file for details.