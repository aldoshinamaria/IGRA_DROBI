/**
 * Найди пару: дроби
 * — уровни 1–6: только «копии»; 7–20: копии + пары с разными записями одной сокращённой дроби
 * — совпадение: индекс пары в колоде (pairIndex)
 */

// --- Визуал: дробь с дробной чертой (как в учебнике) ---

/**
 * @param {string} numStr
 * @param {string} denStr
 * @returns {HTMLSpanElement}
 */
function createStackedFraction(numStr, denStr) {
  const wrap = document.createElement("span");
  wrap.className = "frac";
  const num = document.createElement("span");
  num.className = "frac__num";
  num.textContent = numStr;
  const bar = document.createElement("span");
  bar.className = "frac__bar";
  bar.setAttribute("aria-hidden", "true");
  const den = document.createElement("span");
  den.className = "frac__den";
  den.textContent = denStr;
  wrap.appendChild(num);
  wrap.appendChild(bar);
  wrap.appendChild(den);
  return wrap;
}

/**
 * Разметка лицевой стороны карточки: a/b, a b/c или запись с запятой.
 * @param {string} label
 * @returns {HTMLDivElement}
 */
function buildCardLabelNode(label) {
  const s = label.trim();
  const root = document.createElement("div");
  root.className = "card-label";

  const mixed = s.match(/^(\d+)\s+(\d+)\s*\/\s*(\d+)$/);
  if (mixed) {
    const row = document.createElement("span");
    row.className = "card-label__mix";
    const whole = document.createElement("span");
    whole.className = "card-label__whole";
    whole.textContent = mixed[1];
    row.appendChild(whole);
    row.appendChild(createStackedFraction(mixed[2], mixed[3]));
    root.appendChild(row);
    return root;
  }

  const fr = s.match(/^(\d+)\s*\/\s*(\d+)$/);
  if (fr) {
    root.appendChild(createStackedFraction(fr[1], fr[2]));
    return root;
  }

  const dec = document.createElement("span");
  dec.className = "card-label__plain";
  dec.textContent = s;
  root.appendChild(dec);
  return root;
}

/**
 * Вставка в поток текста: обычные строки + \(a/b\), \(a b/c\) как дробь с чертой (для правил, подсказок).
 * @param {HTMLElement} parent
 * @param {string} text
 */
function appendTextWithInlineFractions(parent, text) {
  if (text == null || text === "") return;
  let i = 0;
  while (i < text.length) {
    const sub = text.slice(i);
    const mix = sub.match(/^(\d+)\s+(\d+)\s*\/\s*(\d+)/);
    if (mix) {
      i += mix[0].length;
      const wrap = document.createElement("span");
      wrap.className = "frac-inline-wrap";
      const whole = document.createElement("span");
      whole.className = "frac-inline-whole";
      whole.textContent = mix[1];
      wrap.appendChild(whole);
      const f = createStackedFraction(mix[2], mix[3]);
      f.classList.add("frac--inline");
      wrap.appendChild(f);
      parent.appendChild(wrap);
      continue;
    }
    const fr = sub.match(/^(\d+)\s*\/\s*(\d+)/);
    if (fr) {
      i += fr[0].length;
      const f = createStackedFraction(fr[1], fr[2]);
      f.classList.add("frac--inline");
      parent.appendChild(f);
      continue;
    }
    parent.appendChild(document.createTextNode(text[i]));
    i += 1;
  }
}

/**
 * @param {HTMLElement} el
 * @param {string} text
 */
function setRichTextWithFractions(el, text) {
  el.textContent = "";
  appendTextWithInlineFractions(el, text);
}

// --- Стартовый экран: блок «Что ты прокачаешь» ---
const START_INFO_LINES = [
  "Обыкновенные дроби — научишься быстро их узнавать",
  "Десятичные дроби — перестанешь путаться в записях",
  "Смешанные числа — начнёшь понимать их без перевода",
  "Главное — увидишь, что разные записи могут означать одно и то же",
];

function fillStartInfoList() {
  const ul = document.getElementById("infoList");
  if (!ul) return;
  ul.textContent = "";
  for (const line of START_INFO_LINES) {
    const li = document.createElement("li");
    appendTextWithInlineFractions(li, line);
    ul.appendChild(li);
  }
}

// --- Данные: 1–6 — только «копии»; 7–20 — (4 + (L−7)) пар копий + 1 пара обыкн.экв. + 1 пара обыкн./десятичная (индекс уровня в пулах) ---

/** Две копии с одной подписью (на уровнях 7+ берутся по счёту, до 17 шт. на 20 уровне). */
const POOL_IDENT = [
  ["1/2", "1/2"],
  ["3/4", "3/4"],
  ["2/5", "2/5"],
  ["1/3", "1/3"],
  ["4/5", "4/5"],
  ["2/3", "2/3"],
  ["5/6", "5/6"],
  ["7/10", "7/10"],
  ["0,5", "0,5"],
  ["1,25", "1,25"],
  ["2 1/2", "2 1/2"],
  ["1 1/4", "1 1/4"],
  ["3/10", "3/10"],
  ["1/6", "1/6"],
  ["5/8", "5/8"],
  ["1/8", "1/8"],
  ["4/7", "4/7"],
];

/** Две обыкновенные записи одной сокращённой дроби (по уровням 7–20 — свой индекс 0..13). */
const POOL_EQUIV = [
  ["1/2", "2/4"],
  ["1/3", "2/6"],
  ["2/3", "4/6"],
  ["3/4", "6/8"],
  ["2/5", "4/10"],
  ["3/5", "6/10"],
  ["1/4", "2/8"],
  ["1/5", "2/10"],
  ["5/8", "10/16"],
  ["3/2", "6/4"],
  ["1/6", "2/12"],
  ["5/6", "10/12"],
  ["4/7", "8/14"],
  ["3/7", "6/14"],
];

/** Обыкновенная дробь = десятичная (запятая), пары с конечной десятичной (индекс как у уровня 7–20). */
const POOL_FRAC_DECIMAL = [
  ["1/2", "0,5"],
  ["1/4", "0,25"],
  ["3/4", "0,75"],
  ["1/5", "0,2"],
  ["2/5", "0,4"],
  ["3/10", "0,3"],
  ["1/8", "0,125"],
  ["7/8", "0,875"],
  ["1/20", "0,05"],
  ["3/20", "0,15"],
  ["1/25", "0,04"],
  ["2/25", "0,08"],
  ["1/50", "0,02"],
  ["3/50", "0,06"],
];

function countWordN(n, one, few, many) {
  const m = n % 10;
  const mm = n % 100;
  if (mm >= 11 && mm <= 14) return many;
  if (m === 1) return one;
  if (m >= 2 && m <= 4) return few;
  return many;
}

/**
 * Копирайт экрана перед уровнем (20 шт.). Механика задаётся в buildAllRounds по номеру L.
 */
const LEVEL_INTRO_COPY = [
  {
    title: "Разминка: одинаковые дроби",
    shortDesc: "Начнём с простого. Найди полностью одинаковые карточки.",
    rules: "Одинаковая запись = правильная пара",
  },
  {
    title: "Внимание к деталям",
    shortDesc: "Карточек стало больше — теперь важно не торопиться.",
    rules: "Пары всё ещё одинаковые, но найти их сложнее",
  },
  {
    title: "Одинаково по значению",
    shortDesc: "Поле шире — тренируй внимание: пока ищи пары с буквально одинаковой подписью (дальше придут и «разные, но равные» записи).",
    rules: "Полное совпадение текста на обеих карточках — та же запятая, те же цифры",
  },
  {
    title: "Дроби vs десятичные",
    shortDesc: "Сетка плотнее. Пока все пары — «копии»: одна и та же надпись на двух карточках.",
    rules: "Две карточки в паре должны совпадать посимвольно, включая форму дроби и запятую",
  },
  {
    title: "Смешанные числа",
    shortDesc: "Встречаются и обычные, и десятичные, и смешанные — но правило одно: ищи две абсолютно одинаковые подписи.",
    rules: "Совпадает только полный дубль текста (как две копии из одного набора)",
  },
  {
    title: "Перед смысловыми парами",
    shortDesc: "Финал первой серии: максимум «копий» на поле. Следом начнутся пары, где важен смысл, а не только одинаковый текст.",
    rules: "Как в разминке: верная пара = две идентичные подписи",
  },
  {
    title: "Новая глава: значения, а не только буквы",
    shortDesc: "Появляются «копии» плюс две смысловые пары: обыкновенные с разным видом и одна запись с запятой. Всё заранее сверено математикой.",
    rules: "«Копии» — по тексту; две другие пары заданы в колоде (сокращение и дробь = десятичная)",
  },
  {
    title: "Темп растёт — и копий больше",
    shortDesc: "Каждый такой уровень добавляет ещё одну пару-копию и новые примеры для сокращения и запятой.",
    rules: "Те же три типа пар: копии, сокращаемые обыкновенные, дробь и десятичная",
  },
  {
    title: "Синхронизация глаз и головы",
    shortDesc: "Переключайся между «визуальным дублем» и «разные наряды — одно число».",
    rules: "Ищи пару по задумке уровня: копия, сокращение или дробь/запятая",
  },
  {
    title: "Плотность — твой друг",
    shortDesc: "Больше карточек — больше шанс запутаться. Дыши ровно, открывай дуо осознанно.",
    rules: "Колода снова микс: копии + две смысловых пары уровня",
  },
  {
    title: "Середина пути",
    shortDesc: "Ты уже проходил сотни открытий. Доверяй схеме: сначала копии, потом «невидимки»-значения.",
    rules: "Совпадения только между предусмотренными парами в наборе",
  },
  {
    title: "Режим внимания максимум",
    shortDesc: "Поле XXL. Запоминай не только цифры, а тип записи: дробь, запятая, смешанное.",
    rules: "Три логики пар на уровне: копия / сокращение / обыкн. = десятичная",
  },
  {
    title: "Без паники на большом поле",
    shortDesc: "Путаница — нормальная. Игра учит отличать «один в один» от «одно и то же по смыслу».",
    rules: "Карточки с одинаковым pair-заданием в колоде — твой ориентир (не путай с чужой парой)",
  },
  {
    title: "Почти на максимуме",
    shortDesc: "Копий в разы больше, чем в первом «тройничке» 7-го — держи концентрацию на длинной дистанции.",
    rules: "Смысл уровня неизменен: копии + 2 смысловых пары, но объём копий выше",
  },
  {
    title: "Стабильный ритм",
    shortDesc: "Ты знаешь правила. Осталось не жать «наудачу», а играть планом.",
    rules: "Правило не меняется — меняется только сколько карт-«клонов»",
  },
  {
    title: "Перед последним рывком",
    shortDesc: "Ещё пара уровней — и ты в финальной лиге. Сохрани точность кликов.",
    rules: "Как на 7+ уровнях: копии, затем пары с разным видом и с запятой",
  },
  {
    title: "Плоть от плоти дроби",
    shortDesc: "Мало места на ошибку: поле большое, зато ты уже не новичок.",
    rules: "Следуй подсказке уровня в правилах — механика та же, масштаб больше",
  },
  {
    title: "Предфинал",
    shortDesc: "Следующий заход — корона серии. Собери фокус в кулак.",
    rules: "Сокращаемая пара и «дробь = 0,…» в том же духе, что и раньше",
  },
  {
    title: "Почти всё, что умеет игра",
    shortDesc: "Проверь себя: столько же смыслов, но копий почти максимум.",
    rules: "Сопоставляй пары, которые задумал уровень — не произвольные «похожие»",
  },
  {
    title: "Мастер дробей",
    shortDesc: "Теперь всё вперемешку в масштабе. Только понимание, где копия, а где смысл, доведёт до конца.",
    rules: "Совпадают значения и заданные соответствия, а не произвольные «почти»",
  },
];

function buildAllRounds() {
  const out = [];
  for (let L = 1; L <= 6; L++) {
    const numPairs = L + 2;
    const meta = LEVEL_INTRO_COPY[L - 1];
    const pairs = POOL_IDENT.slice(0, numPairs).map((p) => [p[0], p[1]]);
    out.push({
      id: L,
      levelType: "identical",
      equivCount: 0,
      numPairs,
      title: meta.title,
      shortDesc: meta.shortDesc,
      rules: meta.rules,
      pairs,
    });
  }
  for (let L = 7; L <= 20; L++) {
    const copyCount = 4 + (L - 7);
    const k = L - 7;
    const ident = POOL_IDENT.slice(0, copyCount).map((p) => [p[0], p[1]]);
    const pairOrd = POOL_EQUIV[k];
    const pairDec = POOL_FRAC_DECIMAL[k];
    const pairs = ident.concat([pairOrd], [pairDec]);
    const n = pairs.length;
    const meta = LEVEL_INTRO_COPY[L - 1];
    out.push({
      id: L,
      levelType: "mixed",
      copyPairCount: copyCount,
      hasOrdinaryEquiv: true,
      hasFracDecimal: true,
      numPairs: n,
      title: meta.title,
      shortDesc: meta.shortDesc,
      rules: `${meta.rules} Всего ${n} ${countWordN(n, "пара", "пары", "пар")} (${n * 2} карт), из них ${copyCount} с полным дублем текста.`,
      pairs,
    });
  }
  return out;
}

const ROUNDS = buildAllRounds();

const ROUND_MOTIVATION = [
  "Отлично! Ты включился в игру 🔥",
  "Класс! Внимательность растёт 💪",
  "Вот это уровень! Ты начинаешь понимать дроби 🧠",
  "Супер! Теперь дроби тебя не запутают 🚀",
  "Очень сильно! Ты уже на уровне выше среднего 👏",
  "Ты видишь систему, а не просто цифры 🔥",
  "Смысловые пары в деле: сокращение и запятая — ты справился!",
  "Поле плотнее, примеры новые, логика та же. Дальше!",
  "Ты уже жмёшь не удачу, а умение. Так держать.",
  "Копий больше — фокус тоже. Середина пути близко.",
  "Смешанные, десятичные, обычные — и всё в одной голове.",
  "Сокращаемая пара? Десятичная? Ты нащупываешь схему.",
  "Плотная сетка — не помеха, если есть план на пару.",
  "Каждый уровень — новая порция примеров, тот же навык.",
  "Ты отличаешь дубль текста от «близнеца» по смыслу. Класс.",
  "Темп растёт — и уверенность вместе с ним.",
  "Ещё чуть-чуть — и поле максимального размера по копиям.",
  "Длинные уровни — как настоящий экзамен на внимание.",
  "Предфинал: собери волю в кулак, осталось совсем немного.",
  "Ты видишь систему, а не просто цифры 🔥 Все 20 — в кармане.",
];

/** Короткие реакции при угадывании / промахе (микро-фразы). */
const TOAST_OK = [
  "Есть контакт 🔥",
  "Отличный ход 👌",
  "Верно! Значения совпали",
  "Красиво найдено!",
];
const TOAST_FAIL = [
  "Почти! Попробуй ещё раз",
  "Не пара, но ты близко",
  "Смотри на значение, а не только на запись",
  "Ещё одна попытка — и получится",
];
let gameToastTimer = 0;
const TOAST_MS = 1650;

const LS_KEY = "findPairFractionsBestV2";

// --- Утилиты ---

function shuffleInPlace(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function buildDeckFromRound(round) {
  const cards = [];
  let id = 0;
  round.pairs.forEach((pair, pairIndex) => {
    const a = pair[0];
    const b = pair[1];
    cards.push({ id: id++, label: a, pairIndex });
    cards.push({ id: id++, label: b, pairIndex });
  });
  return shuffleInPlace(cards);
}

function formatTime(ms) {
  const t = Math.floor(ms / 1000);
  const m = Math.floor(t / 60);
  const s = t % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function loadBest() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function saveBestIfBetter({ timeMs, moves }) {
  const prev = loadBest();
  const candidate = { timeMs, moves, at: new Date().toISOString() };
  if (!prev) {
    localStorage.setItem(LS_KEY, JSON.stringify(candidate));
    return true;
  }
  if (timeMs < prev.timeMs || (timeMs === prev.timeMs && moves < prev.moves)) {
    localStorage.setItem(LS_KEY, JSON.stringify(candidate));
    return true;
  }
  return false;
}

function bestDescription() {
  const b = loadBest();
  if (!b) return "ещё нет";
  return `${formatTime(b.timeMs)}, ходов: ${b.moves}`;
}

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function showGameToast(message) {
  const el = document.getElementById("gameToast");
  if (!el) return;
  el.textContent = message;
  el.hidden = false;
  el.classList.add("game-toast--visible");
  if (gameToastTimer) clearTimeout(gameToastTimer);
  gameToastTimer = setTimeout(() => {
    el.classList.remove("game-toast--visible");
    el.hidden = true;
    gameToastTimer = 0;
  }, TOAST_MS);
}

// --- Состояние игры ---

const SCREENS = {
  start: "screenStart",
  intro: "screenRoundIntro",
  play: "screenPlay",
  roundEnd: "screenRoundEnd",
  victory: "screenVictory",
  encourage: "screenEncourage",
};

/** @type {"start"|"roundIntro"|"play"|"roundEnd"|"victory"|"encourage"} */
let gamePhase = "start";
let currentRound = 0;
let deck = [];
const roundMeta = { gameAccum: 0, roundAccum: 0 };
let rafId = 0;
let lastTick = 0;
let isPaused = false;
let gameMovesTotal = 0;
let roundMoves = 0;
let opened = [];
const MATCH_DELAY_WRONG = 850;

let isCheckingPair = false;

// --- Фейерверк (успех уровня / победа) ---

let fxRaf = 0;
let fxParticles = [];
let fxT0 = 0;
let fxOnResize = null;
let fxCtx = null;
let fxCanv = null;

function stopFireworks() {
  if (fxRaf) cancelAnimationFrame(fxRaf);
  fxRaf = 0;
  fxParticles = [];
  if (fxOnResize) {
    window.removeEventListener("resize", fxOnResize);
    fxOnResize = null;
  }
  if (fxCanv) {
    const c = fxCanv;
    const g = c.getContext("2d");
    g.clearRect(0, 0, c.width, c.height);
    fxCanv = null;
    fxCtx = null;
  } else {
    document.querySelectorAll(".fx-canvas").forEach((c) => {
      const g = c.getContext("2d");
      g.clearRect(0, 0, c.width, c.height);
    });
  }
}

function syncFxSize(canvas) {
  const s = canvas.parentElement;
  const w = s.clientWidth || window.innerWidth;
  const h = s.clientHeight || window.innerHeight;
  canvas.width = w;
  canvas.height = h;
  return w;
}

function startFireworks(canvas) {
  stopFireworks();
  if (!canvas) return;
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
  fxCanv = canvas;
  syncFxSize(canvas);
  fxCtx = canvas.getContext("2d");
  const burst = (cx, cy) => {
    for (let i = 0; i < 55; i++) {
      const ang = Math.random() * Math.PI * 2;
      const v = 2.2 + Math.random() * 4.2;
      const hue = 200 + Math.random() * 160;
      fxParticles.push({
        x: cx,
        y: cy,
        vx: Math.cos(ang) * v,
        vy: Math.sin(ang) * v - 1.8,
        g: 0.14,
        life: 1,
        hue,
      });
    }
  };
  for (let k = 0; k < 5; k++) {
    setTimeout(() => {
      if (!fxCtx || !fxCanv) return;
      const w = fxCanv.width;
      const h = fxCanv.height;
      burst(w * (0.15 + Math.random() * 0.7), h * (0.12 + Math.random() * 0.3));
    }, k * 350);
  }
  fxT0 = performance.now();
  fxOnResize = () => {
    if (fxCanv) syncFxSize(fxCanv);
  };
  window.addEventListener("resize", fxOnResize, { passive: true });

  const frame = (now) => {
    if (!fxCtx || !fxCanv) return;
    if (now - fxT0 > 4200) {
      stopFireworks();
      return;
    }
    const w = fxCanv.width;
    const h = fxCanv.height;
    const ctx = fxCtx;
    ctx.clearRect(0, 0, w, h);
    for (const p of fxParticles) {
      p.vy += p.g;
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 0.01;
      if (p.life > 0) {
        const r = 2 + 2 * p.life;
        ctx.fillStyle = `hsla(${p.hue}, 90%, 58%, ${Math.min(1, p.life * 1.1)})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    fxParticles = fxParticles.filter((p) => p.life > 0.02);
    fxRaf = requestAnimationFrame(frame);
  };
  fxRaf = requestAnimationFrame(frame);
}

// --- Подсказка при уходе с уровня незавершённым ---
let encourageNext = null;

function showEncourageNext(fn) {
  encourageNext = fn;
  gamePhase = "encourage";
  showOnlyScreen("encourage");
}

function runEncourageNext() {
  const fn = encourageNext;
  encourageNext = null;
  if (fn) fn();
}

function showOnlyScreen(key) {
  stopFireworks();
  for (const el of document.querySelectorAll(".screen")) {
    el.hidden = el.id !== SCREENS[key];
  }
  if (key === "roundEnd" || key === "victory") {
    requestAnimationFrame(() => {
      const elId = key === "roundEnd" ? "fxRoundEnd" : "fxVictory";
      const c = document.getElementById(elId);
      if (c) startFireworks(c);
    });
  }
}

function goStart() {
  gamePhase = "start";
  currentRound = 0;
  stopTimerLoop();
  showOnlyScreen("start");
}

function goRoundIntro(n) {
  currentRound = n;
  const r = ROUNDS[n];
  gamePhase = "roundIntro";
  document.getElementById("introRoundIndex").textContent = `Уровень ${n + 1} из ${ROUNDS.length}`;
  document.getElementById("introTitle").textContent = r.title;
  setRichTextWithFractions(document.getElementById("introDesc"), r.shortDesc);
  setRichTextWithFractions(document.getElementById("introRules"), r.rules);
  const hint =
    r.levelType === "identical"
      ? "Совпадение — когда на обеих карточках дословно один и тот же текст. Дробь, запятая, пробелы — как на дубликате."
      : "Помни: есть «копии» (один текст) и пары, где смысл совпал — сокращение обычных дробей и запись с запятой. Всё заранее согласовано с правилами уровня.";
  setRichTextWithFractions(document.getElementById("introHint"), hint);
  updateProgressDots();
  showOnlyScreen("intro");
}

function beginRoundPlay() {
  const r = ROUNDS[currentRound];
  gamePhase = "play";
  roundMeta.roundAccum = 0;
  document.getElementById("statTimeRound").textContent = formatTime(0);
  deck = buildDeckFromRound(r);
  opened = [];
  isCheckingPair = false;
  roundMoves = 0;
  showOnlyScreen("play");
  document.getElementById("playRoundTitle").textContent = r.title;
  document.getElementById("statRound").textContent = `${currentRound + 1} / ${ROUNDS.length}`;
  document.getElementById("statMovesRound").textContent = String(roundMoves);
  document.getElementById("statMovesTotal").textContent = String(gameMovesTotal);
  updateProgressDots();
  renderBoard();
  if (!isPaused) {
    startTimerLoopFreshRound();
  }
  const n = deck.length;
  const board = document.getElementById("board");
  board.className = "board";
  if (n >= 12) board.classList.add("board--n12");
  if (n >= 16) board.classList.add("board--n16");
  if (n >= 20) board.classList.add("board--n20");
  if (n >= 24) board.classList.add("board--n24");
  if (n >= 32) board.classList.add("board--n32");
  if (n >= 40) board.classList.add("board--n40");
}

function startTimerLoopFreshRound() {
  lastTick = performance.now();
  if (rafId) cancelAnimationFrame(rafId);
  const tick = (now) => {
    rafId = requestAnimationFrame(tick);
    if (gamePhase !== "play" && gamePhase !== "roundIntro") return;
    if (gamePhase === "roundIntro" || isPaused) {
      lastTick = now;
      return;
    }
    const d = now - lastTick;
    lastTick = now;
    if (d <= 0) return;
    roundMeta.gameAccum += d;
    roundMeta.roundAccum += d;
    document.getElementById("statTimeRound").textContent = formatTime(roundMeta.roundAccum);
    document.getElementById("statTimeGame").textContent = formatTime(roundMeta.gameAccum);
  };
  rafId = requestAnimationFrame(tick);
}

function stopTimerLoop() {
  if (rafId) {
    cancelAnimationFrame(rafId);
    rafId = 0;
  }
}

function updateProgressDots() {
  const dots = document.querySelectorAll(".progress__dot");
  dots.forEach((dot, i) => {
    dot.classList.remove("progress__dot--done", "progress__dot--current");
    if (i < currentRound) dot.classList.add("progress__dot--done");
    if (i === currentRound) dot.classList.add("progress__dot--current");
  });
}

function renderBoard() {
  const board = document.getElementById("board");
  board.innerHTML = "";
  const frag = document.createDocumentFragment();
  deck.forEach((c, index) => {
    const li = document.createElement("li");
    li.className = "card-wrap";
    li.dataset.index = String(index);
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "card";
    btn.setAttribute("aria-pressed", "false");
    btn.setAttribute("aria-label", "Карточка, значение: " + c.label);
    const innerB = document.createElement("div");
    innerB.className = "card__inner card__face--back";
    innerB.setAttribute("aria-hidden", "true");
    innerB.textContent = "?";
    const innerF = document.createElement("div");
    innerF.className = "card__inner card__face--front";
    innerF.appendChild(buildCardLabelNode(c.label));
    btn.appendChild(innerB);
    btn.appendChild(innerF);
    btn.addEventListener("click", () => onCardClick(index), { passive: true });
    li.appendChild(btn);
    frag.appendChild(li);
  });
  board.appendChild(frag);
  const br = ROUNDS[currentRound];
  const hint = document.getElementById("boardHint");
  if (br.levelType === "identical") {
    hint.textContent = "Ищи две карточки с дословно одинаковой подписью. Открывай по две штуки.";
  } else {
    const pw = countWordN(br.copyPairCount, "пара", "пары", "пар");
    hint.textContent = `«Копии»: ${br.copyPairCount} ${pw} с одним текстом. Ещё пара с обычными дробями (одна сокращается в другую) и пара «дробь ↔ запятая». Ход — две карточки.`;
  }
}

function onCardClick(index) {
  if (gamePhase !== "play" || isPaused) return;
  if (isCheckingPair) return;
  const c = document.querySelector(`.card-wrap[data-index="${index}"] .card`);
  if (!c || c.classList.contains("card--matched")) return;
  if (c.classList.contains("card--flipped")) return;

  c.classList.add("card--flipped");
  c.setAttribute("aria-pressed", "true");
  opened.push(index);

  if (opened.length < 2) return;

  const i0 = opened[0];
  const i1 = opened[1];
  const ok = deck[i0].pairIndex === deck[i1].pairIndex;

  isCheckingPair = true;
  roundMoves += 1;
  gameMovesTotal += 1;
  document.getElementById("statMovesRound").textContent = String(roundMoves);
  document.getElementById("statMovesTotal").textContent = String(gameMovesTotal);
  if (ok) {
    showGameToast(pickRandom(TOAST_OK));
    [i0, i1].forEach((ix) => {
      const el = document.querySelector(`.card-wrap[data-index="${ix}"] .card`);
      el.classList.add("card--matched");
    });
    opened = [];
    isCheckingPair = false;
    if (isRoundComplete()) {
      setTimeout(() => showRoundComplete(), 500);
    }
  } else {
    showGameToast(pickRandom(TOAST_FAIL));
    [i0, i1].forEach((ix) => {
      const el = document.querySelector(`.card-wrap[data-index="${ix}"] .card`);
      el.classList.add("card--error");
    });
    setTimeout(() => {
      [i0, i1].forEach((ix) => {
        const el = document.querySelector(`.card-wrap[data-index="${ix}"] .card`);
        el.classList.remove("card--flipped", "card--error");
        el.setAttribute("aria-pressed", "false");
      });
      opened = [];
      isCheckingPair = false;
    }, MATCH_DELAY_WRONG);
  }
}

function isRoundComplete() {
  return document.querySelectorAll(".card--matched").length === deck.length;
}

function showRoundComplete() {
  gamePhase = "roundEnd";
  stopTimerLoop();
  document.getElementById("roundEndPhrase").textContent = ROUND_MOTIVATION[currentRound] || "Молодец!";
  document.getElementById("reTime").textContent = formatTime(roundMeta.roundAccum);
  document.getElementById("reMoves").textContent = String(roundMoves);
  showOnlyScreen("roundEnd");
}

function goNextFromRoundEnd() {
  if (currentRound < ROUNDS.length - 1) {
    goRoundIntro(currentRound + 1);
  } else {
    showVictory();
  }
}

function showVictory() {
  gamePhase = "victory";
  stopTimerLoop();
  const timeMs = roundMeta.gameAccum;
  const isNewRecord = saveBestIfBetter({ timeMs, moves: gameMovesTotal });
  document.getElementById("vTime").textContent = formatTime(timeMs);
  document.getElementById("vMoves").textContent = String(gameMovesTotal);
  document.getElementById("vBest").textContent = bestDescription();
  setRichTextWithFractions(
    document.getElementById("victoryFracLine"),
    "Теперь 1/2, 2/4 и 0,5 для тебя — одно и то же.",
  );
  const rec = document.getElementById("victoryRecord");
  if (rec) {
    if (isNewRecord) {
      rec.hidden = false;
      rec.textContent =
        "Это сейчас твой лучший зачёт в этом браузере. Попробуй побить его ещё раз.";
    } else {
      rec.hidden = true;
      rec.textContent = "";
    }
  }
  showOnlyScreen("victory");
}

function resetGameStateForNewRun() {
  currentRound = 0;
  gameMovesTotal = 0;
  roundMeta.gameAccum = 0;
  roundMeta.roundAccum = 0;
  isPaused = false;
}

// --- События UI ---

document.getElementById("btnStartGame").addEventListener("click", () => {
  resetGameStateForNewRun();
  goRoundIntro(0);
});

document.getElementById("btnBeginRound").addEventListener("click", () => {
  beginRoundPlay();
});

document.getElementById("btnNextRound").addEventListener("click", goNextFromRoundEnd);

document.getElementById("btnVictoryHome").addEventListener("click", () => {
  goStart();
});

document.getElementById("btnVictoryFast").addEventListener("click", () => {
  resetGameStateForNewRun();
  currentRound = 0;
  beginRoundPlay();
});

document.getElementById("btnVictoryReshuffle").addEventListener("click", () => {
  resetGameStateForNewRun();
  goRoundIntro(0);
});

document.getElementById("btnPause").addEventListener("click", () => {
  isPaused = true;
  lastTick = performance.now();
  document.getElementById("modalPause").hidden = false;
});

document.getElementById("btnResume").addEventListener("click", () => {
  isPaused = false;
  lastTick = performance.now();
  document.getElementById("modalPause").hidden = true;
});

document.getElementById("modalPause")
  .querySelector(".modal__backdrop")
  .addEventListener("click", () => {
    isPaused = false;
    lastTick = performance.now();
    document.getElementById("modalPause").hidden = true;
  });

document.getElementById("btnRestartFromGame").addEventListener("click", () => {
  if (confirm("Начать игру сначала? Текущий уровень будет сброшен.")) {
    stopTimerLoop();
    showEncourageNext(() => {
      resetGameStateForNewRun();
      goRoundIntro(0);
    });
  }
});

document.getElementById("btnEncourageOk").addEventListener("click", runEncourageNext);

document.getElementById("btnPauseToMenu").addEventListener("click", () => {
  if (!confirm("Выйти на главный экран? Текущий уровень не будет засчитан.")) return;
  document.getElementById("modalPause").hidden = true;
  isPaused = false;
  lastTick = performance.now();
  stopTimerLoop();
  showEncourageNext(() => {
    resetGameStateForNewRun();
    goStart();
  });
});

function renderProgressTrack() {
  const track = document.getElementById("roundProgress");
  if (!track) return;
  track.textContent = "";
  for (let i = 0; i < ROUNDS.length; i++) {
    const dot = document.createElement("span");
    dot.className = "progress__dot";
    dot.dataset.r = String(i);
    track.appendChild(dot);
  }
}

renderProgressTrack();
fillStartInfoList();