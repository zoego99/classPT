/* ============================================================
   p2.js — P2 課程 Prompt 頁邏輯
   ============================================================ */

/* ===== 狀態 ===== */
let currentSec = null;
const currentSub = {};   // 記錄每個章節目前的子項，章節 id 不限（s1…、u1… 皆可）

/* ===== 核心：切換章節 + 子項目 ===== */
function showSub(sec, sub) {
  const secEl = document.getElementById(sec);
  if (!secEl) return;   // 找不到章節就不動作，避免整支程式中斷

  // 1. 所有章節隱藏，只顯示目標章節
  document.querySelectorAll('.content-section').forEach(el => el.classList.remove('active'));
  secEl.classList.add('active');

  // 2. 第一層按鈕
  document.querySelectorAll('.sec-group-btn').forEach(b => b.classList.remove('active'));
  const secBtn = document.getElementById('btn-' + sec);
  if (secBtn) secBtn.classList.add('active');

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

/* ===== 點第一層章節鈕：跳到該章節目前（或第一個）子項 ===== */
function showSection(sec) {
  let sub = currentSub[sec];
  if (!sub) {
    const secEl = document.getElementById(sec);
    const first = secEl && secEl.querySelector('.sub-block[id]');
    sub = first ? first.id : sec + '-a';
  }
  showSub(sec, sub);
}

/* ===== 複製 Prompt（innerText 會抓到使用者編輯後的最新內容） ===== */
function copyPrompt(btn) {
  const code = btn.closest('.prompt-card').querySelector('.prompt-code').innerText.replace(/ /g, ' ');
  const done = () => {
    btn.textContent = '✓ 已複製';
    btn.classList.add('copied');
    setTimeout(() => { btn.textContent = '複製'; btn.classList.remove('copied'); }, 2000);
  };
  const fallback = () => {
    const ta = document.createElement('textarea');
    ta.value = code;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    done();
  };
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(code).then(done).catch(fallback);
  } else {
    fallback();
  }
}

/* ===== 讓所有 .prompt-code 可臨時編輯（不儲存，重新整理後還原） ===== */
function initEditablePrompts() {
  const probe = document.createElement('div');
  probe.contentEditable = 'plaintext-only';
  const supportsPlain = probe.contentEditable === 'plaintext-only';

  document.querySelectorAll('.prompt-code').forEach(el => {
    if (el.dataset.original !== undefined) return;   // 避免重複初始化
    el.dataset.original = el.innerText;
    el.setAttribute('contenteditable', supportsPlain ? 'plaintext-only' : 'true');
    el.setAttribute('spellcheck', 'false');
    el.title = '點擊即可直接修改內容';

    // 編輯中加上視覺提示 class
    el.addEventListener('focus', () => el.classList.add('editing'));
    el.addEventListener('blur', () => el.classList.remove('editing'));

    // 貼上時去除格式，避免帶入外部樣式（plaintext-only 模式瀏覽器已自動處理）
    if (!supportsPlain) {
      el.addEventListener('paste', (e) => {
        e.preventDefault();
        const text = (e.clipboardData || window.clipboardData).getData('text/plain');
        document.execCommand('insertText', false, text);
      });
    }

    // 「還原」按鈕 +「已修改」標示
    const card = el.closest('.prompt-card');
    if (!card) return;
    const copyBtn = card.querySelector('.copy-btn');
    if (copyBtn) {
      const reset = document.createElement('button');
      reset.type = 'button';
      reset.className = 'copy-btn reset-btn';
      reset.textContent = '還原';
      reset.addEventListener('click', () => {
        el.innerText = el.dataset.original;
        card.classList.remove('is-edited');
      });
      copyBtn.parentNode.insertBefore(reset, copyBtn);
    }
    el.addEventListener('input', () => {
      card.classList.toggle('is-edited', el.innerText !== el.dataset.original);
    });
  });
}

/* ===== 啟動：先啟用編輯，再顯示第一個章節 ===== */
document.addEventListener('DOMContentLoaded', () => {
  initEditablePrompts();
  if (!currentSec) {
    const first = document.querySelector('.content-section[id]');
    if (first) showSection(first.id);
  }
});
