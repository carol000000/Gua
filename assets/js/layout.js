/*
 * 全站版型：自動產生 頂欄 / 側欄 / 本頁目錄 / 上下篇
 * 每個頁面只要：
 *   <script src="/assets/js/site.js"></script>
 *   <script src="/assets/js/layout.js"></script>
 *   <main class="doc"> ...內容... </main>
 */
(function () {
  "use strict";

  /* ---------- 主題（淺色 / 深色） ---------- */
  var THEME_KEY = "gua-theme";
  function loadTheme() {
    try { return localStorage.getItem(THEME_KEY); } catch (e) { return null; }
  }
  function saveTheme(v) {
    try { localStorage.setItem(THEME_KEY, v); } catch (e) { /* 忽略 */ }
  }
  var saved = loadTheme();
  if (saved === "light" || saved === "dark") {
    document.documentElement.setAttribute("data-theme", saved);
  }
  function isDark() {
    var t = document.documentElement.getAttribute("data-theme");
    if (t) return t === "dark";
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  }

  var SITE = window.SITE || { title: "", nav: [] };
  var GUA = (window.GUA = {});

  /* ---------- 小工具 ---------- */
  GUA.esc = function (s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  };
  GUA.readUrl = function (collection, id) {
    return "/read.html?c=" + collection + "&id=" + encodeURIComponent(id);
  };
  GUA.find = function (collection, id) {
    var list = SITE[collection] || [];
    for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
    return null;
  };

  // 依 group 分組，保留第一次出現的順序
  GUA.grouped = function (list) {
    var groups = [], map = {};
    list.forEach(function (item) {
      var g = item.group || "";
      if (!map[g]) { map[g] = { name: g, items: [] }; groups.push(map[g]); }
      map[g].items.push(item);
    });
    return groups;
  };

  function keyOf(href) {
    var a = document.createElement("a");
    a.href = href;
    if (/\/read\.html$/.test(a.pathname)) {
      var p = new URLSearchParams(a.search);
      return "read:" + p.get("c") + ":" + p.get("id");
    }
    return a.pathname.replace(/index\.html$/, "");
  }
  var currentKey = keyOf(location.href);
  currentKey = (SITE.aliases || {})[currentKey] || currentKey;

  // 把 nav 攤平成一串，用來找「上一頁 / 下一頁」
  function flatten() {
    var out = [];
    SITE.nav.forEach(function (item) {
      out.push({ title: item.title, href: item.href });
      if (item.collection) {
        var raw = SITE[item.collection] || [];
        var hasGroups = raw.some(function (it) { return it.group; });
        GUA.grouped(hasGroups ? raw : GUA.sorted(item.collection)).forEach(function (g) {
          g.items.forEach(function (it) {
            out.push({ title: it.title, href: GUA.readUrl(item.collection, it.id) });
          });
        });
      }
      (item.children || []).forEach(function (c) { out.push({ title: c.title, href: c.href }); });
    });
    return out;
  }

  // 目前頁面屬於哪個大分類（頂欄高亮用）
  function sectionOf(item) {
    if (keyOf(item.href) === currentKey) return true;
    if (item.collection && currentKey.indexOf("read:" + item.collection + ":") === 0) return true;
    if (item.href !== "/" && currentKey.indexOf(item.href) === 0) return true;
    return (item.children || []).some(function (c) { return keyOf(c.href) === currentKey; });
  }

  function link(title, href, cls) {
    var active = keyOf(href) === currentKey;
    return '<a class="' + (cls || "") + (active ? " active" : "") + '" href="' + GUA.esc(href) + '"' +
      (active ? ' aria-current="page"' : "") + ">" + GUA.esc(title) + "</a>";
  }

  /* ---------- 頂欄 ---------- */
  function buildTopbar() {
    var links = SITE.nav.map(function (item) {
      var on = item.href === "/" ? currentKey === "/" : sectionOf(item);
      return '<a class="top-link' + (on ? " active" : "") + '" href="' + item.href + '">' + GUA.esc(item.title) + "</a>";
    }).join("");
    var bar = document.createElement("header");
    bar.className = "topbar";
    bar.innerHTML =
      '<button class="icon-btn menu-btn" type="button" aria-label="開啟選單">' +
        '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>' +
      "</button>" +
      '<a class="brand" href="/"><img src="' + SITE.logo + '" alt="">' + GUA.esc(SITE.title) + "</a>" +
      '<nav class="top-links" aria-label="主要分類">' + links + "</nav>" +
      '<button class="icon-btn theme-btn" type="button" aria-label="切換深色模式"></button>';
    return bar;
  }

  /* ---------- 側欄 ---------- */
  function buildSidebar() {
    var html = SITE.nav.map(function (item) {
      var s = '<div class="sb-group' + (sectionOf(item) ? " open" : "") + '">' + link(item.title, item.href, "sb-title");
      var sub = "";
      var c = item.collection;
      var isCur = function (it) { return currentKey === "read:" + c + ":" + it.id; };
      var li = function (it) { return "<li>" + link(it.title, GUA.readUrl(c, it.id), "sb-link") + "</li>"; };
      var all = c ? GUA.sorted(c) : [];
      if (c && all.some(function (it) { return it.group; })) {
        // 有分類（筆記）：每個分類可以收合，只展開目前這篇所在的分類
        GUA.grouped(SITE[c] || []).forEach(function (g) {
          var open = g.items.some(isCur);
          sub += '<li><details class="sb-fold"' + (open ? " open" : "") + "><summary>" +
            GUA.esc(g.name || "未分類") + '<span class="sb-count">' + g.items.length + "</span></summary><ul>" +
            g.items.map(li).join("") + "</ul></details></li>";
        });
      } else if (c) {
        // 沒分類（文章）：只列最新幾篇，太多就顯示「全部 N 篇」
        var limit = SITE.sidebarLimit || 5;
        var shown = all.slice(0, limit);
        var cur = all.filter(isCur)[0];
        if (cur && shown.indexOf(cur) < 0) shown.push(cur);
        sub += shown.map(li).join("");
        if (all.length > limit) {
          sub += '<li><a class="sb-link sb-more" href="' + item.href + '">全部 ' + all.length + " 篇 →</a></li>";
        }
      }
      (item.children || []).forEach(function (c) {
        sub += "<li>" + link(c.title, c.href, "sb-link") + "</li>";
      });
      if (sub) s += "<ul>" + sub + "</ul>";
      return s + "</div>";
    }).join("");
    var nav = document.createElement("nav");
    nav.className = "sidebar";
    nav.setAttribute("aria-label", "網站目錄");
    nav.innerHTML = html;
    return nav;
  }

  /* ---------- 本頁目錄 + 標題錨點 ---------- */
  function slug(text) {
    return text.trim().toLowerCase().replace(/[\s　]+/g, "-").replace(/[^\wÀ-￿-]/g, "") || "section";
  }

  var tocEl, spyHeadings = [];
  GUA.refresh = function () {
    var main = document.querySelector("main.doc");
    if (!main || !tocEl) return;
    var used = {};
    var heads = Array.prototype.slice.call(main.querySelectorAll("h2, h3")).filter(function (h) {
      return !h.closest(".no-toc");
    });
    heads.forEach(function (h) {
      if (!h.id) {
        var base = slug(h.textContent), id = base, n = 2;
        while (used[id] || document.getElementById(id)) id = base + "-" + n++;
        h.id = id;
      }
      used[h.id] = true;
      if (!h.querySelector(".anchor")) {
        var a = document.createElement("a");
        a.className = "anchor";
        a.href = "#" + h.id;
        a.setAttribute("aria-label", "連結到此段");
        a.textContent = "#";
        h.appendChild(a);
      }
    });
    spyHeadings = heads;
    if (heads.length < 2) {
      tocEl.hidden = true;
      return;
    }
    tocEl.hidden = false;
    tocEl.innerHTML = '<p class="toc-title">本頁目錄</p><ul>' + heads.map(function (h) {
      var text = h.textContent.replace(/#$/, "");
      return '<li class="toc-' + h.tagName.toLowerCase() + '"><a href="#' + encodeURIComponent(h.id) + '" data-id="' + GUA.esc(h.id) + '">' + GUA.esc(text) + "</a></li>";
    }).join("") + "</ul>";
    spy();
  };

  function spy() {
    if (!tocEl || tocEl.hidden) return;
    var cur = null;
    spyHeadings.forEach(function (h) {
      if (h.getBoundingClientRect().top < 110) cur = h.id;
    });
    if (!cur && spyHeadings[0]) cur = spyHeadings[0].id;
    Array.prototype.forEach.call(tocEl.querySelectorAll("a"), function (a) {
      a.classList.toggle("active", a.getAttribute("data-id") === cur);
    });
  }

  /* ---------- 上一頁 / 下一頁 ---------- */
  function buildPager() {
    var flat = flatten(), idx = -1;
    flat.forEach(function (f, i) { if (keyOf(f.href) === currentKey) idx = i; });
    var el = document.createElement("nav");
    el.className = "pager";
    el.setAttribute("aria-label", "上一頁與下一頁");
    if (idx < 0) return el;
    var prev = flat[idx - 1], next = flat[idx + 1];
    el.innerHTML =
      (prev ? '<a class="pager-prev" href="' + GUA.esc(prev.href) + '"><span>上一頁</span>' + GUA.esc(prev.title) + "</a>" : "<span></span>") +
      (next ? '<a class="pager-next" href="' + GUA.esc(next.href) + '"><span>下一頁</span>' + GUA.esc(next.title) + "</a>" : "<span></span>");
    return el;
  }

  // 依日期新到舊排序（日期一樣就照 site.js 裡的順序）
  GUA.sorted = function (collection) {
    return (SITE[collection] || [])
      .map(function (it, i) { return { it: it, i: i }; })
      .sort(function (a, b) { return String(b.it.date || "").localeCompare(String(a.it.date || "")) || a.i - b.i; })
      .map(function (x) { return x.it; });
  };

  /* ---------- 文章列表（文章心得 / 筆記）：搜尋 + 篩選 + 分頁 ---------- */
  GUA.renderList = function (target, collection, opts) {
    opts = opts || {};
    var el = typeof target === "string" ? document.querySelector(target) : target;
    if (!el) return;
    var all = GUA.sorted(collection);
    if (!all.length) {
      el.innerHTML = '<p class="empty">這裡還空空的，之後會慢慢補上。</p>';
      return;
    }
    var perPage = opts.perPage || SITE.perPage || 10;
    var byGroup = all.some(function (it) { return it.group; }); // 筆記用分類篩選，文章用標籤
    var filters = [];
    all.forEach(function (it) {
      (byGroup ? [it.group || "未分類"] : it.tags || []).forEach(function (f) {
        if (filters.indexOf(f) < 0) filters.push(f);
      });
    });

    // 狀態放在網址上（?q=&f=&page=），重新整理或上一頁都會保留
    var params = new URLSearchParams(location.search);
    var state = { q: params.get("q") || "", f: params.get("f") || "", page: parseInt(params.get("page"), 10) || 1 };
    if (filters.indexOf(state.f) < 0) state.f = "";

    el.innerHTML =
      '<div class="list-tools">' +
        '<input class="list-search" type="search" placeholder="搜尋標題或介紹…" aria-label="搜尋">' +
        (filters.length > 1
          ? '<div class="list-filters" role="group" aria-label="' + (byGroup ? "分類" : "標籤") + '">' +
              ['<button type="button" data-f="">全部</button>'].concat(filters.map(function (f) {
                return '<button type="button" data-f="' + GUA.esc(f) + '">' + GUA.esc(f) + "</button>";
              })).join("") + "</div>"
          : "") +
      "</div>" +
      '<p class="list-count"></p><ul class="entry-list"></ul><nav class="pagination" aria-label="分頁"></nav>';
    var input = el.querySelector(".list-search");
    var ul = el.querySelector(".entry-list");
    var count = el.querySelector(".list-count");
    var nav = el.querySelector(".pagination");
    input.value = state.q;

    function item(it) {
      var tags = (it.tags || []).map(function (t) { return '<span class="tag">' + GUA.esc(t) + "</span>"; }).join("");
      return '<li><a class="entry" href="' + GUA.readUrl(collection, it.id) + '">' +
        '<span class="entry-meta">' + GUA.esc(it.date || "") + (it.group ? " · " + GUA.esc(it.group) : "") + "</span>" +
        '<span class="entry-title">' + GUA.esc(it.title) + "</span>" +
        (it.desc ? '<span class="entry-desc">' + GUA.esc(it.desc) + "</span>" : "") +
        (tags ? '<span class="entry-tags">' + tags + "</span>" : "") +
        "</a></li>";
    }

    // 頁碼太多時中間用 … 省略
    function pageList(cur, total) {
      var out = [];
      for (var i = 1; i <= total; i++) {
        if (i === 1 || i === total || Math.abs(i - cur) <= 1) out.push(i);
        else if (out[out.length - 1] !== "…") out.push("…");
      }
      return out;
    }

    function render(scroll) {
      var q = state.q.trim().toLowerCase();
      var list = all.filter(function (it) {
        var fs = byGroup ? [it.group || "未分類"] : it.tags || [];
        if (state.f && fs.indexOf(state.f) < 0) return false;
        if (!q) return true;
        return [it.title, it.desc, (it.tags || []).join(" "), it.group].join(" ").toLowerCase().indexOf(q) >= 0;
      });
      var pages = Math.max(1, Math.ceil(list.length / perPage));
      state.page = Math.min(Math.max(1, state.page), pages);
      var start = (state.page - 1) * perPage;

      ul.innerHTML = list.slice(start, start + perPage).map(item).join("") ||
        '<li class="empty">找不到符合的' + (collection === "notes" ? "筆記" : "文章") + "。</li>";
      count.textContent = "共 " + list.length + " 篇" + (pages > 1 ? "・第 " + state.page + " / " + pages + " 頁" : "");
      Array.prototype.forEach.call(el.querySelectorAll(".list-filters button"), function (b) {
        b.setAttribute("aria-pressed", String(b.getAttribute("data-f") === state.f));
      });

      nav.innerHTML = pages > 1
        ? '<button type="button" data-p="' + (state.page - 1) + '"' + (state.page === 1 ? " disabled" : "") + ">← 上一頁</button>" +
          pageList(state.page, pages).map(function (p) {
            return p === "…" ? '<span class="gap">…</span>'
              : '<button type="button" data-p="' + p + '"' + (p === state.page ? ' aria-current="page"' : "") + ">" + p + "</button>";
          }).join("") +
          '<button type="button" data-p="' + (state.page + 1) + '"' + (state.page === pages ? " disabled" : "") + ">下一頁 →</button>"
        : "";

      var p = new URLSearchParams();
      if (state.q) p.set("q", state.q);
      if (state.f) p.set("f", state.f);
      if (state.page > 1) p.set("page", state.page);
      var qs = p.toString();
      history.replaceState(null, "", location.pathname + (qs ? "?" + qs : ""));
      if (scroll) el.scrollIntoView({ block: "start" });
    }

    input.addEventListener("input", function () { state.q = input.value; state.page = 1; render(); });
    el.addEventListener("click", function (e) {
      var b = e.target.closest("button");
      if (!b || b.disabled) return;
      if (b.hasAttribute("data-f")) { state.f = b.getAttribute("data-f"); state.page = 1; render(); }
      else if (b.hasAttribute("data-p")) { state.page = Number(b.getAttribute("data-p")); render(true); }
    });
    render();
  };

  // 首頁「最近更新」：混合文章和筆記，依日期排序
  GUA.renderRecent = function (target, limit) {
    var el = document.querySelector(target);
    if (!el) return;
    var all = [];
    ["posts", "notes"].forEach(function (c) {
      (SITE[c] || []).forEach(function (it) { all.push({ it: it, c: c }); });
    });
    all.sort(function (a, b) { return String(b.it.date).localeCompare(String(a.it.date)); });
    all = all.slice(0, limit || 5);
    var label = { posts: "文章心得", notes: "筆記" };
    el.innerHTML = all.length
      ? '<ul class="recent">' + all.map(function (x) {
          return '<li><a href="' + GUA.readUrl(x.c, x.it.id) + '"><span class="recent-kind">' + label[x.c] +
            "</span>" + GUA.esc(x.it.title) + '<time>' + GUA.esc(x.it.date || "") + "</time></a></li>";
        }).join("") + "</ul>"
      : '<p class="empty">還沒有任何文章。</p>';
  };

  /* ---------- 組裝 ---------- */
  function init() {
    var main = document.querySelector("main.doc");
    if (!main) return;
    var body = document.body;

    var topbar = buildTopbar();
    var sidebar = buildSidebar();
    var overlay = document.createElement("div");
    overlay.className = "overlay";

    var shell = document.createElement("div");
    shell.className = "shell";
    var page = document.createElement("div");
    page.className = "page";
    tocEl = document.createElement("aside");
    tocEl.className = "toc";
    tocEl.hidden = true;

    var footer = document.createElement("footer");
    footer.className = "site-footer";
    footer.innerHTML = "© " + new Date().getFullYear() + " " + GUA.esc(SITE.title) +
      (SITE.repo ? ' · <a href="' + SITE.repo + '" target="_blank" rel="noopener">GitHub</a>' : "");

    main.parentNode.insertBefore(shell, main);
    page.appendChild(main);
    page.appendChild(buildPager());
    page.appendChild(footer);
    shell.appendChild(sidebar);
    shell.appendChild(page);
    shell.appendChild(tocEl);
    body.insertBefore(overlay, shell);
    body.insertBefore(topbar, overlay);
    if (main.classList.contains("wide")) shell.classList.add("is-wide");

    // 手機版側欄
    function closeNav() { body.classList.remove("nav-open"); }
    topbar.querySelector(".menu-btn").addEventListener("click", function () {
      body.classList.toggle("nav-open");
    });
    overlay.addEventListener("click", closeNav);
    sidebar.addEventListener("click", function (e) { if (e.target.closest("a")) closeNav(); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeNav(); });

    // 深色模式按鈕
    var themeBtn = topbar.querySelector(".theme-btn");
    var SUN = '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><circle cx="12" cy="12" r="4.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
    var MOON = '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>';
    function paintTheme() { themeBtn.innerHTML = isDark() ? SUN : MOON; }
    paintTheme();
    themeBtn.addEventListener("click", function () {
      var next = isDark() ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      saveTheme(next);
      paintTheme();
    });

    GUA.refresh();
    var ticking = false;
    window.addEventListener("scroll", function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () { spy(); ticking = false; });
    }, { passive: true });

    // 有 #錨點 時，版型建好後再捲一次
    if (location.hash) {
      var t = document.getElementById(decodeURIComponent(location.hash.slice(1)));
      if (t) t.scrollIntoView();
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
