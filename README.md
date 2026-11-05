# PROJECT: DEAD LINK　死亡連結

復古網路恐怖解謎遊戲，全 7 章、20 道連鎖謎題、1 個主要結局，遊玩時間約 90～150 分鐘。

作者：[@suuuuuhaooooo（Threads）](https://www.threads.com/@suuuuuhaooooo)　·　[贊助作者](https://suuuuuhaooooo.bobaboba.me/)

## 部署
純靜態網頁，推到 GitHub Pages 即可（Settings → Pages → Branch: main / root）。本機也能直接雙擊 `index.html` 遊玩。

## 內容
| 章節 | 網站 | 謎題 |
|---|---|---|
| 01 THE WEBSITE | home.local | 1 |
| 02 UNSENT MAIL | mail.local | 2 |
| 03 DEAD FORUM | bbs.local | 3 |
| 04 OFFLINE | chat.local | 3 |
| 05 LOST FILES | ftp.local | 3 |
| 06 ROOT ACCESS | terminal.local / admin.local | 6（含 1 道隱藏） |
| 07 THE LAST LOGIN | admin.local | 2 |

## 網址設定（重要）
`index.html` 開頭的分享資訊（og:url、og:image、canonical）預設網址是
`https://suuuuuhaooooo.github.io/dead-link/`。如果 GitHub 帳號或 repo 名稱不同，請把 index.html 裡這個網址全部取代成實際網址，分享縮圖才會正確。

## 真實網址與分頁
- 遊戲內的網址會同步到瀏覽器真正的網址列，例如 `https://帳號.github.io/dead-link/home.local/diary`。
  重新整理或直接分享這個網址時，GitHub Pages 會回傳 `404.html`，它會把玩家送回遊戲的同一頁。瀏覽器真正的上一頁／下一頁也能用。
- 本機直接開檔案時改用 `index.html#/home.local/diary`。
- `home.local/` 資料夾裡有幾個真實的獨立小網頁（daniel、secret、b/kei、b/v1、原始照片），會在新分頁開啟，並透過 localStorage 通知遊戲主分頁。
- 根目錄的 `robots.txt` 是真的，裡面有給玩家的線索。
- 切到別的分頁時，遊戲分頁的標題和圖示會改變。

## 隱藏頁面
共 15 個，沒有任何連結指向它們，只能在網址列自己輸入。線索藏在 robots.txt、原始碼註解、錯誤頁與檔案內容裡。

## 技術
- 中文字型使用 GNU Unifont 子集（`assets/fonts/`），重現千禧年代的點陣字。
- 進度存在 LocalStorage（`deadlink.save.v1`），輸入錯誤不會失去進度。
- 音效由 Web Audio API 即時合成；照片由 canvas 即時繪製，不需要任何素材檔。
- 答案只存雜湊值，只能防止隨手偷看，無法防止破解。

## 結構
- `js/sites/` 七個虛構網站與錯誤頁
- `js/data/` 線索、章節、謎題資料
- `js/state.js` 存檔、`js/puzzle-engine.js` 驗證與提示、`js/router.js` 虛構網址解析、`js/app.js` 主程式與結局
- `css/mobile.css` 手機版排版
