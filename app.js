const DEFINITIONS = window.SCALE_DEFINITIONS || {};
const CORE_KEYS = ["gad7", "oasis", "phq9"];
const STORAGE_KEY = "anxin_screen_records_v3";
const DRAFT_KEY = "anxin_screen_draft_v1";
const appState = {
  flowKeys: [],
  sectionIndex: 0,
  questionIndex: 0,
  answers: {},
  profile: { triggers: [], times: [], avoid: "", sleep: "", relax: "", note: "" },
  guideAnswers: [],
  guideStep: 0,
  recommendedKeys: ["gad7", "phq9"],
  currentResult: null
};
let toastTimer = null;

function showView(name) {
  document.querySelectorAll(".view").forEach(function (view) { view.classList.remove("active"); });
  var target = document.getElementById(name + "-view");
  if (target) target.classList.add("active");
  document.querySelectorAll(".nav-link").forEach(function (button) {
    button.classList.toggle("active", button.dataset.view === name || (name === "articles" && button.dataset.view === "resources"));
  });
  window.scrollTo({ top: 0, behavior: "smooth" });
}
function toast(message) {
  var node = document.getElementById("toast");
  node.textContent = message;
  node.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(function () { node.classList.remove("show"); }, 2600);
}
function escapeHTML(value) {
  return String(value || "").replace(/[&<>"']/g, function (char) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[char];
  });
}
function getRecords() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); } catch (error) { return []; }
}
function setRecords(records) { localStorage.setItem(STORAGE_KEY, JSON.stringify(records)); }
function saveDraft() {
  localStorage.setItem(DRAFT_KEY, JSON.stringify({
    flowKeys: appState.flowKeys,
    sectionIndex: appState.sectionIndex,
    questionIndex: appState.questionIndex,
    answers: appState.answers,
    profile: appState.profile
  }));
}
function clearDraft() { localStorage.removeItem(DRAFT_KEY); }
function getDraft() {
  try { return JSON.parse(localStorage.getItem(DRAFT_KEY) || "null"); } catch (error) { return null; }
}

function startFlow(keys) {
  var valid = keys.filter(function (key) { return DEFINITIONS[key] && DEFINITIONS[key].enabled; });
  if (!valid.length) return;
  appState.flowKeys = valid;
  appState.sectionIndex = 0;
  appState.questionIndex = 0;
  appState.answers = {};
  appState.profile = { triggers: [], times: [], avoid: "", sleep: "", relax: "", note: "" };
  valid.forEach(function (key) { appState.answers[key] = []; });
  saveDraft();
  renderQuestion();
  showView("checkin");
}
function resumeDraft() {
  var draft = getDraft();
  if (!draft || !draft.flowKeys || !draft.flowKeys.length) return false;
  appState.flowKeys = draft.flowKeys;
  appState.sectionIndex = draft.sectionIndex || 0;
  appState.questionIndex = draft.questionIndex || 0;
  appState.answers = draft.answers || {};
  appState.profile = draft.profile || appState.profile;
  renderQuestion();
  showView("checkin");
  toast("已恢复上次未完成的筛查");
  return true;
}
function currentKey() { return appState.flowKeys[appState.sectionIndex]; }
function currentDefinition() { return DEFINITIONS[currentKey()]; }
function currentOptions() { return currentDefinition().options; }

function renderScaleGrid() {
  var grid = document.getElementById("scale-grid");
  if (!grid) return;
  var moreKeys = Object.keys(DEFINITIONS).filter(function (key) {
    return DEFINITIONS[key].enabled && CORE_KEYS.indexOf(key) === -1;
  });
  grid.innerHTML = moreKeys.map(function (key) {
    var scale = DEFINITIONS[key];
    var licenseWarning = scale.licenseStatus !== "confirmed-commercial" ? '<span class="license-mini">授权需核对</span>' : "";
    return '<article class="scale-card" data-scale="' + key + '"><div class="scale-top"><span class="scale-category">' + scale.category + '</span><span class="scale-period">' + scale.period + '</span></div><div class="scale-card-title-row"><h2>' + scale.name + '</h2>' + licenseWarning + '</div><p class="scale-full">' + scale.englishName + '</p><p>' + scale.purpose + '</p><span class="scale-go">开始 ' + scale.questions.length + ' 题筛查 →</span></article>';
  }).join("");
  grid.querySelectorAll(".scale-card").forEach(function (card) {
    card.addEventListener("click", function () { startFlow([card.dataset.scale]); });
  });
}
function renderQuestion() {
  var scale = currentDefinition();
  var question = scale.questions[appState.questionIndex];
  var options = scale.options;
  var total = appState.flowKeys.reduce(function (sum, key) { return sum + DEFINITIONS[key].questions.length; }, 0);
  var completedBefore = appState.flowKeys.slice(0, appState.sectionIndex).reduce(function (sum, key) { return sum + DEFINITIONS[key].questions.length; }, 0);
  var globalIndex = completedBefore + appState.questionIndex;
  document.getElementById("scale-name").textContent = scale.name;
  document.getElementById("step-label").textContent = "第 " + (globalIndex + 1) + " / " + total + " 题";
  document.getElementById("progress-fill").style.width = ((globalIndex + 1) / total * 100) + "%";
  document.getElementById("assessment-section-label").textContent = "正式量表 · " + scale.name + " · 使用原版题目与计分";
  document.getElementById("question-period").textContent = scale.period;
  document.getElementById("aside-instrument").textContent = scale.name;
  document.getElementById("aside-period").textContent = scale.period;
  document.getElementById("question-text").textContent = question;
  document.getElementById("question-hint").textContent = "请根据" + scale.period + "的真实感受选择最贴近的一项。";
  document.getElementById("keyboard-hint").textContent = "按 1–" + options.length + " 快速选择 · 空格继续";
  document.getElementById("orb-emoji").textContent = ["🌿", "◌", "☁️", "〰", "◒", "✦", "♡"][globalIndex % 7];
  document.getElementById("aside-caption").innerHTML = ["慢一点回答<br>也没有关系。", "把注意力<br>放回自己。", "不用解释<br>为什么。", "呼吸一下，<br>再继续。"][globalIndex % 4];

  var list = document.getElementById("answer-list");
  list.innerHTML = "";
  var chosen = appState.answers[currentKey()][appState.questionIndex];
  options.forEach(function (option, index) {
    var button = document.createElement("button");
    button.className = "answer-option" + (chosen === option.value ? " selected" : "");
    button.innerHTML = '<span class="answer-circle"></span><span>' + option.label + '</span><span class="answer-value">' + (index + 1) + '</span>';
    button.addEventListener("click", function () { selectAnswer(option.value); });
    list.appendChild(button);
  });
  var next = document.getElementById("next-btn");
  next.disabled = chosen === undefined || chosen === null;
  next.innerHTML = (appState.sectionIndex === appState.flowKeys.length - 1 && appState.questionIndex === scale.questions.length - 1) ? "进入补充画像 <span>→</span>" : "继续 <span>→</span>";
  saveDraft();
}
function selectAnswer(value) {
  appState.answers[currentKey()][appState.questionIndex] = value;
  renderQuestion();
}
function nextQuestion() {
  var selected = appState.answers[currentKey()][appState.questionIndex];
  if (selected === undefined || selected === null) return;
  var scale = currentDefinition();
  if (appState.questionIndex < scale.questions.length - 1) {
    appState.questionIndex += 1;
    renderQuestion();
  } else if (appState.sectionIndex < appState.flowKeys.length - 1) {
    appState.sectionIndex += 1;
    appState.questionIndex = 0;
    renderQuestion();
  } else {
    renderProfile();
    showView("profile");
  }
}
function previousQuestion() {
  if (appState.questionIndex > 0) {
    appState.questionIndex -= 1;
  } else if (appState.sectionIndex > 0) {
    appState.sectionIndex -= 1;
    appState.questionIndex = DEFINITIONS[currentKey()].questions.length - 1;
  } else {
    showView("choose");
    return;
  }
  renderQuestion();
}

function bandFor(scale, score) {
  for (var i = 0; i < scale.bands.length; i += 1) {
    if (score <= scale.bands[i].max) return { label: scale.bands[i].label, description: scale.bands[i].description, index: i };
  }
  return { label: scale.bands[scale.bands.length - 1].label, description: scale.bands[scale.bands.length - 1].description, index: scale.bands.length - 1 };
}
function scoreScale(key) {
  var scale = DEFINITIONS[key];
  var answers = appState.answers[key] || [];
  if (scale.scoreMode === "subscales") {
    return scoreSubscales(key).reduce(function (sum, item) { return sum + item.score; }, 0);
  }
  var score = answers.reduce(function (sum, value, index) {
    var normalized = scale.reverse && scale.reverse.indexOf(index) !== -1 ? 4 - value : value;
    return sum + (normalized || 0);
  }, 0);
  return Math.round(score * (scale.scoreMultiplier || 1));
}
function scoreSubscales(key) {
  var scale = DEFINITIONS[key];
  var answers = appState.answers[key] || [];
  return (scale.subscales || []).map(function (subscale) {
    var raw = subscale.indexes.reduce(function (sum, index) { return sum + (answers[index] || 0); }, 0);
    var score = raw * (subscale.multiplier || 1);
    var band = subscale.bands.find(function (item) { return score <= item.max; }) || subscale.bands[subscale.bands.length - 1];
    return { key: subscale.key, name: subscale.name, score: score, band: band.label, bandIndex: subscale.bands.indexOf(band), maxScore: subscale.bands[subscale.bands.length - 1].max };
  });
}
function createRecord() {
  var scaleRecords = {};
  appState.flowKeys.forEach(function (key) {
    var scale = DEFINITIONS[key];
    var score = scoreScale(key);
    var band = bandFor(scale, score);
    scaleRecords[key] = {
      answers: appState.answers[key].slice(),
      score: score,
      maxScore: scale.maxScore,
      band: band.label,
      bandIndex: band.index
    };
    if (scale.scoreMode === "subscales") scaleRecords[key].subscales = scoreSubscales(key);
  });
  return {
    id: Date.now(),
    createdAt: new Date().toISOString(),
    scaleRecords: scaleRecords,
    profile: JSON.parse(JSON.stringify(appState.profile))
  };
}
function buildProfileOptions() {
  var groups = {
    "trigger-options": [["工作", "work"], ["学习", "study"], ["钱", "money"], ["健康", "health"], ["感情", "relationship"], ["家庭", "family"], ["社交", "social"], ["未来", "future"], ["睡眠", "sleep"], ["没有明显原因", "none"]],
    "time-options": [["起床后", "morning"], ["工作/学习时", "day"], ["社交时", "social"], ["独处时", "alone"], ["睡前", "bedtime"], ["深夜", "night"]]
  };
  Object.keys(groups).forEach(function (id) {
    var container = document.getElementById(id);
    if (!container) return;
    var selected = id === "trigger-options" ? appState.profile.triggers : appState.profile.times;
    container.innerHTML = groups[id].map(function (item) {
      return '<button type="button" class="chip ' + (selected.indexOf(item[1]) !== -1 ? "selected" : "") + '" data-value="' + item[1] + '">' + item[0] + '</button>';
    }).join("");
    container.querySelectorAll(".chip").forEach(function (button) {
      button.addEventListener("click", function () {
        var list = id === "trigger-options" ? appState.profile.triggers : appState.profile.times;
        var value = button.dataset.value;
        if (list.indexOf(value) === -1) list.push(value); else list.splice(list.indexOf(value), 1);
        buildProfileOptions();
        saveDraft();
      });
    });
  });
  var singleGroups = {
    "avoid-options": [["没有", "no"], ["有一点", "some"], ["明显有", "yes"]],
    "sleep-options": [["没有明显影响", "no"], ["有一些影响", "some"], ["明显影响", "yes"]],
    "relax-options": [["没有", "no"], ["有时", "some"], ["长期如此", "yes"]]
  };
  Object.keys(singleGroups).forEach(function (id) {
    var container = document.getElementById(id);
    var key = id.replace("-options", "");
    var selected = appState.profile[key];
    container.innerHTML = singleGroups[id].map(function (item) {
      return '<button type="button" class="choice-button ' + (selected === item[1] ? "selected" : "") + '" data-value="' + item[1] + '">' + item[0] + '</button>';
    }).join("");
    container.querySelectorAll(".choice-button").forEach(function (button) {
      button.addEventListener("click", function () {
        appState.profile[key] = button.dataset.value;
        buildProfileOptions();
        saveDraft();
      });
    });
  });
  document.getElementById("profile-note").value = appState.profile.note || "";
}
function renderProfile() {
  buildProfileOptions();
  document.getElementById("profile-note").oninput = function (event) {
    appState.profile.note = event.target.value;
    saveDraft();
  };
}
function finishProfile() {
  var record = createRecord();
  var records = getRecords();
  records.push(record);
  setRecords(records.slice(-60));
  clearDraft();
  appState.currentResult = record;
  renderResult(record);
  showView("result");
}
function bandTone(index, total) {
  if (index <= 0) return "low";
  if (index >= total - 1) return "high";
  return "mid";
}
function scoreWording(value, maxOption) {
  if (value <= 0) return "较少";
  if (value >= Math.max(2, maxOption - 1)) return "明显";
  return "有一些";
}
var scaleSourceUrls = {
  gad7: "https://pubmed.ncbi.nlm.nih.gov/16717171/",
  oasis: "https://pubmed.ncbi.nlm.nih.gov/16551256/",
  phq9: "https://pubmed.ncbi.nlm.nih.gov/11556941/",
  dass21: "https://doi.org/10.1037/t01035-000",
  pss10: "https://pubmed.ncbi.nlm.nih.gov/6668417/",
  isi: "https://pubmed.ncbi.nlm.nih.gov/14592296/",
  who5: "https://www.psykiatri-regionh.dk/who-5/Pages/default.aspx"
};
function meaningFor(scale, item, key) {
  var labels = {
    gad7: ["较少焦虑症状", "一些焦虑症状", "较多焦虑症状", "更多且较明显的焦虑症状"],
    oasis: ["焦虑对生活影响较少", "一些生活影响", "较明显的生活影响", "明显的生活影响"],
    phq9: ["较少的相关情绪症状", "一些相关情绪症状", "较多相关情绪症状", "明显的相关情绪症状", "更多且较明显的相关情绪症状"],
    isi: ["较少的失眠困扰", "一些睡眠困扰", "中等程度的失眠困扰", "较明显的失眠困扰"],
    pss10: ["较低的压力感", "中等的压力感", "较高的压力感", "很高的压力感"],
    who5: ["较低的近期幸福感", "偏低的近期幸福感", "相对良好的近期幸福感"]
  };
  var choices = labels[key] || ["相关症状水平"];
  var phrase = choices[Math.min(item.bandIndex || 0, choices.length - 1)];
  var subject = key === "gad7" || key === "oasis" ? "焦虑症" : key === "phq9" ? "抑郁症" : "某种心理疾病";
  return {
    what: "这意味着你在 " + scale.period + " 报告了" + phrase + "。",
    not: "它提示值得进一步关注，但不能证明你患有" + subject + "。",
    context: "分数需要结合持续时间、生活影响、身体疾病、药物或物质使用等一起理解。"
  };
}
function renderResult(record) {
  var entries = Object.keys(record.scaleRecords).map(function (key) {
    var scale = DEFINITIONS[key];
    var item = record.scaleRecords[key];
    var band = scale.scoreMode === "subscales" ? { index: Math.max.apply(null, (item.subscales || []).map(function (subscale) { return subscale.bandIndex || 0; })), label: "按三个维度分别解释", description: scale.bands[0].description } : bandFor(scale, item.score);
    return { key: key, scale: scale, item: item, band: band };
  });
  var worst = entries.reduce(function (acc, entry) {
    return !acc || entry.band.index > acc.band.index ? entry : acc;
  }, null);
  document.getElementById("result-date").textContent = new Date(record.createdAt).toLocaleDateString("zh-CN", { month: "numeric", day: "numeric" });
  document.getElementById("result-headline").textContent = entries.length > 1 ? "这是一张关于最近两周的状态快照。" : "这是一次关于近期状态的快照。";
  document.getElementById("result-disclaimer").textContent = "筛查结果用于自我观察，不等同于" + (entries.length > 1 ? "焦虑或抑郁障碍" : "医学诊断") + "诊断。";
  document.getElementById("result-summary-grid").innerHTML = entries.map(function (entry) {
    if (entry.scale.scoreMode === "subscales") {
      return '<div class="result-score-tile result-score-tile-wide"><span class="section-kicker">' + entry.scale.name + ' · 三个维度</span><div class="subscale-summary">' + (entry.item.subscales || []).map(function (subscale) { return '<span><b>' + subscale.name + '</b> ' + subscale.score + ' · ' + subscale.band + '</span>'; }).join("") + '</div><p>' + entry.scale.bands[0].description + '</p><a class="why-btn" href="' + scaleSourceUrls[entry.key] + '" target="_blank" rel="noreferrer">为什么这样分级？ ↗</a></div>';
    }
    return '<div class="result-score-tile"><span class="section-kicker">' + entry.scale.name + ' · ' + entry.scale.category + '</span><strong>' + entry.item.score + '<small>/ ' + entry.item.maxScore + ' 分</small></strong><span class="result-band ' + bandTone(entry.band.index, entry.scale.bands.length) + '">' + entry.band.label + '</span><p>' + entry.band.description + '</p><a class="why-btn" href="' + scaleSourceUrls[entry.key] + '" target="_blank" rel="noreferrer">为什么这样分级？ ↗</a></div>';
  }).join("");

  document.getElementById("result-meaning-list").innerHTML = entries.map(function (entry) {
    var meaning = meaningFor(entry.scale, entry.item, entry.key);
    return '<div class="meaning-block"><div class="meaning-title"><strong>' + entry.scale.name + ' · ' + entry.band.label + '</strong><a class="why-btn" href="' + scaleSourceUrls[entry.key] + '" target="_blank" rel="noreferrer">查看研究来源 ↗</a></div><p>' + meaning.what + '</p><p>' + meaning.not + '</p><p>' + meaning.context + '</p></div>';
  }).join("");

  var manifestations = [];
  entries.forEach(function (entry) {
    var answers = entry.item.answers;
    var options = entry.scale.options;
    entry.scale.questions.forEach(function (question, index) {
      if (answers[index] > 0 && !(entry.key === "phq9" && index === entry.scale.safetyQuestion)) {
        manifestations.push('<div class="manifestation-row"><span>' + entry.scale.name + ' · ' + escapeHTML(question) + '</span><b>' + scoreWording(answers[index], options.length) + '</b></div>');
      }
    });
  });
  document.getElementById("manifestation-list").innerHTML = manifestations.length ? manifestations.slice(0, 8).join("") : '<p class="result-muted">这次回答中，没有需要单独列出的明显表现。</p>';

  var impact = [];
  if (record.scaleRecords.oasis) {
    var oasisAnswers = record.scaleRecords.oasis.answers;
    ["工作/学习效率", "社交生活或人际关系", "享受生活"].forEach(function (label, index) {
      if (oasisAnswers[index + 2] > 0) impact.push(label);
    });
    if (oasisAnswers[1] > 0) impact.push("回避某些情境或活动");
  }
  if (record.profile.sleep === "some" || record.profile.sleep === "yes") impact.push("睡眠");
  if (record.profile.avoid === "some" || record.profile.avoid === "yes") impact.push("回避行为");
  document.getElementById("function-impact").innerHTML = impact.length ? '<div class="tag-list">' + impact.map(function (item) { return '<span class="result-tag">' + item + '</span>'; }).join("") + '</div><p class="result-muted">这些信息来自量表回答或你的自我报告。</p>' : '<p class="result-muted">目前没有额外的功能影响记录。若状态已经影响日常生活，可以补充记录或寻求专业支持。</p>';

  var triggerLabels = { work: "工作", study: "学习", money: "钱", health: "健康", relationship: "感情", family: "家庭", social: "社交", future: "未来", sleep: "睡眠", none: "没有明显原因" };
  var timeLabels = { morning: "起床后", day: "工作/学习时", social: "社交时", alone: "独处时", bedtime: "睡前", night: "深夜" };
  var triggerValues = record.profile.triggers.map(function (value) { return triggerLabels[value]; }).concat(record.profile.times.map(function (value) { return timeLabels[value]; }));
  document.getElementById("trigger-summary").innerHTML = triggerValues.length ? '<div class="tag-list">' + triggerValues.map(function (item) { return '<span class="result-tag soft">' + item + '</span>'; }).join("") + '</div><p class="result-muted">这一部分来自你的自我报告，用于辅助理解，不属于疾病诊断。</p>' : '<p class="result-muted">你跳过了补充画像。之后可以在下一次筛查时记录触发因素。</p>';

  var safety = false;
  entries.forEach(function (entry) {
    if (entry.key === "phq9" && entry.item.answers[DEFINITIONS.phq9.safetyQuestion] > 0) safety = true;
  });
  var safetyNode = document.getElementById("safety-banner");
  safetyNode.hidden = !safety;

  var advice;
  if (worst && worst.band.index >= Math.max(2, worst.scale.bands.length - 2)) {
    advice = "如果近期症状持续明显、功能受损或越来越严重，建议寻求心理咨询师、精神科或心理科专业人员的进一步评估。";
  } else if (worst && worst.band.index >= 1) {
    advice = "如果这种状态已经持续较久或明显影响生活，可以考虑与心理咨询师、精神科或心理科专业人员进一步讨论。也可以在 1～2 周后使用同一量表再次记录。";
  } else {
    advice = "可以继续观察，并在 1～2 周后用同一量表再次测量。把睡眠、压力和生活节奏一起记下来，可能更容易看见变化。";
  }
  document.getElementById("result-advice").textContent = advice;
  renderDoctorReport(record, entries);
}

function formatReportDate(date) { return new Date(date).toLocaleDateString("zh-CN", { year: "numeric", month: "numeric", day: "numeric" }); }
function reportTrendFor(key, currentDate) {
  var cutoff = new Date(currentDate).getTime() - 30 * 24 * 60 * 60 * 1000;
  var rows = [];
  getRecords().forEach(function (record) {
    if (new Date(record.createdAt).getTime() >= cutoff && record.scaleRecords[key]) rows.push(record);
  });
  rows.sort(function (a, b) { return new Date(a.createdAt) - new Date(b.createdAt); });
  return rows;
}
function renderDoctorReport(record, entries) {
  var body = document.getElementById("doctor-report-body");
  if (!body) return;
  var scoreRows = entries.map(function (entry) {
    var trend = reportTrendFor(entry.key, record.createdAt);
    var previous = trend.length > 1 ? trend[trend.length - 2].scaleRecords[entry.key] : null;
    var change = previous ? (entry.item.score === previous.score ? "与上次相同" : entry.item.score < previous.score ? "比上次低 " + (previous.score - entry.item.score) + " 分" : "比上次高 " + (entry.item.score - previous.score) + " 分") : "首次记录";
    return '<div class="report-score-row"><strong>' + entry.scale.name + '</strong><span>' + formatHistoryScore(entry.scale, entry.item) + '</span><em>' + change + '</em></div>';
  }).join("");
  var symptoms = [];
  entries.forEach(function (entry) { entry.scale.questions.forEach(function (question, index) { if (entry.item.answers[index] > 0 && !(entry.key === "phq9" && index === entry.scale.safetyQuestion)) symptoms.push(entry.scale.name + "：" + question); }); });
  var impact = [];
  if (record.profile.sleep === "some" || record.profile.sleep === "yes") impact.push("睡眠");
  if (record.profile.avoid === "some" || record.profile.avoid === "yes") impact.push("回避行为");
  if (record.scaleRecords.oasis) impact.push("OASIS 功能影响");
  var trendText = entries.map(function (entry) { var trend = reportTrendFor(entry.key, record.createdAt); return entry.scale.name + "：" + (trend.length > 1 ? trend.length + " 次记录" : "暂无可比较的过去一个月记录"); }).join("；");
  body.innerHTML = '<p class="report-disclaimer">本报告由用户自行填写的筛查结果生成，仅用于与医生或心理健康专业人员沟通，不是诊断意见。</p><div class="report-section"><h3>最近一次结果 · ' + formatReportDate(record.createdAt) + '</h3>' + scoreRows + '</div><div class="report-section"><h3>影响较大的表现</h3><p>' + (symptoms.length ? symptoms.slice(0, 8).map(escapeHTML).join("；") : "本次没有记录到需要单独列出的明显表现") + '</p></div><div class="report-section"><h3>功能与睡眠</h3><p>' + (impact.length ? impact.join("、") : "未记录明显功能影响") + '</p></div><div class="report-section"><h3>过去一个月趋势</h3><p>' + trendText + '</p></div><div class="report-section"><h3>用户备注</h3><p>' + (record.profile.note ? escapeHTML(record.profile.note) : "未填写") + '</p></div><p class="report-footer">请由专业人员结合面谈、病史、身体状况、药物/物质使用和实际功能影响进行判断。</p>';
}

function renderHistory() {
  var records = getRecords();
  var groups = {};
  records.forEach(function (record) {
    Object.keys(record.scaleRecords).forEach(function (key) {
      if (!groups[key]) groups[key] = [];
      groups[key].push({ date: record.createdAt, item: record.scaleRecords[key], note: record.profile.note || "" });
    });
  });
  var keys = Object.keys(groups);
  var container = document.getElementById("history-groups");
  document.getElementById("history-empty").innerHTML = keys.length ? "" : '<div class="empty-chart"><span>◌</span><strong>还没有记录</strong><p>完成第一次筛查后，你的趋势会出现在这里。</p></div>';
  container.innerHTML = keys.map(function (key) {
    var scale = DEFINITIONS[key];
    var list = groups[key].sort(function (a, b) { return new Date(a.date) - new Date(b.date); });
    var last = list[list.length - 1];
    var prev = list.length > 1 ? list[list.length - 2] : null;
    var deltaText = scale.scoreMode === "subscales" ? "三个维度分别记录" : prev ? (last.item.score < prev.item.score ? "最近一次比上次低 " + (prev.item.score - last.item.score) + " 分" : last.item.score > prev.item.score ? "最近一次比上次高 " + (last.item.score - prev.item.score) + " 分" : "最近两次得分相同") : "完成第一次记录";
    var trendText = "最近 " + list.length + " 次 " + scale.name + " 记录";
    if (list.length > 2) {
      var first = list[0].item.score;
      var final = list[list.length - 1].item.score;
      trendText += final < first ? "呈下降趋势" : final > first ? "呈上升趋势" : "变化不明显";
    }
    return '<section class="history-group"><div class="history-group-head"><div><span class="section-kicker">' + scale.category + ' · ' + scale.period + '</span><h2>' + scale.name + '</h2><p>' + scale.purpose + '</p></div><span class="history-delta">' + deltaText + '</span></div><div class="history-chart">' + trendSVG(list, scale) + '</div><div class="history-meta"><span>' + trendText + '</span><span>最近：' + formatHistoryScore(scale, last.item) + '</span></div><div class="history-records">' + list.slice().reverse().map(function (entry) { return '<div class="history-record"><span>' + new Date(entry.date).toLocaleDateString("zh-CN") + '</span><b>' + formatHistoryScore(scale, entry.item) + '</b>' + (entry.note ? '<small>' + escapeHTML(entry.note) + '</small>' : '') + '</div>'; }).join("") + '</div></section>';
  }).join("");
}
function formatHistoryScore(scale, item) {
  if (scale.scoreMode === "subscales") return (item.subscales || []).map(function (subscale) { return subscale.name + " " + subscale.score + "（" + subscale.band + "）"; }).join(" · ") || "三个维度记录";
  return item.score + " / " + item.maxScore + " · " + item.band;
}
function trendSVG(list, scale) {
  var width = 760, height = 190, pad = 24;
  if (scale.scoreMode === "subscales") {
    var colors = ["#2f6f5e", "#b5793e", "#7c88b4"];
    var paths = (scale.subscales || []).map(function (subscale, subIndex) {
      var points = list.map(function (entry, index) {
        var value = ((entry.item.subscales || [])[subIndex] || {}).score || 0;
        var x = list.length === 1 ? width / 2 : pad + index / (list.length - 1) * (width - pad * 2);
        var y = height - pad - value / 42 * (height - pad * 2);
        return [x, y];
      });
      var polyline = points.map(function (point) { return point.join(","); }).join(" ");
      return '<polyline points="' + polyline + '" fill="none" stroke="' + colors[subIndex] + '" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>';
    }).join("");
    return '<svg viewBox="0 0 ' + width + ' ' + height + '" role="img" aria-label="' + scale.name + '三个维度趋势图" preserveAspectRatio="none"><line x1="' + pad + '" x2="' + (width - pad) + '" y1="' + (height - pad) + '" y2="' + (height - pad) + '" stroke="rgba(47,111,94,.15)"/>' + paths + '</svg>';
  }
  var points = list.map(function (entry, index) {
    var x = list.length === 1 ? width / 2 : pad + index / (list.length - 1) * (width - pad * 2);
    var y = height - pad - entry.item.score / scale.maxScore * (height - pad * 2);
    return [x, y];
  });
  var poly = points.map(function (point) { return point.join(","); }).join(" ");
  var circles = points.map(function (point, index) {
    return '<circle cx="' + point[0] + '" cy="' + point[1] + '" r="5" fill="#2f6f5e" stroke="#fff" stroke-width="4"><title>' + new Date(list[index].date).toLocaleDateString("zh-CN") + '：' + list[index].item.score + ' 分</title></circle>';
  }).join("");
  return '<svg viewBox="0 0 ' + width + ' ' + height + '" role="img" aria-label="' + scale.name + '同量表趋势图" preserveAspectRatio="none"><line x1="' + pad + '" x2="' + (width - pad) + '" y1="' + (height - pad) + '" y2="' + (height - pad) + '" stroke="rgba(47,111,94,.15)"/><polyline points="' + poly + '" fill="none" stroke="#2f6f5e" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>' + circles + '</svg>';
}

var guideSteps = [
  { question: "最近最困扰你的是什么？", options: [{ label: "总是担心、紧张", keys: ["gad7"] }, { label: "心情低落、没兴趣", keys: ["phq9"] }, { label: "压力很大、快撑不住", keys: ["pss10"] }, { label: "睡不好", keys: ["isi"] }, { label: "突然心跳加速、恐惧", keys: ["gad7"] }, { label: "害怕社交", keys: ["oasis"] }, { label: "我说不清楚", keys: ["gad7", "phq9"] }] },
  { question: "它最影响哪一部分？", options: [{ label: "工作或学习", keys: ["gad7", "oasis"] }, { label: "睡眠", keys: ["isi", "gad7"] }, { label: "关系和社交", keys: ["oasis"] }, { label: "情绪和兴趣", keys: ["phq9"] }, { label: "身体感觉", keys: ["gad7"] }] },
  { question: "你想先得到什么？", options: [{ label: "先做一个全面的基础检查", keys: ["gad7", "phq9"] }, { label: "先看焦虑症状", keys: ["gad7"] }, { label: "先看生活功能影响", keys: ["oasis"] }] }
];
function renderGuide() {
  var step = document.getElementById("guide-step");
  var index = appState.guideStep;
  if (index >= guideSteps.length) {
    var keys = appState.recommendedKeys;
    step.innerHTML = '<div class="guide-result"><span class="section-kicker">推荐入口</span><h2>可以从 ' + keys.map(function (key) { return DEFINITIONS[key].name; }).join(" + ") + ' 开始</h2><p>这是为了帮你选择更合适的自我筛查工具，不是在进行自动诊断。</p><div class="guide-recommendations">' + keys.map(function (key) { return '<button class="entry-card mini-entry" data-guide-key="' + key + '"><strong>' + DEFINITIONS[key].name + '</strong><span>' + DEFINITIONS[key].purpose + ' →</span></button>'; }).join("") + '</div></div>';
    step.querySelectorAll("[data-guide-key]").forEach(function (button) { button.addEventListener("click", function () { startFlow([button.dataset.guideKey]); }); });
    document.getElementById("guide-next").textContent = "开始推荐筛查";
    document.getElementById("guide-next").disabled = false;
    return;
  }
  var item = guideSteps[index];
  step.innerHTML = '<div class="guide-progress">问题 ' + (index + 1) + ' / ' + guideSteps.length + '</div><h2>' + item.question + '</h2><div class="guide-option-grid">' + item.options.map(function (option, optionIndex) { return '<button class="guide-option ' + (appState.guideAnswers[index] === optionIndex ? "selected" : "") + '" data-guide-index="' + optionIndex + '">' + option.label + '<span>→</span></button>'; }).join("") + '</div>';
  step.querySelectorAll("[data-guide-index]").forEach(function (button) {
    button.addEventListener("click", function () {
      var selected = item.options[Number(button.dataset.guideIndex)];
      appState.guideAnswers[index] = Number(button.dataset.guideIndex);
      appState.recommendedKeys = selected.keys;
      step.querySelectorAll(".guide-option").forEach(function (node) { node.classList.remove("selected"); });
      button.classList.add("selected");
      document.getElementById("guide-next").disabled = false;
    });
  });
  document.getElementById("guide-next").textContent = index === guideSteps.length - 1 ? "查看推荐" : "继续";
  document.getElementById("guide-next").disabled = appState.guideAnswers[index] === undefined;
}
function startGuide() {
  appState.guideAnswers = [];
  appState.guideStep = 0;
  appState.recommendedKeys = ["gad7", "phq9"];
  renderGuide();
  showView("guide");
}

var articleLibrary = [
  {
    key: "intrusive-thoughts",
    icon: "◌",
    tag: "想法与冲动",
    title: "侵入性想法，不等于你的意图",
    dek: "有些念头会突然闯进来，内容吓人、荒谬或和自己的价值观相反。先把它和意图、计划区分开，通常能少一点被念头牵着走。",
    sourceTitle: "Types of intrusive thoughts · Mental Health America",
    sourceUrl: "https://screening.mhanational.org/content/types-intrusive-thoughts/",
    sections: [
      ["它可能是什么", ["侵入性想法是未经邀请出现的画面、念头或冲动感。很多人都经历过，它出现本身不能证明你想去做这件事。", "让人难受的往往不只是内容，还有‘我怎么会想到这个’的自我评判。把念头当成一种心理事件，而不是命令或事实，通常更有帮助。"]],
      ["什么时候值得继续了解", ["如果这些想法反复出现、占用很多时间，或让你不得不反复检查、确认、清洗、回避，咨询专业人员可以帮助你理解它们与焦虑或强迫循环的关系。", "产后、长期高压、睡眠不足或经历创伤后，也可能更容易出现令人不安的念头；这不等于你是一个危险的人。"]],
      ["先做什么", ["可以试着给它命名：‘这是一个闯入的想法，不是我的决定。’然后把注意力放回眼前一个具体动作。", "如果你已经有明确的伤害自己或他人的意图、计划，或觉得自己无法保证安全，请马上联系可信任的人、当地紧急服务或心理援助热线。"]]
    ]
  },
  {
    key: "what-is-anxiety",
    icon: "〰",
    tag: "焦虑基础",
    title: "焦虑是什么？",
    dek: "焦虑是一种提醒系统：它能帮助我们准备面对不确定性，但当警报持续很久、越来越强，或开始限制生活，就值得被认真看见。",
    sourceTitle: "What is anxiety? · Mental Health America",
    sourceUrl: "https://screening.mhanational.org/content/what-anxiety/",
    sections: [
      ["正常的担心与需要关注的状态", ["考试、变化、冲突或健康问题前出现紧张很常见。更需要关注的是：担忧是否难以停止，是否持续影响睡眠、工作学习、关系或出门。", "单靠一次自测不能确认疾病。症状持续多久、影响多大，以及身体状况和药物/物质使用，都需要一起理解。"]],
      ["焦虑可能怎样表现", ["它可能表现为反复担心、难以放松、烦躁、注意力被拉走，也可能伴随心跳加快、肌肉紧绷、胃部不适或回避。每个人的组合都不一样。"]],
      ["下一步", ["可以先用同一量表记录几次，看看变化；如果已经明显影响生活，或你一直靠回避来维持日常，和心理咨询师、精神科/心理科专业人员讨论会更稳妥。"]]
    ]
  },
  {
    key: "anxiety-triggers",
    icon: "✦",
    tag: "触发与环境",
    title: "焦虑为什么会出现或变重？",
    dek: "焦虑通常不是单一原因造成的。遗传倾向、生活环境、关系压力、身体状态和当下触发事件，可能一起影响警报系统。",
    sourceTitle: "What causes anxiety? · Mental Health America",
    sourceUrl: "https://screening.mhanational.org/content/what-causes-anxiety/",
    sections: [
      ["常见影响因素", ["有些人天生更容易警觉；长期压力、睡眠被打乱、重大变化、孤立感或不安全的环境，也可能让身体更难恢复到平稳状态。", "咖啡因、酒精、其他物质、某些药物以及甲状腺等身体问题，也可能影响类似焦虑的感觉。自测结果不能替代身体检查。"]],
      ["找到你的模式", ["你可以在趋势记录里补充：焦虑常在什么时候出现、和什么主题有关、当时睡眠怎样。重点是发现可调整的线索，而不是给自己贴标签。"]],
      ["何时寻求支持", ["如果你已经减少出门、工作学习明显受阻，或担心越来越失控，建议尽早找专业人员一起评估。越早获得支持，通常越容易找到合适的应对方式。"]]
    ]
  },
  {
    key: "anxiety-help",
    icon: "→",
    tag: "可以怎么做",
    title: "焦虑来了，可以先做哪些事？",
    dek: "没有一种方法适合所有人。把目标从‘马上消除焦虑’换成‘让自己多一点选择’，通常更现实。",
    sourceTitle: "How do you treat anxiety? · Mental Health America",
    sourceUrl: "https://screening.mhanational.org/content/how-do-you-treat-anxiety/",
    sections: [
      ["当下先稳住", ["先找一个安全、能让身体有支撑的位置，观察脚底、手掌或周围的声音。你不必强迫自己深呼吸，也不必闭眼；如果呼吸练习让你更紧张，可以换成睁眼观察。"]],
      ["把担心变成下一步", ["把问题分成‘现在能影响’和‘暂时不能确定’。能影响的部分缩成一个十分钟动作；不能确定的部分写下稍后回看的时间，避免它占满整天。", "睡眠、规律吃饭、适度活动、减少让你不舒服的咖啡因或酒精，可能帮助身体更容易恢复；这些是支持，不是保证治愈。"]],
      ["长期支持", ["心理治疗、必要时的药物评估、可信任的人和稳定的生活安排，都可能成为支持的一部分。具体选择应该和专业人员结合你的情况讨论。"]]
    ]
  },
  {
    key: "anxiety-function",
    icon: "↗",
    tag: "生活影响",
    title: "怎么判断焦虑已经影响生活？",
    dek: "分数只是一个线索。更重要的是观察：你为了躲开焦虑放弃了什么，以及它是否正在改变你的睡眠、工作学习和关系。",
    sourceTitle: "Do I have anxiety? · Mental Health America",
    sourceUrl: "https://screening.mhanational.org/content/do-i-have-anxiety/",
    sections: [
      ["看见功能变化", ["留意最近是否更难完成任务、参加社交、出门、休息或享受原本在意的事情。‘我还能撑住’不代表没有影响，持续消耗本身也值得记录。"]],
      ["也要留意重叠因素", ["低落、注意力变化、睡眠问题、身体疾病或物质使用，有时会和焦虑互相影响。自我筛查能帮助你整理线索，但不能单独区分所有原因。"]],
      ["一个温和的判断", ["如果这种状态持续、变重，或你为了避免不适不断缩小自己的生活范围，可以把记录带给专业人员一起看。"]]
    ]
  },
  {
    key: "low-mood",
    icon: "☾",
    tag: "情绪与低落",
    title: "低落、没兴趣，也值得被看见",
    dek: "情绪低落不只是‘想开点’。持续的低落、兴趣减少、精力和睡眠变化，可能需要更多支持与专业评估。",
    sourceTitle: "What is depression? · Mental Health America",
    sourceUrl: "https://screening.mhanational.org/content/what-depression/",
    sections: [
      ["先看持续时间和影响", ["偶尔难过是生活的一部分；如果低落或失去兴趣持续存在，并影响照顾自己、工作学习、关系或睡眠，建议认真记录并考虑求助。", "身体疾病、药物、睡眠问题或其他心理状态也可能带来类似表现，所以不要只凭一个分数下结论。"]],
      ["关于自伤念头", ["如果你出现与死亡或伤害自己有关的想法，这一项需要被认真对待，但单独一项不能判断是否存在迫在眉睫的危险。若你现在担心自己可能受伤，请立即联系当地紧急服务、心理援助热线，或告诉一位信任的人。中国大陆可拨打 12356；紧急情况拨打 120 / 110。"]]
    ]
  }
];
function renderArticleLibrary() {
  var container = document.getElementById("article-library");
  if (!container) return;
  container.innerHTML = articleLibrary.map(function (article, index) {
    return '<button class="article-card" data-article="' + article.key + '" style="--card-index:' + index + '"><span class="article-card-icon">' + article.icon + '</span><span class="article-card-tag">' + article.tag + '</span><strong>' + article.title + '</strong><p>' + article.dek + '</p><span class="article-card-cta">站内阅读 <b>→</b></span></button>';
  }).join("");
}
function openArticle(key) {
  var article = articleLibrary.find(function (item) { return item.key === key; });
  var reader = document.getElementById("article-reader");
  if (!article || !reader) return;
  reader.innerHTML = '<div class="article-reader-top"><span class="article-card-tag">' + article.tag + '</span><span class="mono-label">原创中文整理</span></div><h1>' + article.title + '</h1><p class="article-dek">' + article.dek + '</p><div class="article-rule"></div>' + article.sections.map(function (section) { return '<section><h2>' + section[0] + '</h2>' + section[1].map(function (paragraph) { return '<p>' + paragraph + '</p>'; }).join(""); }).join("") + '<aside class="article-safety"><strong>请把它当作理解线索，不是诊断结论</strong><p>如果症状持续、影响生活，或你担心自己无法保证安全，请联系专业人员或当地支持资源。</p></aside><footer class="article-source"><span>内容根据公开资料重新组织，保留原始来源供进一步阅读。</span><a href="' + article.sourceUrl + '" target="_blank" rel="noreferrer">' + article.sourceTitle + ' ↗</a></footer>';
  showView("articles");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

var selfHelpTools = [
  { key: "ground", icon: "◎", need: "心跳快、脑子停不下来", title: "先落回此刻", duration: "2 分钟", summary: "把注意力从脑内警报，轻轻带回周围环境。", note: "这不是要强迫自己立刻平静；只是给大脑一个当下的锚点。", steps: [
    ["让身体找到支撑", "坐着或站着都可以。感觉脚底接触地面，注意椅子或衣物托住身体的地方。", "不需要闭眼，也不用调整呼吸。"],
    ["慢慢看一圈", "在心里说出眼前 3 个物品的颜色或形状，再听一听附近 2 种声音。", "如果不想数，可以只描述一个你注意到的细节。"],
    ["给感受一个名字", "试着说：‘我注意到自己正在感到紧张。’然后补一句：‘此刻我正在……’（例如坐在房间里、拿着手机）。", "命名感受不是否定它，而是给自己留出一点空间。"],
    ["选一个接下来的小动作", "喝口水、走到窗边，或给可信任的人发一句消息。选一个最容易开始的。", "如果紧张感没马上下降，也不代表你做错了。"]
  ]},
  { key: "worry", icon: "↗", need: "担心反复打转", title: "把担忧拆成下一步", duration: "4 分钟", summary: "区分能行动的问题与暂时无法确定的事情。", note: "目标不是把担忧压下去，而是看清现在能做的一点点。", steps: [
    ["写下一句最困扰你的担忧", "尽量写成具体的一句话，例如‘我担心周五的汇报会出错’。", "如果写不出来，也可以只选一个关键词。"],
    ["问问自己：眼下有一件可做的事吗？", "把它分成‘现在能影响’和‘现在无法确定’。不必分析得很完美。", "两边都可以成立；无法确定不等于一定会变糟。"],
    ["如果能影响，缩小成 10 分钟动作", "例如列出汇报的 3 个要点、确认一个信息，或向同事问一个具体问题。", "动作越小越好，先不要求一次解决整个问题。"],
    ["如果暂时无法影响，给它一个稍后回看的位置", "记下你准备何时再想它，然后把注意力带回手边一件具体的小事。", "这不是保证担忧会消失，而是减少它占满全部时间。"]
  ]},
  { key: "body", icon: "≈", need: "肩颈紧、身体绷着", title: "松开一个身体部位", duration: "3 分钟", summary: "从肩膀、手掌或下颌任选一处，做温和的紧张—放松。", note: "疼痛、受伤或不适时不要用力；也可以只观察，不做收紧动作。", steps: [
    ["挑一个安全、舒服的部位", "可以选双手、肩膀或下颌。注意它现在是什么感觉，不用先改变它。", "有疼痛或身体限制时，换成观察脚底或手掌温度。"],
    ["轻轻收紧 3 秒（可跳过）", "例如双手轻轻握拳，力度只用平时的一小部分，然后放开。", "如果收紧会不舒服，直接跳到下一步。"],
    ["留意放松后的变化", "感受手掌、肩膀或下颌是否有一点松动、温度或重量变化。没有变化也没关系。", "不需要追求某种特定感觉。"],
    ["再选一个小动作", "轻轻转动肩膀、伸展手指，或让下颌自然松开。然后回到正在做的事。", "任何动作都以舒服为限。"]
  ]},
  { key: "sleep", icon: "☾", need: "睡前担忧、难以入睡", title: "把今晚变得简单一点", duration: "3 分钟", summary: "减少‘必须马上睡着’的压力，给明天和今晚各留一个安排。", note: "偶尔睡不好很常见；若长期困扰或明显影响白天，建议咨询专业人员。", steps: [
    ["把明天惦记的一件事写下来", "写下你怕忘记的事情，以及明天可以处理它的大致时间。", "只写关键词也可以；不用在床上解决它。"],
    ["让环境给身体一个‘收尾’信号", "把灯光调柔和，放下会持续刺激你的内容，准备好水或明早要用的物品。", "选你做得到的一项即可。"],
    ["如果越躺越清醒，先停止努力入睡", "可以起身到昏暗、安静的地方做一件平静的事，困意回来后再回床。", "避免盯着时间反复计算还剩几小时。"],
    ["给明天一个稳定的起点", "选一个现实的起床时间，明早尽量按它开始一天。", "不必用‘补偿’或责备来处理一晚的睡眠。"]
  ]},
  { key: "approach", icon: "→", need: "因为焦虑一直在回避", title: "找到一个可承受的小靠近", duration: "4 分钟", summary: "把回避的事情拆小，先选择安全、可控的一步。", note: "只用于日常安全情境。不要用来接近真实危险；创伤相关情境或强烈惊恐时，先找专业人员一起制定计划。", steps: [
    ["选一件你最近在回避、但确实想处理的事", "把它写得具体一些，例如‘回复那条普通工作消息’，而不是‘把工作都做好’。", "如果这件事涉及真实危险，先不要做靠近练习。"],
    ["把它拆成更小的台阶", "写出 2–3 个由容易到困难的步骤。最容易的一步应该小到你愿意尝试。", "例如先打开消息、读一遍，再决定是否回复。"],
    ["挑一个今天可以尝试的台阶", "想象它带来的不适程度。如果感觉太高，就再缩小一步；不需要硬撑。", "你可以随时暂停、调整或找人陪伴。"],
    ["决定什么时候开始，以及怎么照顾自己", "选一个具体时间和地点，完成后安排一个温和的收尾动作。", "重点是练习选择，而不是证明自己不害怕。"]
  ]},
  { key: "mood", icon: "✦", need: "低落、没动力", title: "用一个小行动启动", duration: "3 分钟", summary: "不等心情完全变好，先安排一个很小、对你有意义的行动。", note: "这是自我观察与日常支持，不是抑郁治疗；持续低落或功能受影响时可寻求专业帮助。", steps: [
    ["从三类事情里选一个方向", "照顾身体（洗脸、吃点东西）、完成一件小事（收拾桌面一角）、连接他人（发条问候）。", "选最不费力的一类。"],
    ["把行动缩短到 5 分钟以内", "例如只把杯子放进水槽、站到门外呼吸几口自然空气，或发一个表情。", "做一小部分也算完成。"],
    ["给行动安排一个开始信号", "例如‘泡好茶后整理桌面两分钟’。把它放进一个已经会发生的日常时刻。", "不用等有动力才开始。"],
    ["做完后留意，而不是打分", "问自己：做之前和之后，身体或注意力有什么不同？也可以什么都没变。", "这只是收集自己的经验，不是成败测试。"]
  ]},
  { key: "support", icon: "♡", need: "想找人聊聊或寻求帮助", title: "把求助变得更容易开口", duration: "3 分钟", summary: "整理一段简短说明，带着具体问题联系可信任的人或专业人员。", note: "寻求支持不是小题大做；你可以先从最安全、最容易联系的人开始。", steps: [
    ["写下最近最困扰的一件事", "例如担忧、睡眠、情绪或回避，以及它大概持续了多久。", "不必给自己贴标签，也不用先确定原因。"],
    ["说说它对生活的影响", "例如工作学习、关系、睡眠或日常安排有什么变化。", "一个具体例子就足够开始对话。"],
    ["写一句你希望得到的帮助", "例如‘我想让你听我说十分钟’、‘能陪我预约一次咨询吗’。", "如果还不知道需要什么，可以直接说‘我现在也不太确定’。"],
    ["选择一位合适的人或服务", "可以是可信任的家人朋友、心理咨询师，或医院精神科/心理科。", "若你现在无法保证自身安全，请立刻联系紧急服务或当地心理援助热线。"]
  ]}
];
var activeExercise = null;
var activeExerciseStep = 0;
function renderSelfHelp() {
  var grid = document.getElementById("learn-grid");
  if (!grid) return;
  grid.innerHTML = selfHelpTools.map(function (tool, index) {
    return '<button class="learn-card" data-exercise="' + tool.key + '" style="--card-index:' + index + '"><span class="learn-card-icon">' + tool.icon + '</span><span class="learn-card-meta">' + tool.duration + ' · 可随时停</span><span class="learn-card-need">' + tool.need + '</span><strong>' + tool.title + '</strong><p>' + tool.summary + '</p><span class="learn-card-cta">开始这个练习 <b>→</b></span></button>';
  }).join("");
  grid.querySelectorAll("[data-exercise]").forEach(function (button) {
    button.addEventListener("click", function () { openExercise(button.dataset.exercise); });
  });
}
function openExercise(key) {
  activeExercise = selfHelpTools.find(function (tool) { return tool.key === key; });
  activeExerciseStep = 0;
  if (!activeExercise) return;
  document.getElementById("exercise-kicker").textContent = activeExercise.duration + " · " + activeExercise.need;
  document.getElementById("exercise-title").textContent = activeExercise.title;
  document.getElementById("exercise-lede").textContent = activeExercise.summary;
  document.getElementById("exercise-backdrop").hidden = false;
  document.getElementById("exercise-dialog").hidden = false;
  document.body.classList.add("dialog-open");
  renderExerciseStep();
  document.getElementById("exercise-close").focus();
}
function renderExerciseStep() {
  if (!activeExercise) return;
  var step = activeExercise.steps[activeExerciseStep];
  var total = activeExercise.steps.length;
  document.getElementById("exercise-step-label").textContent = "第 " + (activeExerciseStep + 1) + " / " + total + " 步";
  document.getElementById("exercise-progress-fill").style.width = ((activeExerciseStep + 1) / total * 100) + "%";
  document.getElementById("exercise-step-number").textContent = String(activeExerciseStep + 1).padStart(2, "0");
  document.getElementById("exercise-step-text").innerHTML = "<strong>" + step[0] + "</strong><br>" + step[1];
  document.getElementById("exercise-step-tip").textContent = step[2];
  document.getElementById("exercise-prev").disabled = activeExerciseStep === 0;
  document.getElementById("exercise-next").innerHTML = activeExerciseStep === total - 1 ? "完成练习 <span>✓</span>" : "下一步 <span>→</span>";
  document.getElementById("exercise-footer").textContent = activeExercise.note;
}
function closeExercise() {
  document.getElementById("exercise-backdrop").hidden = true;
  document.getElementById("exercise-dialog").hidden = true;
  document.body.classList.remove("dialog-open");
  activeExercise = null;
}

function renderScience() {
  var container = document.getElementById("science-table");
  container.innerHTML = '<div class="science-row science-row-head"><div>量表</div><span>用途</span><span>时间范围</span><span>来源</span></div>' + Object.keys(DEFINITIONS).map(function (key) {
    var scale = DEFINITIONS[key];
    return '<div class="science-row"><div><strong>' + scale.name + '</strong><small>' + scale.englishName + '</small></div><span>' + scale.purpose + '</span><span>' + scale.period + '</span><span>' + scale.source + '</span></div>';
  }).join("");
  var scoring = {
    gad7: "0–4 极少 / 5–9 轻度 / 10–14 中度 / 15–21 重度（Spitzer et al., 2006）",
    oasis: "0–4 亚临床 / 5–9 轻度 / 10–14 中度 / 15–20 重度（Norman et al., 2006）",
    phq9: "0–4 无明显 / 5–9 轻度 / 10–14 中度 / 15–19 中重度 / 20–27 重度（Kroenke et al., 2001）；第 9 题为自伤念头条目",
    dass21: "各分量表原始分 ×2 后分为正常、轻度、中度、重度、极重度（Lovibond & Lovibond, 1995）",
    pss10: "反向题为第 4、5、7、8 题；0–13 低 / 14–19 中 / 20–27 高 / 28–40 很高（Cohen et al., 1983）",
    isi: "0–7 无临床 / 8–14 亚临床 / 15–21 中度 / 22–28 重度（Morin et al., 1993）",
    who5: "原始分 ×4 得百分制；≤50 建议进一步评估，≤28 建议抑郁评估（WHO, 1998）"
  };
  var scoringGrid = document.getElementById("scoring-grid");
  if (scoringGrid) scoringGrid.innerHTML = Object.keys(DEFINITIONS).map(function (key) {
    return '<article class="scoring-card"><strong>' + DEFINITIONS[key].name + '</strong><p>' + scoring[key] + '</p></article>';
  }).join("");
}

function deleteAllRecords() {
  if (!getRecords().length) { toast("目前没有本地记录"); return; }
  if (window.confirm("确定删除当前浏览器中的全部筛查记录吗？此操作无法撤销。")) {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(DRAFT_KEY);
    renderHistory();
    toast("本机记录已删除");
  }
}
function attachEvents() {
  document.addEventListener("click", function (event) {
    var viewButton = event.target.closest("[data-view]");
    if (viewButton) showView(viewButton.dataset.view);
    var articleButton = event.target.closest("[data-article]");
    if (articleButton) { openArticle(articleButton.dataset.article); return; }
    var action = event.target.closest("[data-action]");
    if (!action) return;
    var name = action.dataset.action;
    if (name === "start-combined") startFlow(["gad7", "phq9"]);
    if (name === "start-quick") startFlow(["gad7"]);
    if (name === "start-full") startFlow(["gad7", "phq9", "oasis"]);
    if (name === "start-gad7") startFlow(["gad7"]);
    if (name === "start-oasis") startFlow(["oasis"]);
    if (name === "open-history") { renderHistory(); showView("history"); }
    if (name === "open-guide") startGuide();
  });
  document.getElementById("start-btn")?.addEventListener("click", function () { startFlow(["gad7", "phq9"]); });
  document.getElementById("next-btn").addEventListener("click", nextQuestion);
  document.getElementById("quit-btn").addEventListener("click", function () { clearDraft(); showView("home"); });
  document.querySelector(".back-btn")?.addEventListener("click", previousQuestion);
  document.getElementById("guide-next").addEventListener("click", function () {
    if (appState.guideStep < guideSteps.length) { appState.guideStep += 1; renderGuide(); }
    else startFlow(appState.recommendedKeys);
  });
  document.getElementById("skip-profile").addEventListener("click", finishProfile);
  document.getElementById("finish-profile").addEventListener("click", finishProfile);
  document.getElementById("save-result-btn").addEventListener("click", function () { toast("本次结果已经保存在当前设备"); renderHistory(); });
  document.getElementById("print-report-btn").addEventListener("click", function () { window.print(); });
  document.getElementById("restart-btn").addEventListener("click", function () { startFlow(appState.flowKeys); });
  document.getElementById("delete-history").addEventListener("click", deleteAllRecords);
  document.getElementById("privacy-delete").addEventListener("click", deleteAllRecords);
  document.getElementById("exercise-close").addEventListener("click", closeExercise);
  document.getElementById("exercise-backdrop").addEventListener("click", closeExercise);
  document.getElementById("exercise-prev").addEventListener("click", function () {
    if (activeExerciseStep > 0) { activeExerciseStep -= 1; renderExerciseStep(); }
  });
  document.getElementById("exercise-next").addEventListener("click", function () {
    if (!activeExercise) return;
    if (activeExerciseStep < activeExercise.steps.length - 1) { activeExerciseStep += 1; renderExerciseStep(); }
    else { closeExercise(); toast("练习已完成。记得按自己的节奏来。"); }
  });
  document.addEventListener("keydown", function (event) {
    if (!document.getElementById("checkin-view").classList.contains("active")) return;
    var count = currentOptions().length;
    if (/^[1-9]$/.test(event.key)) {
      var index = Number(event.key) - 1;
      if (index < count) { event.preventDefault(); selectAnswer(currentOptions()[index].value); }
    } else if (event.key === " " || event.key === "Enter") {
      event.preventDefault();
      if (appState.answers[currentKey()][appState.questionIndex] !== undefined) nextQuestion();
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      previousQuestion();
    }
  });
}

var bgMusic = document.getElementById("bg-music");
var musicOn = false;
var musicPreference = localStorage.getItem("anxin_music_preference") || "auto";
function syncMusicButton() {
  var button = document.getElementById("music-toggle");
  button.classList.toggle("playing", musicOn);
  button.setAttribute("aria-pressed", musicOn ? "true" : "false");
  button.setAttribute("aria-label", musicOn ? "关闭背景音乐" : "开启背景音乐");
  button.title = musicOn ? "点击静音" : "背景音乐自动尝试播放；如果浏览器拦截，可点击开启";
  button.innerHTML = musicOn ? '♫ <span>音乐开启 · 静音</span>' : '♫ <span>' + (musicPreference === "off" ? "音乐已静音" : "自动音乐") + '</span>';
}
function tryStartMusic() {
  if (!bgMusic || musicOn || musicPreference === "off") return;
  bgMusic.volume = 0;
  var promise = bgMusic.play();
  if (promise && promise.then) promise.then(function () {
    musicOn = true;
    var target = 0.18;
    var start = performance.now();
    function fade(now) {
      if (!musicOn) return;
      var progress = Math.min(1, (now - start) / 1300);
      bgMusic.volume = target * progress;
      if (progress < 1) requestAnimationFrame(fade);
    }
    requestAnimationFrame(fade);
    syncMusicButton();
  }).catch(function () { syncMusicButton(); });
}
function toggleMusic() {
  if (!bgMusic) return;
  if (musicOn) {
    bgMusic.pause(); musicOn = false;
    musicPreference = "off";
    localStorage.setItem("anxin_music_preference", musicPreference);
    syncMusicButton();
    return;
  }
  musicPreference = "on";
  localStorage.setItem("anxin_music_preference", musicPreference);
  tryStartMusic();
}
document.getElementById("music-toggle").addEventListener("click", toggleMusic);
document.addEventListener("click", function (event) {
  if (event.target.closest("#music-toggle")) return;
  tryStartMusic();
}, true);
document.addEventListener("keydown", function (event) {
  if (event.key === "Escape" && activeExercise) closeExercise();
});
bgMusic.addEventListener("ended", function () {
  musicOn = false;
  syncMusicButton();
});

document.getElementById("profile-note").addEventListener("input", function (event) { appState.profile.note = event.target.value; saveDraft(); });
renderScaleGrid();
renderScience();
renderGuide();
renderHistory();
renderSelfHelp();
renderArticleLibrary();
attachEvents();
syncMusicButton();
tryStartMusic();
if (getDraft()) toast("你有一份未完成的筛查，可以从“开始筛查”继续");
