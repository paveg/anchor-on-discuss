# Anchor on Discuss

GitHub Discussionページのh1～h6見出しに、GitHubスタイルのアンカーリンクを自動追加するChrome拡張機能です。

## 特徴

- **GitHubスタイルのUI**: 見出しにホバーすると左側にリンクアイコンが表示
- **全見出しレベル対応**: h1～h6すべての見出しに対応
- **スムーズスクロール**: アンカーリンククリック時に該当箇所へ自動スクロール
- **URL更新**: ブラウザのURL欄にアンカーを反映（履歴に残ります）
- **クリップボードコピー**: アンカー付きURLを自動的にクリップボードにコピー
- **トースト通知**: コピー完了時に通知を表示
- **SPA対応**: GitHub DiscussionのSPA遷移にも対応

## インストール方法

### 開発版のインストール

1. **依存関係のインストール**
   ```bash
   pnpm install
   ```

2. **ビルド**
   ```bash
   pnpm run build
   ```

3. **Chrome拡張機能として読み込む**
   - Chromeで `chrome://extensions/` を開く
   - 右上の「デベロッパーモード」を有効化
   - 「パッケージ化されていない拡張機能を読み込む」をクリック
   - `dist` フォルダを選択

### 開発モード（自動リビルド）

```bash
pnpm run dev
```

ファイルを変更すると自動的に再ビルドされます。Chrome拡張機能のページで「更新」ボタンをクリックして変更を反映してください。

## 使い方

1. GitHub Discussionページを開く
2. 見出し（h1～h6）にマウスをホバー
3. 左側に表示される `#` アイコンをクリック
4. URLがクリップボードにコピーされ、トースト通知が表示されます

### アンカーリンクの共有

- クリックするとURL欄が `https://github.com/org/repo/discussions/123#section-title` のように更新されます
- このURLを共有すると、相手は該当の見出しに直接ジャンプできます

## 技術スタック

- **TypeScript**: 型安全な開発
- **Vite**: 高速ビルドツール
- **Chrome Extension Manifest V3**: 最新のChrome拡張機能仕様

## プロジェクト構成

```
anchor-on-discuss/
├── src/
│   ├── content/
│   │   ├── index.ts          # メインコンテンツスクリプト
│   │   ├── anchorManager.ts  # アンカーリンク生成ロジック
│   │   └── styles.css        # スタイル
│   ├── types/
│   │   └── index.d.ts        # 型定義
│   └── manifest.json         # Chrome拡張マニフェスト
├── dist/                     # ビルド出力
├── vite.config.ts
├── tsconfig.json
└── package.json
```

## 開発

### スクリプト

- `pnpm run dev` - 開発モード（watch）
- `pnpm run build` - プロダクションビルド
- `pnpm run type-check` - TypeScript型チェック
- `pnpm run generate-icons` - アイコン生成

### デバッグ

1. Chrome DevToolsを開く
2. Consoleタブで `[Anchor on Discuss]` のログを確認
3. Elementsタブで `.anchor-link` クラスを検査

## カスタマイズ

### 見出しレベルの変更

`src/content/anchorManager.ts` の `DEFAULT_CONFIG` を編集：

```typescript
const DEFAULT_CONFIG: AnchorConfig = {
  headingLevels: ['h1', 'h2'], // h1とh2のみにする
  iconContent: '#',
  showToast: true,
};
```

### アイコンの変更

```typescript
const DEFAULT_CONFIG: AnchorConfig = {
  headingLevels: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
  iconContent: '🔗', // リンクアイコンに変更
  showToast: true,
};
```

### スタイルのカスタマイズ

`src/content/styles.css` を編集して、色やアニメーションを変更できます。

## ライセンス

MIT

## 貢献

Pull Requestやissueを歓迎します！
