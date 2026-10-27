# ChatGPTで作る塗り絵本＆Etsy販売スタートガイド（特典ページ）

> 設計の共通原則は `~/.claude/CLAUDE.md` に従う。要件は 制作指示書の内容に沿う。

## プロジェクト設定

技術スタック: HTML5 / CSS3 / Vanilla JavaScript（ビルドなし）、GitHub Pages。backend・database・環境変数なし（`.env` 系は作らない）。

## 運用ルール

- 最新の特典（chatgpt-10prompts-tokuten）と同じデザイン・部品の複製。複製元と既存特典は未変更
- 文章・プロンプト・リンクの単一の源は `js/content.js`。色・余白は `css/style.css` の `:root`
- プロンプトは制作指示書の文面を変更しない（意味・文言・改行）。売上実績・成功事例・収益保証は載せない。手数料・開設条件・容量・AI開示などの変わる情報は断定せず公式リンクへ
- CTA: ファーストビュー直下（教科書5大特典の画像）と最後の2か所。最後は「次の一歩へ」のメッセージ→LINEボタン→教科書バナー。OGP画像は設定しない。LINE誘導先は `lineUrl` の1か所のみ（既存特典と同じ）
- 本番公開（GitHub Pagesへの反映）はユーザーの確認を得てから

## 命名・品質

- ファイル kebab-case / 変数 camelCase / 関数100行・ファイル700行・複雑度10・行長120以下
- ローカル確認: `python3 -m http.server <port>` を1つだけ起動

## ドキュメント管理

許可: `docs/requirements.md` / `docs/SCOPE_PROGRESS.md` / `README.md` / `LICENSE.md`。他は要許諾。

## 品質ゲート

- 第一防壁: ローカル git hook（pre-commit: 秘密情報拒否＋JS構文）
- 最終防壁: GitHub Actions `verify`（JS構文・必須ファイル・index.htmlのリンク切れ）
- ブランチ: `main`＝公開 / `develop`＝編集
