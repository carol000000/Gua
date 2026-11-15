以後要新增文章或筆記的步驟。

## 新增一篇文章

1. 在 `content/posts/` 新增一個 `.md` 檔，例如 `my-first-post.md`（檔名用英文、數字和 `-`）
2. 打開 `assets/js/site.js`，在 `posts` 最上面加一筆：

```js
{
  id: "my-first-post",        // 跟檔名一樣，不含 .md
  title: "我的第一篇文章",
  date: "2026-11-20",
  desc: "列表上顯示的一句話介紹",
  tags: ["心得", "Minecraft"],
},
```

3. 存檔、push，就會出現在「文章心得」和側欄裡。

## 新增一篇筆記

步驟一樣，只是放在 `content/notes/`，並且加在 `site.js` 的 `notes`。筆記多一個 `group`，會變成側欄裡的分類：

```js
{ id: "java-loop", title: "Java 迴圈", date: "2026-11-20", group: "Java" },
```

> [!NOTE]
> 標題會自動從 `site.js` 拿，所以 `.md` 裡**不用**再寫 `# 標題`，直接從內文開始寫。

## Markdown 常用語法

| 想要的效果 | 寫法 |
| --- | --- |
| 大標題（會出現在右邊目錄） | `## 標題` |
| 小標題 | `### 小標題` |
| 粗體 | `**粗體**` |
| 連結 | `[文字](https://網址)` |
| 圖片 | `![說明](/images/xxx.png)` |
| 行內程式碼 | `` `code` `` |

### 程式碼區塊

用三個反引號包起來，後面寫語言名稱就會有顏色：

```python
print("hello_word")
```

### 提示框

```md
> [!NOTE]
> 灰色，沒有小標

> [!TIP] 小技巧
> 藍色，「小技巧」是自己寫的小標

> [!SUCCESS]
> 綠色

> [!WARNING] 小心
> 橘色

> [!DANGER]
> 紅色
```

`[!...]` 後面同一行有寫字，就會變成粗體小標；沒寫就只有顏色。

> [!NOTE]
> 灰色，沒有小標

> [!TIP] 小技巧
> 藍色，「小技巧」是自己寫的小標

> [!SUCCESS]
> 綠色

> [!WARNING] 小心
> 橘色

> [!DANGER]
> 紅色

> [!WARNING]
> 在自己電腦上預覽時，要用本機伺服器開（例如在專案資料夾執行 `python -m http.server`，再打開 `http://localhost:8000`），直接雙擊 HTML 檔會讀不到文章。
