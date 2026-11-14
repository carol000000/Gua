/*
 * 全站設定（唯一需要常常改的 JS 檔）
 * ------------------------------------------------------------
 * - 新增文章：把 .md 放進 /content/posts/，再到下面 posts 加一筆
 * - 新增筆記：把 .md 放進 /content/notes/，再到下面 notes 加一筆
 *   （group 會變成側欄裡的分類）
 * - 新增「其他」頁面：在 nav 的「其他」children 加一筆
 */
window.SITE = {
  title: "青呱 GUA",
  logo: "/images/mark.png",
  repo: "https://github.com/carol000000/gua", // 用來產生「在 GitHub 上編輯」連結
  sidebarLimit: 5, // 側欄的「文章心得」最多列幾篇，其他的看「全部 N 篇」
  perPage: 10,     // 文章心得 / 筆記 列表一頁幾篇

  // 側欄 / 頂欄的順序
  nav: [
    { title: "首頁", href: "/" },
    { title: "朋友們", href: "/friends/" },
    { title: "文章心得", href: "/posts/", collection: "posts" },
    { title: "筆記", href: "/notes/", collection: "notes" },
    {
      title: "其他",
      href: "/other/",
      children: [
        { title: "圖片與漫畫", href: "/other/comics.html" },
        { title: "Discord Bot", href: "/other/dcbot.html" },
      ],
    },
  ],

  // 不在選單上的頁面，要讓側欄亮哪一項
  aliases: {
    "/other/comic.html": "/other/comics.html",
  },

  // 文章心得（新的放最上面）
  posts: [
    {
      id: "hello-blog",
      title: "呱",
      date: "2026-11-14",
      desc: "動機",
      tags: ["???"],
    },
  ],

  // 筆記（group = 側欄分類）
  notes: [
    {
      id: "how-to-write",
      title: "新增文章",
      date: "2026-11-14",
      desc: "新增文章的步驟。",
      group: "不知道丟哪",
    },
  ],
};
