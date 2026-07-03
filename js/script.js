// 取得畫面元素
const loaderScreen = document.getElementById("loader-screen");
const mainContent = document.getElementById("main-content");
// 是否已經顯示最終畫面
let isMainContentVisible = false;
// 網頁載入完成
window.addEventListener("DOMContentLoaded", () => {
    // Loading 畫面停留 2.5 秒
    setTimeout(() => {
        loaderScreen.style.display = "none";
        showFinalPage();
    }, 2500);
});
// 顯示最後的錯誤頁
function showFinalPage() {
    mainContent.style.display = "flex";
    // 下一幀再改 opacity，讓 transition 生效
    requestAnimationFrame(() => {
        mainContent.style.opacity = "1";
        isMainContentVisible = true;
    });
}
// 進入網站
function enter() {
    if (!isMainContentVisible) return;
    window.location.href = "html/Main.html";
}
// 點任何地方
document.body.addEventListener("click", enter);
// 按 Enter
document.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        enter();
    }
});