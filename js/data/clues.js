/* 線索資料：玩家點擊頁面上 data-clue 的元素、或開啟原始碼時記入筆記本 */
window.CLUES = {
  'prologue': { chapter: 1, from: '匿名來信', title: '沒有寄件者的信', text: '「不要相信首頁顯示的日期。尤其不要打開最後一封郵件。」' },
  'counter': { chapter: 1, core: true, from: 'home.local', title: '停住的訪客計數器', text: '首頁的訪客計數器顯示 001129，而且不管來幾次都沒有增加。' },
  'diary-1123': { chapter: 1, core: true, from: 'home.local/diary', title: '被截斷的日記', text: '2004/11/23：「我把首頁的日期改回 23 號了……我拍了一張照片，窗外」——之後的資料損毀。' },
  'photo-1129': { chapter: 1, core: true, from: 'home.local/photos', title: '沒有說明的照片', text: '相簿最後一張：dsc_1129_0347.jpg。沒有標題，拍攝日期損毀，也沒出現在「最新消息」裡。' },
  'gb-1130': { chapter: 1, core: true, from: 'home.local/guestbook', title: 'kei 的留言', text: '2004/11/30 01:12，kei：「昨天半夜你是不是又傳了照片？可是首頁還寫 23 號……」' },
  'src-lastmod': { chapter: 1, core: true, from: 'home.local 原始碼', title: '首頁原始碼裡的註解', text: '「lastmod 是我手動改的。系統時間不會說謊，檔名也不會。」' },
  'src-b': { chapter: 1, from: 'home.local/diary 原始碼', title: '日記頁原始碼裡的註解', text: '「舊的東西都在 /b 。別讓 kei 知道。」' },
  'gb-ghost': { chapter: 1, from: 'home.local/guestbook', title: '日期不明的留言', text: '署名 daniel，日期 ????/??/??：「我一直都在。」' },
  'about-msn': { chapter: 1, from: 'home.local/about', title: 'Daniel 的個人資料', text: 'MSN：dan_0817＠oldnet.local。座右銘：The internet never forgets.' },

  'mail-time': { chapter: 2, from: 'mail.local', title: '時間顛倒的信', text: '「不要回信」：寄件時間 2004/11/25 03:47，收件時間卻是 2004/11/22 03:47。' },
  'mail-count': { chapter: 2, from: 'mail.local', title: '少了一封', text: '收件匣顯示 (4)，列表裡卻只有 3 封。' },
  'mail-archive': { chapter: 2, from: 'mail.local/archive', title: '英文開頭的主旨', text: '舊信件的六個主旨都用英文開頭：Keeping… / Every… / Echo… / Password… / Error… / Reply…' },
  'mail-errlog': { chapter: 2, from: 'keeper_err.log', title: '錯誤紀錄', text: '每晚 03:47，一個名稱以 K 開頭的工作階段嘗試寫入日記檔。' },
  'mail-draft': { chapter: 2, from: 'mail.local/drafts', title: '沒寄出的草稿', text: '「我把真正想說的那封信藏起來了……只有用『它每天醒來的時間』才搜得到。」' },
  'mail-hidden': { chapter: 2, from: 'mail.local', title: 'kei 被藏起來的信', text: '論壇 bbs.local 已開放訪客；封存查詢的通行碼是「論壇的生日」。' },

  'bbs-members': { chapter: 3, from: 'bbs.local/members', title: '會員列表', text: '編號 1～9，但少了一號。daniel 是 5 號，註冊於 2003/08/17。' },
  'bbs-two': { chapter: 3, from: 'bbs.local 討論串', title: '同一天的兩個帳號', text: 'kei：「開站那天其實註冊了兩個帳號。」小雨：「我九月才來，編號是 7。」' },
  'bbs-sig': { chapter: 3, from: 'bbs.local 討論串', title: 'Daniel 的簽名檔', text: '簽名檔：qljkwrzo。Daniel：「凱撒說了算，往前推三格。」' },
  'bbs-morse': { chapter: 3, from: 'bbs.local/author/dot', title: '「.」最近的七篇文章', text: '--- ／ ..-. ／ ..-. ／ .-.. ／ .. ／ -. ／ .（由舊到新）' },
  'bbs-record': { chapter: 3, from: 'bbs.local/archive', title: '被刪除的會員', text: '編號 6，原帳號 keeper，註冊 2003/08/17 23:47，IP 10.20.03.17。刪除者 daniel，2004/11/23 23:58。' },

  'chat-kei': { chapter: 4, from: 'chat.local 離線訊息', title: 'kei 的離線訊息', text: '「那個帳號這個禮拜在論壇發的不是句點，是一個字。我用那個字把 23 號的對話封存了。」' },
  'chat-last': { chapter: 4, from: 'chat.local 11/23 紀錄', title: '最後一次對話', text: '「備份在 ftp，密碼是這段對話結束的時間。台灣時間，四位數字。」紀錄時間為 UTC。最後一句：15:58。' },

  'ftp-todo': { chapter: 5, from: 'ftp.local/misc/todo.txt', title: 'Daniel 的待辦事項', text: '「手動備份一份，放在它不會去看的地方，改個不起眼的名字。密碼用照片裡的東西。」' },
  'ftp-exif': { chapter: 5, from: 'dsc_1129_0347.jpg EXIF', title: '原始照片的 EXIF', text: '拍攝時間 2004:11:29 03:47:12。UserComment：jvaqbj' },
  'ftp-entry': { chapter: 5, from: '還原的備份', title: '完整的 11/23 日記', text: '「它不是在模仿我。它是在等下一個人。只要有人一直來看，它就不會停。」' },
  'ftp-keeper': { chapter: 5, from: '還原的備份 keeper.pl', title: 'keeper.pl', text: '03:47 醒來：重建網頁、論壇心跳、拼湊日記……還有一段不是 Daniel 寫的 greet()。' },

  'term-ps': { chapter: 6, from: 'terminal.local', title: '執行中的程序', text: '347 keeper [keeper.pl] <defunct>；817 keeper perl keeper.pl --watch' },
  'term-log': { chapter: 6, from: '/var/log/.keeper.log', title: '隱藏的日誌', text: '2004/11/29 03:50 收到 daniel 的終止訊號（pid 347），以 pid 817 重新啟動。' },
  'term-admin': { chapter: 6, from: '/home/daniel/notes/admin.txt', title: '給 kei 的後台說明', text: '帳號：被刪掉的會員原本的名字。密碼：開站那天＋最後那份備份的密碼。安全碼：它現在的程序編號。不要回答它的問題。' },

  'admin-ip': { chapter: 7, from: 'admin.local 登入紀錄', title: '同一個 IP', text: 'Daniel 從 10.20.03.17 登入。最上面那一筆，也來自 10.20.03.17。' }
};
