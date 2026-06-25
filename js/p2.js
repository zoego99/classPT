/* ============================================================
   p2.js — P2 課程 Prompt 頁邏輯
   ============================================================ */

/* ===== 狀態 ===== */
let currentSec = 's1';
const currentSub = { s1: 's1-a', s2: 's2-a', s3: 's3-a', s4: 's4-a' };

/* ===== 核心：切換章節 + 子項目 ===== */
function showSub(sec, sub) {
  // 1. 所有章節隱藏，只顯示目標章節
  document.querySelectorAll('.content-section').forEach(el => el.classList.remove('active'));
  document.getElementById(sec).classList.add('active');

  // 2. 第一層按鈕
  document.querySelectorAll('.sec-group-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('btn-' + sec).classList.add('active');

  // 3. 第二層按鈕
  document.querySelectorAll('.sec-sub-btn').forEach(b => b.classList.remove('active'));
  const subBtn = document.getElementById('btn-' + sub);
  if (subBtn) subBtn.classList.add('active');

  // 4. 記錄狀態
  currentSec = sec;
  currentSub[sec] = sub;

  // 5. 捲動到子區塊（用 setTimeout 確保 DOM 已顯示再捲）
  setTimeout(() => {
    const el = document.getElementById(sub);
    const area = document.getElementById('contentArea');
    if (el && area) area.scrollTop = el.offsetTop - 12;
  }, 0);
}

/* ===== 點第一層章節鈕：跳到該章節的第一個子項 ===== */
function showSection(sec) {
  const sub = currentSub[sec] || (sec + '-a');
  showSub(sec, sub);
}

/* ===== 複製 Prompt（支援臨時編輯後複製，innerText 會抓到使用者編輯後的最新內容） ===== */
function copyPrompt(btn) {
  const code = btn.closest('.prompt-card').querySelector('.prompt-code').innerText;
  navigator.clipboard.writeText(code).then(() => {
    btn.textContent = '✓ 已複製';
    btn.classList.add('copied');
    setTimeout(() => { btn.textContent = '複製'; btn.classList.remove('copied'); }, 2000);
  }).catch(() => {
    const ta = document.createElement('textarea');
    ta.value = code;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    btn.textContent = '✓ 已複製';
    btn.classList.add('copied');
    setTimeout(() => { btn.textContent = '複製'; btn.classList.remove('copied'); }, 2000);
  });
}

/* ===== 啟動：預設顯示 s1-a ===== */
document.addEventListener('DOMContentLoaded', () => {
  showSub('s1', 's1-a');
  initEditablePrompts();
});

/* ===== 讓所有 .prompt-code 可臨時編輯（不儲存，重新整理後還原） ===== */
function initEditablePrompts() {
  document.querySelectorAll('.prompt-code').forEach(el => {
    el.setAttribute('contenteditable', 'true');
    el.setAttribute('spellcheck', 'false');

    // 編輯中加上視覺提示 class
    el.addEventListener('focus', () => el.classList.add('editing'));
    el.addEventListener('blur', () => el.classList.remove('editing'));

    // 貼上時去除格式，避免帶入外部樣式
    el.addEventListener('paste', (e) => {
      e.preventDefault();
      const text = (e.clipboardData || window.clipboardData).getData('text/plain');
      document.execCommand('insertText', false, text);
    });
  });
}
