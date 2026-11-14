# GUA

青呱的個人網站 → https://guatw.net

## 資料夾

```
index.html            首頁（自介 + 入口）
friends/              朋友們
posts/                文章心得列表
notes/                筆記列表
other/                其他（圖片與漫畫、Discord Bot）
other/comic.html      漫畫閱讀頁（?ch=1 第幾話）
read.html             文章 / 筆記的閱讀頁（讀取 content/ 裡的 .md）
404.html              找不到頁面＋舊網址轉址

content/posts/*.md    文章內容
content/notes/*.md    筆記內容

assets/js/site.js     * 網站設定：選單、文章清單、筆記清單
assets/js/layout.js   自動產生頂欄 / 側欄 / 本頁目錄 / 上下頁
assets/js/reader.js   Markdown 轉 HTML
assets/js/comics.js   * 漫畫章節和插圖清單
assets/css/docs.css   全站唯一的樣式

images/  comics/      圖片
html/gua.html, html/abc.html   彩蛋
```

## 新增文章

1. 在 `content/posts/` 放一個 `xxx.md`
2. 在 `assets/js/site.js` 的 `posts` 加一筆 `{ id: "xxx", title, date, desc, tags }`

筆記一樣，放 `content/notes/`、加在 `notes`，多一個 `group` 當分類。

## 新增一般頁面

複製任何一個現有頁面（例如 `other/dcbot.html`），只改 `<main class="doc">` 裡面的內容，
再到 `site.js` 的 `nav` 加上連結即可。

## 本機預覽

```sh
python -m http.server 8000
# 打開 http://localhost:8000
```
