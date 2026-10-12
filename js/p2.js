/* ============================================================
   p2.js — P2 課程 Prompt 頁邏輯
   ============================================================ */

/* ===== 狀態 ===== */
let currentSec = null;
let spyLock = false;     // 程式自動捲動時，暫停「捲動偵測」
const currentSub = {};   // 記錄每個章節目前的子項，章節 id 不限（s1…、u1… 皆可）

/* ===== 核心：切換章節 + 子項目 ===== */
function showSub(sec, sub) {
  const secEl = document.getElementById(sec);
  if (!secEl) return;   // 找不到章節就不動作，避免整支程式中斷
  spyLock = true;       // 切換期間暫停捲動偵測，避免切章節時按鈕亮錯

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

  // 3-1. 展開目前章節的子選單（只展開，不收合其他章節）
  openGroup(sec);

  // 4. 記錄狀態
  currentSec = sec;
  currentSub[sec] = sub;

  // 5. 捲動到子區塊（用 setTimeout 確保 DOM 已顯示再捲）
  setTimeout(() => scrollToSub(secEl, sub), 0);
}

/* ===== 捲動到子區塊 =====
   修正 1：原本用 offsetTop，算的是相對「最近的定位元素」的距離，
           不一定是中欄，所以會捲到錯的位置（看起來像顯示上一個或下一個子項）。
           改用畫面實際位置計算，和 CSS 怎麼寫無關。
   修正 2：章節最後一個子區塊內容較短時，捲不到頂端，畫面停在前一個子項。
           依需要在章節底部補空白，讓每個子項都能捲到最上方。 */
function scrollToSub(secEl, sub) {
  const el = document.getElementById(sub);
  const area = document.getElementById('contentArea');
  if (!el || !area) return;

  // 補足章節底部空白（只補「剛好需要」的高度）
  secEl.style.paddingBottom = '';
  const blocks = secEl.querySelectorAll('.sub-block[id]');
  const last = blocks[blocks.length - 1];
  if (last) {
    const lastTop = last.getBoundingClientRect().top;
    const secBottom = secEl.getBoundingClientRect().bottom;
    const need = area.clientHeight - (secBottom - lastTop) - 12;
    if (need > 0) secEl.style.paddingBottom = need + 'px';
  }

  spyLock = true;
  area.scrollTop += el.getBoundingClientRect().top - area.getBoundingClientRect().top - 12;
  setTimeout(() => { spyLock = false; }, 100);
}

/* ===== 修正 3：手動捲動時，左側按鈕跟著目前看到的子項亮起 ===== */
function initScrollSpy() {
  const area = document.getElementById('contentArea');
  if (!area) return;
  area.addEventListener('scroll', () => {
    if (spyLock || !currentSec) return;
    const secEl = document.getElementById(currentSec);
    if (!secEl) return;
    const areaTop = area.getBoundingClientRect().top;
    let current = null;
    secEl.querySelectorAll('.sub-block[id]').forEach(b => {
      if (b.getBoundingClientRect().top - areaTop <= 60) current = b.id;
    });
    if (!current) {
      const first = secEl.querySelector('.sub-block[id]');
      current = first ? first.id : null;
    }
    if (!current || current === currentSub[currentSec]) return;
    currentSub[currentSec] = current;
    document.querySelectorAll('.sec-sub-btn').forEach(b => b.classList.remove('active'));
    const btn = document.getElementById('btn-' + current);
    if (btn) btn.classList.add('active');
  }, { passive: true });
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

/* ===== 左欄摺疊 ===== */
function openGroup(sec) {
  const btn = document.getElementById('btn-' + sec);
  const group = btn && btn.closest('.sec-group');
  if (group) group.classList.add('open');
}

function initCollapsibleSidebar() {
  const sidebar = document.querySelector('.sidebar');
  if (!sidebar) return;

  sidebar.querySelectorAll('.sec-group').forEach(group => {
    const head = group.querySelector('.sec-group-btn');
    if (!head || !group.querySelector('.sec-sub-btn')) return;   // 沒有子項目就不摺疊
    group.classList.add('has-sub');

    const sec = head.id.replace(/^btn-/, '');
    let collapseAfter = false;

    // 捕獲階段：在原本 onclick 執行前，記錄「是否點的是目前所在且已展開的章節」
    head.addEventListener('click', () => {
      collapseAfter = group.classList.contains('open') && currentSec === sec;
    }, true);

    // 冒泡階段：原本 onclick 執行後，再決定展開或收合
    head.addEventListener('click', () => {
      group.classList.toggle('open', !collapseAfter);
    });
  });

  sidebar.classList.add('js-collapse');   // 有這個 class，CSS 才會開始摺疊
}

/* ===== 複製 Prompt（innerText 會抓到使用者編輯後的最新內容） ===== */
function copyPrompt(btn) {
  const code = btn.closest('.prompt-card').querySelector('.prompt-code').innerText.replace(/\u00a0/g, ' ');
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

/* ===== 啟動：先啟用編輯與摺疊，再顯示第一個章節 ===== */
document.addEventListener('DOMContentLoaded', () => {
  initEditablePrompts();
  initCollapsibleSidebar();
  initScrollSpy();
  if (!currentSec) {
    const first = document.querySelector('.content-section[id]');
    if (first) showSection(first.id);
  }
});
