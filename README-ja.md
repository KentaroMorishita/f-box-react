# F-Box React

[![npm version](https://badge.fury.io/js/f-box-react.svg)](https://badge.fury.io/js/f-box-react)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**F-Box React**は、[F-Box Core](https://github.com/KentaroMorishita/f-box-core)の関数型プログラミングパターンをReactアプリケーションに統合するためのTypeScriptライブラリです。RBox（リアクティブボックス）を使用したリアクティブな状態管理と関数型プログラミングの抽象化を提供します。

## 特徴

- **リアクティブ状態管理**: RBoxを使用したリアクティブな状態管理
- **関数型プログラミング**: `["<$>"]`、`["<*>"]`、`[">>="]`などの関数型演算子をサポート
- **型安全性**: TypeScriptジェネリクスによる完全な型安全性
- **SSR対応**: サーバーサイドレンダリングに完全対応
- **軽量**: 最小限の依存関係で軽量な設計

## インストール

```bash
npm install f-box-react
```

**必要な依存関係**（peerDependencies）：
```bash
npm install f-box-core react react-dom
```

## API リファレンス

## 主要フック

### useBox
静的値をBox抽象化で管理するフック

```tsx
import { useBox } from "f-box-react";

function App() {
  const [value, valueBox] = useBox(10);
  const [squared] = useBox(() => valueBox["<$>"]((x) => x * x));

  return (
    <div>
      <p>元の値: {value}</p>
      <p>2乗値: {squared}</p>
    </div>
  );
}
```

### useRBox
RBoxを使用したコアリアクティブ状態管理フック

```tsx
import { useRBox, set } from "f-box-react";

function Counter() {
  const [count, countBox] = useRBox(0);
  const setCount = set(countBox);

  return (
    <div>
      <p>カウント: {count}</p>
      <button onClick={() => setCount(count + 1)}>増加</button>
    </div>
  );
}
```

### useRBoxForm
バリデーション付きフォーム状態管理フック

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
    console.log("フォーム送信:", form);
  });

  return (
    <form onSubmit={handleSubmit}>
      <label>
        名前:
        <input
          value={form.name}
          onChange={(e) => handleChange("name", e.target.value)}
        />
        {renderErrorMessages("name", ["名前は2文字以上で入力してください"])}
      </label>
      <label>
        メール:
        <input
          value={form.email}
          onChange={(e) => handleChange("email", e.target.value)}
        />
        {renderErrorMessages("email", ["有効なメールアドレスを入力してください"])}
      </label>
      <button type="submit">送信</button>
    </form>
  );
}
```

### useRBoxResource
キャッシュ機能付き非同期リソース管理フック

```tsx
import { useRBoxResource } from "f-box-react";
import { Task } from "f-box-core";

type User = { id: number; name: string; email: string };

function UserProfile({ userId }: { userId: number }) {
  const [result, isLoading, controller] = useRBoxResource(
    ({ id }: { id: number }) =>
      Task.from(async () => {
        const response = await fetch(`/api/users/${id}`);
        if (!response.ok) throw new Error('ユーザーの取得に失敗しました');
        return response.json() as User;
      }),
    { id: userId }
  );

  const content = result.match(
    (error) => <div>エラー: {error.message}</div>,
    (user) => (
      <div>
        <h2>{user.name}</h2>
        <p>メール: {user.email}</p>
      </div>
    )
  );

  return (
    <div>
      {isLoading && <div>読み込み中...</div>}
      {content}
      <button onClick={controller.refetch}>更新</button>
    </div>
  );
}
```

### useRBoxTransaction
非同期状態遷移管理フック

```tsx
import { useRBoxTransaction } from "f-box-react";

function AsyncAction() {
  const [isPending, startTransaction] = useRBoxTransaction();

  const performAction = async () => {
    await startTransaction(async () => {
      console.log("処理開始");
      await new Promise((resolve) => setTimeout(resolve, 2000));
      console.log("処理完了");
    });
  };

  return (
    <div>
      <p>{isPending ? "処理中..." : "待機中"}</p>
      <button onClick={performAction} disabled={isPending}>
        非同期処理を実行
      </button>
    </div>
  );
}
```

## 貢献

プルリクエストやイシューの報告を歓迎します。

### 開発環境のセットアップ

```bash
# リポジトリをクローン
git clone https://github.com/YourUsername/f-box-react.git
cd f-box-react

# 依存関係をインストール
npm install

# 開発サーバーを起動
npm run dev
```

### 開発コマンド

```bash
npm run dev      # Vite開発サーバーを起動
npm run build    # ライブラリをビルド
npm run lint     # TypeScriptで型チェック
npm test         # Vitestでテストをウォッチモードで実行
npm run coverage # カバレッジレポート付きでテスト実行
```

### テスト

- フレームワーク: Vitest + React Testing Library
- 環境: jsdom
- 特定テスト実行: `npm test -- useRBox.test.ts`

## サポート

- [GitHub Issues](https://github.com/YourUsername/f-box-react/issues) - バグ報告や機能要望
- [F-Box Core](https://github.com/KentaroMorishita/f-box-core) - 基盤ライブラリ

## ライセンス

MIT License - 詳細は[LICENSE](./LICENSE)ファイルを参照してください。