/*
 * 漫畫與插圖清單
 * ------------------------------------------------------------
 * - 新增一話：在 chapters 最後加一筆 { title, date, pages: [...] }
 * - 新增插圖：在 illustrations 加一個圖片路徑
 */

// 產生 /comics/100.jpg ~ /comics/113.jpg 這種連續檔名
function comicPages(prefix, from, to, ext) {
  var out = [];
  for (var i = from; i <= to; i++) out.push(prefix + String(i).padStart(2, "0") + (ext || ".jpg"));
  return out;
}

window.COMICS = {
  title: "青呱的漫畫",
  desc: "國中時畫的漫畫。往下捲就能一直看下去。",
  cover: "/comics/100.jpg",

  chapters: [
    { title: "第 1 話", pages: comicPages("/comics/1", 0, 13) },
    { title: "第 2 話", pages: comicPages("/comics/2", 0, 13) },
    { title: "第 3 話", pages: comicPages("/comics/3", 0, 13) },
    { title: "第 4 話", pages: comicPages("/comics/4", 0, 13) },
    { title: "第 5 話", pages: comicPages("/comics/5", 0, 9) },
  ],

  illustrations: [
    "/images/a001.png", "/images/a002.png", "/images/a003.png", "/images/a004.png",
    "/images/a005.png", "/images/a006.png", "/images/a007.png", "/images/a008.png",
    "/images/a009.jpg", "/images/a010.png", "/images/a011.png", "/images/a012.png",
    "/images/a013.png", "/images/a014.png", "/images/a015.png", "/images/a016.png",
    "/images/mark.png",
  ],
};
