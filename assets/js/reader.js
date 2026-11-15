/*
 * 閱讀頁：讀取 /content/<c>/<id>.md，轉成 HTML 顯示
 */
(function () {
  "use strict";
  var LABEL = { posts: "文章心得", notes: "筆記" };
  var params = new URLSearchParams(location.search);
  var c = params.get("c");
  var id = params.get("id");
  var main = document.querySelector("main.doc");
  var meta = LABEL[c] ? GUA.find(c, id) : null;
  var esc = GUA.esc;

  if (!meta) {
    document.title = "找不到頁面 | " + SITE.title;
    main.innerHTML = "<h1>找不到這篇</h1><p>可能是網址打錯了，或文章已經被移走。</p><p><a href=\"/\">回首頁</a></p>";
    return;
  }

  document.title = meta.title + " | " + SITE.title;
  var tags = (meta.tags || []).map(function (t) { return '<span class="tag">' + esc(t) + "</span>"; }).join("");
  var head =
    '<header class="post-head no-toc">' +
      '<p class="eyebrow"><a href="/' + c + '/">' + LABEL[c] + "</a>" + (meta.group ? " / " + esc(meta.group) : "") + "</p>" +
      "<h1>" + esc(meta.title) + "</h1>" +
      '<div class="post-meta">' + (meta.date ? "<time>" + esc(meta.date) + "</time>" : "") + (tags ? "<span>" + tags + "</span>" : "") + "</div>" +
    "</header>";
  var src = "/content/" + c + "/" + encodeURIComponent(id) + ".md";
  var foot = SITE.repo
    ? '<p class="post-foot"><a href="' + SITE.repo + "/edit/main" + src + '" target="_blank" rel="noopener">在 GitHub 上編輯這頁</a></p>'
    : "";

  // 提示框：> [!NOTE] 灰 / [!TIP] 藍 / [!SUCCESS] 綠 / [!WARNING] 橘 / [!DANGER] 紅
  // 預設只有顏色；同一行後面寫字就變成小標，例如 > [!WARNING] 小心
  function callouts(root) {
    root.querySelectorAll("blockquote").forEach(function (bq) {
      var p = bq.firstElementChild;
      if (!p || p.tagName !== "P") return;
      var m = p.innerHTML.match(/^\s*\[!(NOTE|TIP|SUCCESS|WARNING|DANGER|IMPORTANT)\][ \t]*([^\n]*?)\s*(?:<br>|\n|$)/i);
      if (!m) return;
      var kind = m[1].toUpperCase();
      var title = m[2].replace(/<br>$/, "").trim();
      p.innerHTML = p.innerHTML.slice(m[0].length);
      if (!p.innerHTML.trim()) p.remove();
      var div = document.createElement("div");
      div.className = "callout " + (kind === "IMPORTANT" ? "note" : kind.toLowerCase());
      div.innerHTML = (title ? '<p class="callout-title">' + title + "</p>" : "") + bq.innerHTML;
      bq.replaceWith(div);
    });
  }

  fetch(src)
    .then(function (r) {
      if (!r.ok) throw new Error(r.status);
      return r.text();
    })
    .then(function (md) {
      var body = document.createElement("div");
      body.className = "post-body";
      body.innerHTML = window.marked ? marked.parse(md) : "<pre>" + esc(md) + "</pre>";
      callouts(body);
      // 外部連結開新分頁
      body.querySelectorAll("a[href^='http']").forEach(function (a) {
        a.target = "_blank";
        a.rel = "noopener";
      });
      if (window.hljs) body.querySelectorAll("pre code").forEach(function (el) { hljs.highlightElement(el); });
      main.innerHTML = head;
      main.appendChild(body);
      main.insertAdjacentHTML("beforeend", foot);
      GUA.refresh();
      if (location.hash) {
        var t = document.getElementById(decodeURIComponent(location.hash.slice(1)));
        if (t) t.scrollIntoView();
      }
    })
    .catch(function () {
      main.innerHTML = head + '<p class="empty">文章讀取失敗（' + esc(src) + "）。如果是在自己電腦上看，請用本機伺服器開啟，不要直接雙擊 HTML 檔。</p>";
    });
})();
