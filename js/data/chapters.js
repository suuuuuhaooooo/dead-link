window.CHAPTERS = [
  { id: 1, code: 'CHAPTER 01', name: 'THE WEBSITE', goal: '找到網站主人最後一次「真正」更新網站的日期。',
    puzzles: ['p1'], unlocks: 'mail', unlockText: '電子郵件系統 mail.local' },
  { id: 2, code: 'CHAPTER 02', name: 'UNSENT MAIL', goal: '找出被隱藏的電子郵件。',
    puzzles: ['p2a', 'p2b'], unlocks: 'bbs', unlockText: '舊式論壇 bbs.local' },
  { id: 3, code: 'CHAPTER 03', name: 'DEAD FORUM', goal: '找出論壇中被刪除的使用者。',
    puzzles: ['p3c', 'p3a', 'p3b'], unlocks: 'chat', unlockText: '即時通訊 chat.local' },
  { id: 4, code: 'CHAPTER 04', name: 'OFFLINE', goal: '還原 Daniel 與 kei 最後一次對話。',
    puzzles: ['p4a', 'p4b', 'p4c'], unlocks: 'ftp', unlockText: '檔案伺服器 ftp.local' },
  { id: 5, code: 'CHAPTER 05', name: 'LOST FILES', goal: '找出網站最後一次備份。',
    puzzles: ['p5a', 'p5b', 'p5c'], unlocks: 'terminal', unlockText: '終端機 terminal.local' },
  { id: 6, code: 'CHAPTER 06', name: 'ROOT ACCESS', goal: '找出管理員帳號的登入憑證。',
    puzzles: ['p6a', 'p6b', 'p6f', 'p6d', 'p6e', 'p6c'], unlocks: null, unlockText: '管理員後台 admin.local 權限' },
  { id: 7, code: 'CHAPTER 07', name: 'THE LAST LOGIN', goal: '揭開網站停止更新的真正原因。',
    puzzles: ['p7a', 'p7b'], unlocks: null, unlockText: '' }
];

/* 網站在哪個謎題解開後才能連線（admin 在讀到 admin.txt 之後出現） */
window.SITE_GATES = { home: null, mail: null, bbs: 'p2b', chat: 'p3b', ftp: 'p4c', terminal: 'p5c', admin: 'p6b' };
