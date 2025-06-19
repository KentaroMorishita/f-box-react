# CLAUDE.md

このファイルは、Claude Code (claude.ai/code) がこのリポジトリで作業する際のガイダンスを提供します。

## プロジェクト概要

**f-box-react** は、f-box-coreの関数型プログラミングパターンをReactアプリケーションに統合するためのReactフックとユーティリティを提供するTypeScriptライブラリです。RBox（リアクティブボックス）を使用したリアクティブな状態管理と関数型プログラミングの抽象化に焦点を当てています。

## 開発コマンド

### 基本開発
- `npm run dev` - Vite開発サーバーを起動
- `npm run build` - ライブラリをビルド（TypeScriptコンパイル + Viteビルド）
- `npm run lint` - TypeScriptで型チェック（出力なし）
- `npm test` - Vitestでテストをウォッチモードで実行
- `npm run coverage` - カバレッジレポート付きでテスト実行

### 配布手順
1. `npm test run` - 全テスト実行
2. `npm run lint` - 型チェック
3. `npm run build` - ビルド
4. `git add .` - 変更をステージング
5. `git commit -m "修正内容の説明"` - コミット
6. バージョン更新:
   - `npm run version:patch` - パッチ版更新（バグフィックス: 0.2.8 → 0.2.9）
   - `npm run version:minor` - マイナー版更新（新機能: 0.2.8 → 0.3.0）
   - `npm run version:major` - メジャー版更新（破壊的変更: 0.2.8 → 1.0.0）
7. `git push origin main --tags` - 変更とタグをプッシュ
8. `npm run publish:public` - npm公開

## アーキテクチャ

### ライブラリ構造
`src/main.ts`から5つの主要なフックをエクスポート：
- **useBox** - Box抽象化を使った静的値
- **useRBox** - RBoxを使用したコアリアクティブ状態管理フック
- **useRBoxForm** - バリデーション付きフォーム状態管理
- **useRBoxResource** - キャッシュ機能付き非同期リソース管理
- **useRBoxTransaction** - 非同期状態遷移管理

### 核となる概念
- **RBox統合**: すべてのフックがf-box-coreのRBoxをリアクティブ状態に活用
- **関数型パターン**: `["<$>"]`、`["<*>"]`、`[">>="]`などの関数型プログラミング演算子を使用
- **外部ストア統合**: RBoxサブスクリプションにReactの`useSyncExternalStore`を使用
- **型安全性**: TypeScriptジェネリクスで完全な型付け

### 主要な実装詳細
- `useRBox`が基盤 - 他のフックはこれをベースに構築
- 状態同期はRBoxのsubscribe/unsubscribeメカニズムを通じて実行
- フォームバリデーションはフィールドごとのバリデーションルール配列を使用
- リソース管理は設定可能なキャッシュサイズでキャッシュ機能を含む
- トランザクション管理は非同期操作のペンディング状態を追跡

## ビルド設定

### 出力フォーマット
Viteを通じて複数フォーマットでビルド：
- ESモジュール（`.mjs`）
- CommonJS（`.cjs`）
- UMD（`.js`）
- `dist/types/`内のTypeScript宣言

### 外部依存関係
コアピア依存関係（バンドルされない）：
- `f-box-core` - 関数型プログラミングコアライブラリ
- `react`と`react-dom` - Reactランタイム

## テスト

### フレームワーク: Vitest + React Testing Library
- 環境: jsdom
- グローバルテスト関数有効
- セットアップファイル: `setupTests.ts`（jest-domマッチャーをインポート）
- テスト場所: `tests/`ディレクトリ
- コンポーネントのスナップショットテスト有効

### テスト実行
- 単一テスト実行: `npm test run`
- 特定テスト: `npm test -- useRBox.test.ts`
- カバレッジ: `npm run coverage`

## コードパターン

### フック実装パターン
ほとんどのフックは以下の構造に従う：
1. リアクティブ状態管理に`useRBox`を使用
2. `[現在値, リアクティブボックス]`のタプルを返す
3. ボックスと連携するユーティリティ関数を提供（`set`など）

### 型定義
- 柔軟性のためのジェネリック型パラメータ
- 異なる使用ケースのためのオーバーロード関数シグネチャ
- 包括的なチェック付きの厳密なTypeScript設定