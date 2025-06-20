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
Core reactive state management hook using RBox

```tsx
import { useRBox, set } from "f-box-react";

function Counter() {
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