/* ============================================================
   p1.js — P1 情境練習邏輯
   ============================================================ */

/* ===== 情境資料 ===== */
const CASES = [
  {
    tab: "✉️ 寫信/回信",
    bad: {
      prompt: "幫我寫一封拒絕的信",
      reply: "您好，感謝您的來信。經過審慎考量，我們決定婉拒此次合作邀請。如有機會，期待未來再次合作。敬祝商祺。",
      tip: null
    },
    good: {
      prompt: "我是業務，要婉拒一個合作邀請。\n對方是合作三年的老客戶，關係很重要。\n語氣要有點遺憾但不拖泥帶水，150字以內。",
      tags: [
        { text: "我是業務", type: "who" },
        { text: "婉拒邀請", type: "what" },
        { text: "老客戶、關係重要", type: "how" },
        { text: "遺憾語氣、150字內", type: "format" }
      ],
      reply: "王經理您好，感謝您一直以來的信任與支持。這次的合作邀請我們認真評估了很久，真的非常遺憾，因為內部資源調配的關係，目前無法加入。這三年合作的默契很珍貴，希望之後還有機會繼續一起合作。再次感謝您的青睞。",
      tip: null
    },
    insight: "<strong>差在哪裡？</strong>原始版 AI 不知道你是誰、對方是誰、關係是什麼——只能給一個放諸四海皆準的空洞回覆。加了身分、關係、語氣要求之後，AI 才能模擬真實的人情味。"
  },
  {
    tab: "📋 整理重點",
    bad: {
      prompt: "幫我整理重點（然後貼一大段會議記錄）",
      reply: "本次會議討論了多項議題，包含專案進度、預算調整及人員配置，與會人員表達各自意見後達成共識，後續將依討論方向執行。",
      tip: null
    },
    good: {
      prompt: "以下是今天的會議記錄，請整理成三個行動重點，每點一句話，最後加一行「待確認事項」列出還沒定案的部分。",
      tags: [
        { text: "會議記錄", type: "what" },
        { text: "三個行動重點", type: "how" },
        { text: "每點一句話", type: "format" },
        { text: "加待確認事項", type: "format" }
      ],
      reply: "【行動重點】\n① 專案時程提前兩週，由王組長負責協調。\n② 追加預算申請於週五前送出。\n③ 新進人員配置方案下週一前確認。\n\n【待確認事項】\n· 外部顧問費用是否納入本次預算？",
      tip: null
    },
    insight: "<strong>差在哪裡？</strong>沒有告訴 AI 你要幾點、什麼格式、還要哪些欄位，AI 就只能幫你縮短原文，而不是真的幫你整理出可以直接用的筆記。"
  },
  {
    tab: "📊 向上報告",
    bad: {
      prompt: "幫我寫上個月的工作報告",
      reply: "本月工作執行順利，各項任務依計畫推進，整體績效表現良好，後續將持續優化工作流程，提升整體效率。",
      tip: null
    },
    good: {
      prompt: "我要向主管報告上個月的執行狀況。\n主管很重視數字和進度，不喜歡廢話。\n請用條列式，先結論再說明，控制在一頁以內，語氣簡潔專業。",
      tags: [
        { text: "向主管報告", type: "who" },
        { text: "上月執行狀況", type: "what" },
        { text: "重視數字進度", type: "how" },
        { text: "先結論、條列、一頁內", type: "format" }
      ],
      reply: "【結論】三項主要任務達標，一項延遲需關注。\n\n① 客戶提案完成率 92%（目標 85%）✓\n② 系統優化上線，錯誤率下降 40% ✓\n③ 教育訓練完訓 18/20 人 ✓\n④ B專案進度落後 5 天 — 原因：外部審查延誤，預計本週補回 ⚠",
      tip: null
    },
    insight: "<strong>差在哪裡？</strong>報告給誰看？主管的偏好是什麼？要什麼格式？加了這些料之後，AI 給出的版本才是你拿到就能直接貼的那種。"
  },
  {
    tab: "📄 套用舊文件",
    bad: {
      prompt: "這是上次的會議記錄，\n幫我寫這次的。（附上舊文件）",
      reply: "會議記錄\n\n時間：112年10月15日\n地點：第一會議室\n主席：張處長\n\n一、討論事項\n（一）本次會議依上次決議辦理。\n二、臨時動議：無\n三、散會",
      tip: "⚠ AI 只套了個空殼，內容幾乎是空的——因為它不知道這次發生了什麼事。"
    },
    good: {
      prompt: "以下是上次會議記錄，請參考【段落結構與標題層次】，\n幫我產出這次新版本。\n\n本次主題：113年度教育訓練規劃討論\n重點內容：\n・課程規劃由人資部提案，共三梯次\n・預算上限 12 萬，需主管核准\n・執行期間：3月至5月\n\n請只輸出文字，不要加 Word 格式，\n我會自己貼入原始檔案。",
      tags: [
        { text: "參考結構邏輯", type: "how" },
        { text: "本次主題內容", type: "what" },
        { text: "提供重點資料", type: "who" },
        { text: "純文字、不要格式", type: "format" }
      ],
      reply: "會議記錄\n\n時間：113年3月10日\n地點：第二會議室\n主席：李處長\n\n一、討論事項\n（一）113年度教育訓練規劃\n　人資部提案辦理三梯次課程，執行期間\n　3至5月，預算上限12萬元，請核准後\n　啟動採購程序。\n\n二、決議：課程規劃案通過。\n三、臨時動議：無\n四、散會",
      tip: "✅ 結構和舊文件一致，內容換成這次主題——貼進去就好，不用重排格式。"
    },
    insight: "<strong>關鍵觀念：AI 不會複製你的 Word 格式。</strong>就算提供原始檔，AI 輸出的格式也是「AI 自己的格式」。正確做法是告訴 AI 參考「結構邏輯」，輸入本次重點，請 AI 輸出純文字——再貼回原始檔，才是最省事的流程。"
  }
];

/* ===== 問定骨生資料 ===== */
const FW = [
  {
    char: "問", label: "背景說清楚", tagType: "who", color: "#0C447C",
    desc: "告訴 AI 你是誰、現在的情況是什麼。AI 沒有你的背景，不說它就只能猜——猜出來的往往不是你要的。",
    example: "我是業務主管，要向客戶解釋出貨延誤...\n我是人資，要發一封全公司公告...\n我是新進員工，要回覆一封客訴信件...",
    hint: "對應左側標籤：藍色「身分/情境」"
  },
  {
    char: "定", label: "任務說清楚", tagType: "what", color: "#085041",
    desc: "告訴 AI 你要它產出什麼東西。「幫我寫」太模糊，要說清楚是寫信、整理摘要、還是產出報告。",
    example: "幫我寫一封婉拒信...\n幫我整理成三個行動重點...\n幫我用條列式整理成一頁報告...",
    hint: "對應左側標籤：綠色「任務內容」"
  },
  {
    char: "骨", label: "格式說清楚", tagType: "format", color: "#633806",
    desc: "告訴 AI 你要的格式、長度、段落怎麼排。這決定了 AI 的輸出能不能直接用，不用再手動重整。",
    example: "條列式、先結論再說明、控制在一頁內...\n三點、每點一句話、最後加待確認事項...\n150字以內、純文字不要格式...",
    hint: "對應左側標籤：橘色「格式/結構」"
  },
  {
    char: "生", label: "不滿意就追問", tagType: "how", color: "#3C3489",
    desc: "第一次產出不滿意，就繼續追問。告訴 AI 哪裡不對、要怎麼改，比重新問一次更有效率。",
    example: "語氣太正式，改得口語一點...\n第二點再展開說明，加上具體數字...\n把結論移到最前面...",
    hint: "對應左側標籤：紫色「語氣/調整方向」"
  }
];

/* ===== 狀態 ===== */
let currentCase = 0;
let activeFw = null;

/* ===== Nav：依 ?unit= 參數切換 P2 連結 ===== */
const UNIT_MAP = {
  aviation: { label: "航空警察局 課程 Prompt", href: "course-aviation.html" },
  general:  { label: "通用版 課程 Prompt",     href: "course-general.html"  },
  st:  { label: "巨興醫學科技 課程 Prompt",     href: "course-st.html"  },
  ai202606:  { label: "新莊全方位AI24 課程 Prompt",     href: "course-ai202606.html"  }
  /* 新單位在此新增一行 */
};

function initNavLink() {
  const params   = new URLSearchParams(window.location.search);
  const unit     = params.get('unit') || 'general';
  const info     = UNIT_MAP[unit] || UNIT_MAP['general'];
  const unitSuffix = unit !== 'general' ? '?unit=' + unit : '';

  // P2 連結：文字 + href
  const p2link = document.getElementById('p2-link');
  if (p2link) { p2link.textContent = info.label; p2link.href = info.href; }

  // P1 自己的鈕：保持 ?unit= 參數，避免點了之後掉參數
  const p1link = document.getElementById('p1-link');
  if (p1link) p1link.href = 'index.html' + unitSuffix;

  // 品牌 Logo 連結也同步
  const brand = document.getElementById('nav-brand');
  if (brand) brand.href = 'index.html' + unitSuffix;
}

/* ===== 初始化 ===== */
function init() {
  initNavLink();
  buildTabs();
  buildFwRow();
  render();
}

/* ===== 情境鈕 ===== */
function buildTabs() {
  document.getElementById('tabBar').innerHTML = CASES.map((c, i) =>
    `<button class="tab-btn${i === 0 ? ' active' : ''}" onclick="switchCase(${i})">${c.tab}</button>`
  ).join('');
}

function switchCase(idx) {
  currentCase = idx;
  document.querySelectorAll('.tab-btn').forEach((t, i) => t.classList.toggle('active', i === idx));
  render();
  if (activeFw !== null) highlightTags(FW[activeFw].tagType);
}

/* ===== 問定骨生 ===== */
function buildFwRow() {
  document.getElementById('fwRow').innerHTML = FW.map((f, i) =>
    `<button class="fw-btn" id="fwBtn${i}" onclick="toggleFw(${i})">
      <div class="fw-char" style="color:${f.color}">${f.char}</div>
      <div class="fw-label">${f.label}</div>
    </button>`
  ).join('');
}

function toggleFw(idx) {
  const detail = document.getElementById('fwDetailArea');
  if (activeFw === idx) {
    activeFw = null;
    document.querySelectorAll('.fw-btn').forEach(b => b.classList.remove('active'));
    detail.innerHTML = idleHTML();
    highlightTags(null);
  } else {
    activeFw = idx;
    document.querySelectorAll('.fw-btn').forEach((b, i) => b.classList.toggle('active', i === idx));
    const f = FW[idx];
    detail.innerHTML = `
      <div class="fw-detail-card">
        <div class="fw-detail-heading">
          <span class="fw-detail-char" style="color:${f.color}">${f.char}</span>
          <span class="fw-detail-title">${f.label}</span>
        </div>
        <div class="fw-detail-desc">${f.desc}</div>
        <div class="fw-example-label">實際例句</div>
        <div class="fw-example-box">${f.example}</div>
        <div class="fw-hint">${f.hint}</div>
      </div>
      <div class="fw-tag-legend">
        <div class="fw-tag-legend-title">標籤顏色說明</div>
        ${FW.map(fw => `
          <div class="fw-tag-row">
            <span class="fw-tag-sample" style="background:var(--tag-${fw.tagType}-bg);color:var(--tag-${fw.tagType}-c)">${fw.char}｜${fw.label}</span>
          </div>`).join('')}
      </div>
      <div class="fw-tip-box">
        <strong>💡 課堂提醒</strong><br>
        不需要每次都四個步驟全到，越熟練越自然。先從「說清楚你要什麼任務」和「給出格式要求」開始練習就夠了。
      </div>`;
    highlightTags(f.tagType);
  }
}

function highlightTags(type) {
  document.querySelectorAll('.tag').forEach(tag => {
    if (!type) {
      tag.classList.remove('dimmed', 'highlighted');
    } else if (tag.classList.contains(type)) {
      tag.classList.remove('dimmed');
      tag.classList.add('highlighted');
    } else {
      tag.classList.remove('highlighted');
      tag.classList.add('dimmed');
    }
  });
}

function idleHTML() {
  return `<div class="fw-idle">
    <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
      <rect x="6" y="6" width="32" height="32" rx="7" stroke="#A09D97" stroke-width="1.5"/>
      <path d="M14 22h16M14 15h10M14 29h12" stroke="#A09D97" stroke-width="1.5" stroke-linecap="round"/>
    </svg>
    <div>點選上方【問】【定】【骨】【生】<br>了解每個步驟的意義<br><br>左側對應的「料」標籤也會同步亮起</div>
  </div>`;
}

/* ===== 渲染對比卡片 ===== */
function render() {
  const c = CASES[currentCase];
  const noTag   = `<div class="tags-row"><span class="tag" style="background:var(--cream2);color:var(--text-light)">沒有加料</span></div>`;
  const goodTags = `<div class="tags-row">${c.good.tags.map(t => `<span class="tag ${t.type}">${t.text}</span>`).join('')}</div>`;
  const badTip  = c.bad.tip  ? `<div class="tip-box warn">${c.bad.tip}</div>` : '';
  const goodTip = c.good.tip ? `<div class="tip-box ok">${c.good.tip}</div>` : '';

  document.getElementById('insightBar').innerHTML = c.insight;
  document.getElementById('compareArea').innerHTML = `
    <div class="side-card">
      <div class="side-label bad">✕ 一般問法</div>
      <div class="prompt-box bad">${c.bad.prompt}</div>
      ${noTag}
      <div class="ai-label">AI 的回答</div>
      <div class="ai-reply bad">${c.bad.reply}</div>
      ${badTip}
    </div>
    <div class="side-card">
      <div class="side-label good">✓ 加料之後</div>
      <div class="prompt-box good">${c.good.prompt}</div>
      ${goodTags}
      <div class="ai-label">AI 的回答</div>
      <div class="ai-reply">${c.good.reply}</div>
      ${goodTip}
    </div>`;
}

/* ===== 啟動 ===== */
document.addEventListener('DOMContentLoaded', init);
