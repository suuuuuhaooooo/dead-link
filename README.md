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

## 技術
- 進度存在 LocalStorage（`deadlink.save.v1`），輸入錯誤不會失去進度。
- 音效由 Web Audio API 即時合成；照片由 canvas 即時繪製，不需要任何素材檔。
- 答案只存雜湊值，只能防止隨手偷看，無法防止破解。

## 結構
- `js/sites/` 七個虛構網站與錯誤頁
- `js/data/` 線索、章節、謎題資料
- `js/state.js` 存檔、`js/puzzle-engine.js` 驗證與提示、`js/router.js` 虛構網址解析、`js/app.js` 主程式與結局
- `css/mobile.css` 手機版排版
