# そらいろキャッチ

上から落ちてくるボールを、カゴでキャッチするブラウザゲームです。3回落とすとゲーム終了。キャッチするほど少しずつ難しくなります。ベストスコアは同じブラウザに保存します。

## 遊び方

`index.html` をブラウザで開き、「あそぶ」を押してください。インストールやビルドは不要です。

- スマートフォン：ゲーム画面を指でスライド、または左右ボタンを長押し。
- パソコン：左右の矢印キー、画面のドラッグ、または左右ボタン。

## ローカルサーバー

Python がある場合は、このディレクトリで `python3 -m http.server 8000` を実行してブラウザから確認できます。

## GitHub に保存・公開

このディレクトリの `index.html`、`style.css`、`game.js`、`README.md` を `hirocoppa/my-first-project` にコミットしてプッシュしてください。ブランチ名が `work` の場合の例：

```sh
git add index.html style.css game.js README.md
git commit -m "Add mobile-friendly ball catch game"
git push -u origin work
```

Webで公開する場合はGitHubリポジトリの **Settings → Pages → Deploy from a branch** から、保存したブランチと `/(root)` を選びます。`main` にマージした場合は `main` を選んでください。

外部ライブラリ・画像・フォント・APIキーは使用していません。
