// ============= DATA =============
const PUMP_SVG = `<svg viewBox="0 0 28 28" width="24" height="24" fill="#fff">
  <path d="M7 26V8.5C7 6 8.8 4 11.2 4h5.6C19.2 4 21 6 21 8.5V26z"/>
  <rect x="9" y="12.5" width="10" height="2" rx="0.6" fill="#1a3a6a"/>
  <rect x="5.5" y="25" width="17" height="2" rx="1"/>
  <circle cx="14" cy="6" r="2.2"/>
  <path d="M21 9.5h2.2c1.1 0 2 0.9 2 2v8c0 0.7 0.6 1.3 1.3 1.3s1.3-0.6 1.3-1.3v-7" fill="none" stroke="#fff" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;
const FIRE_SVG = `<svg viewBox="0 0 28 28" width="24" height="24" fill="#fff">
  <path d="M16 2c0.5 3-1.8 4.5-1.8 7.5 0 1.6 1.2 2.6 2.4 2.6 1 0 1.8-0.6 1.8-1.6 0-0.6-0.3-1-0.6-1.4 1.6 0.5 3.4 2.4 3.4 5.4 0 3.6-3 6.5-7 6.5s-7-2.9-7-6.5c0-2.6 1.5-4.5 3.4-5.6 0.4 1.4-0.4 2.4 0.4 3.4 0.6 0.6 1.6 0.4 1.6-0.6 0-1.4-0.6-2.6 0-4.4 0.7-2 2.4-3.4 3.4-5.3z"/>
  <path d="M6 16c-0.6 0.8-1 2-1 3.2 0 2.4 2 4.4 4.4 4.4 0.8 0 1.5-0.2 2-0.5-2.4-0.6-4.2-2.6-4.4-5.1-0.1-0.7-0.4-1.4-1-2z" opacity="0.85"/>
</svg>`;
const FUEL_TYPES = {
  methane: { name: 'Метан',     icon: PUMP_SVG, price: 5500,  unit: 'м³', priceLabel: '5 500 UZS / м³', factor: 0.85 },
  propane: { name: 'Пропан',    icon: FIRE_SVG, price: 6500,  unit: 'л',  priceLabel: '6 500 UZS / л',  factor: 1.10 },
  ai95:    { name: 'Бензин 95', icon: PUMP_SVG, price: 12500, unit: 'л',  priceLabel: '12 500 UZS / л', factor: 1.00 },
  ai92:    { name: 'Бензин 92', icon: PUMP_SVG, price: 11000, unit: 'л',  priceLabel: '11 000 UZS / л', factor: 1.05 },
};
const CHEVY_LOGO = `<svg viewBox="0 0 64 24" width="42" height="16"><defs><linearGradient id="chevy" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#ffe066"/><stop offset="50%" stop-color="#f5b800"/><stop offset="100%" stop-color="#a07000"/></linearGradient></defs><path d="M2 8h20l4-5h12l4 5h20l-4 4h-16l-4 5h-12l-4-5H6z" fill="url(#chevy)" stroke="#7a5a00" stroke-width="0.8"/></svg>`;
const CARS = [
  { id:'gentra', name:'Gentra',  image:'assets/gentra.png',  engine:'1.5L', power:107, tank:50, consumption:{auto:8.2,manual:7.4}, badge:'Chevrolet' },
  { id:'malibu', name:'Malibu',  image:'assets/malibu.png',  engine:'2.0L', power:250, tank:60, consumption:{auto:9.8,manual:9.0}, badge:'Chevrolet' },
  { id:'cobalt', name:'Cobalt',  image:'assets/cobalt.png',  engine:'1.5L', power:105, tank:44, consumption:{auto:7.8,manual:7.0}, badge:'Chevrolet' },
  { id:'nexia',  name:'Nexia 3', image:'assets/nexia.png',   engine:'1.5L', power:107, tank:45, consumption:{auto:7.5,manual:6.8}, badge:'Chevrolet' },
  { id:'spark',  name:'Spark',   image:'assets/spark.png',   engine:'1.2L', power:81,  tank:35, consumption:{auto:6.4,manual:5.8}, badge:'Chevrolet' },
];

// ============= STATE =============
const state = { carId:'gentra', transmission:'auto', fuel:'methane', tankPercent:50 };

// ============= HISTORY =============
function getHistory() {
  try { return JSON.parse(localStorage.getItem('fuelHistory') || '[]'); } catch { return []; }
}
function saveHistory(entry) {
  try {
    let h = getHistory();
    h.unshift(entry);
    h = h.slice(0, 10);
    localStorage.setItem('fuelHistory', JSON.stringify(h));
  } catch {}
}

// ============= VIBRATION =============
function vib(ms) { try { if (navigator.vibrate) navigator.vibrate(ms); } catch {} }

// ============= RENDER CARS =============
function renderCars() {
  const container = document.getElementById('carsScroll');
  container.innerHTML = CARS.map(car => `
    <div class="car-card ${car.id===state.carId?'active':''}" data-car="${car.id}">
      <div class="car-card-head"><span class="car-name">${car.name}</span><span class="car-logo">${CHEVY_LOGO}</span></div>
      <div class="car-image" style="background-image:url('${car.image}')"></div>
      <div class="car-meta"><strong>${car.engine}, ${car.power} hp</strong><br>${state.transmission==='auto'?'Auto':'Manual'}</div>
    </div>`).join('');
  container.querySelectorAll('.car-card').forEach(el => {
    el.addEventListener('click', () => {
      if (justDragged) return;
      vib(30);
      const prev = state.carId;
      state.carId = el.dataset.car;
      if (prev !== state.carId) animateCarChange();
      renderCars();
      update();
    });
  });
}

function animateCarChange() {
  const result = document.querySelector('.result-card');
  if (!result) return;
  result.style.transition = 'opacity 0.15s, transform 0.15s';
  result.style.opacity = '0.3';
  result.style.transform = 'translateX(-6px)';
  setTimeout(() => {
    result.style.opacity = '1';
    result.style.transform = 'translateX(0)';
  }, 160);
}

// ============= RENDER FUELS =============
function renderFuels() {
  const grid = document.getElementById('fuelGrid');
  grid.innerHTML = Object.entries(FUEL_TYPES).map(([key, f]) => `
    <div class="fuel-card ${state.fuel===key?'active':''}" data-fuel="${key}">
      <div class="fuel-icon">${f.icon}</div>
      <div class="fuel-name">${f.name}</div>
      ${state.fuel===key?`<div class="fuel-price">${f.priceLabel}</div>`:''}
    </div>`).join('');
  grid.querySelectorAll('.fuel-card').forEach(el => {
    el.addEventListener('click', () => {
      vib(25);
      state.fuel = el.dataset.fuel;
      renderFuels();
      update();
    });
  });
}

// ============= CALCULATION =============
function calculate() {
  const car = CARS.find(c => c.id === state.carId);
  const fuel = FUEL_TYPES[state.fuel];
  const consumption = car.consumption[state.transmission] * fuel.factor;
  const range = (car.tank / consumption) * 100;
  const cost = car.tank * fuel.price;
  const currentLiters = (state.tankPercent / 100) * car.tank;
  const fillLiters = car.tank - currentLiters;
  const fillCost = fillLiters * fuel.price;
  return { consumption: consumption.toFixed(1), range: Math.round(range), cost: Math.round(cost), fillLiters: fillLiters.toFixed(1), fillCost: Math.round(fillCost), car, fuel };
}

function calcMonthly(daysPerWeek, kmPerDay) {
  const car = CARS.find(c => c.id === state.carId);
  const fuel = FUEL_TYPES[state.fuel];
  const consumption = car.consumption[state.transmission] * fuel.factor;
  const kmMonth = daysPerWeek * 4.33 * kmPerDay;
  const litersMonth = (consumption / 100) * kmMonth;
  const costMonth = litersMonth * fuel.price;
  const baseConsumption = car.consumption[state.transmission];
  const litersBase = (baseConsumption / 100) * kmMonth;
  const costBase = litersBase * FUEL_TYPES.ai95.price;
  const saving = costBase - costMonth;
  return { kmMonth: Math.round(kmMonth), litersMonth: litersMonth.toFixed(1), costMonth: Math.round(costMonth), saving: Math.round(saving) };
}

// ============= FORMAT =============
function fmt(n) { return n.toLocaleString('ru-RU').replace(/,/g, ' '); }

// ============= UPDATE UI =============
function update() {
  const r = calculate();
  const consumEl = document.getElementById('consumptionValue');
  if (consumEl && consumEl.textContent !== r.consumption) {
    consumEl.textContent = r.consumption;
    consumEl.classList.remove('flash'); void consumEl.offsetWidth; consumEl.classList.add('flash');
  }
  const el = id => document.getElementById(id);
  if (el('rangeValue'))       el('rangeValue').textContent = `${r.range} км`;
  if (el('tripCost'))         el('tripCost').textContent   = `${fmt(r.cost)} UZS`;
  if (el('specEngine'))       el('specEngine').textContent  = r.car.engine;
  if (el('specPower'))        el('specPower').textContent   = `${r.car.power} л.с.`;
  if (el('specTank'))         el('specTank').textContent    = `${r.car.tank} л`;
  if (el('specConsumption'))  el('specConsumption').textContent = `${r.consumption} л/100км`;
  if (el('fillLiters'))  el('fillLiters').textContent  = `${r.fillLiters} л`;
  if (el('fillCost'))    el('fillCost').textContent     = `${fmt(r.fillCost)} UZS`;
  updateMonthly();
}

function updateMonthly() {
  const dInput = document.getElementById('monthDays');
  const kInput = document.getElementById('monthKm');
  if (!dInput || !kInput) return;
  const d = parseInt(dInput.value) || 5;
  const k = parseInt(kInput.value) || 25;
  const m = calcMonthly(d, k);
  const el = id => document.getElementById(id);
  if (el('mKm'))     el('mKm').textContent     = `${fmt(m.kmMonth)} км`;
  if (el('mLiters')) el('mLiters').textContent = `${m.litersMonth} л`;
  if (el('mCost'))   el('mCost').textContent   = `${fmt(m.costMonth)} UZS`;
  if (el('mSaving')) {
    el('mSaving').textContent = m.saving > 0 ? `−${fmt(m.saving)} UZS` : `+${fmt(Math.abs(m.saving))} UZS`;
    el('mSaving').style.color = m.saving > 0 ? 'var(--neon-green)' : 'var(--neon-orange)';
  }
}

// ============= TANK SLIDER =============
function initTankSlider() {
  const slider = document.getElementById('tankSlider');
  const pct = document.getElementById('tankPct');
  if (!slider) return;
  slider.value = state.tankPercent;
  if (pct) pct.textContent = `${state.tankPercent}%`;
  slider.addEventListener('input', () => {
    state.tankPercent = parseInt(slider.value);
    if (pct) pct.textContent = `${state.tankPercent}%`;
    update();
  });
}

// ============= SHARE =============
function shareResult() {
  const r = calculate();
  const text = `⛽ ${r.car.name} на ${r.fuel.name}\nРасход: ${r.consumption} л/100км\nЗапас хода: ${r.range} км\nПолный бак: ${fmt(r.cost)} UZS\n\nhttps://coderuz2026.github.io/fuel-calculator/`;
  if (navigator.share) {
    navigator.share({ title: 'Fuel Calculator UZ', text }).catch(() => copyToClipboard(text));
  } else {
    copyToClipboard(text);
  }
}
function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => showToast('Скопировано!')).catch(() => showToast('Не удалось скопировать'));
}
function showToast(msg) {
  let t = document.getElementById('toast');
  if (!t) { t = document.createElement('div'); t.id='toast'; document.body.appendChild(t); }
  t.textContent = msg; t.className = 'toast show';
  setTimeout(() => t.classList.remove('show'), 2500);
}

// ============= HISTORY UI =============
function renderHistory() {
  const list = document.getElementById('historyList');
  if (!list) return;
  const h = getHistory();
  if (!h.length) { list.innerHTML = '<p class="hist-empty">История пуста — нажми «Сохранить» после расчёта</p>'; return; }
  list.innerHTML = h.map((entry, i) => `
    <div class="hist-item" style="animation-delay:${i*0.05}s">
      <div class="hist-top">
        <span class="hist-car">${entry.carName}</span>
        <span class="hist-fuel">${entry.fuelName}</span>
        <span class="hist-date">${entry.date}</span>
      </div>
      <div class="hist-bottom">
        <span>${entry.consumption} л/100км</span>
        <span>${entry.range} км запаса</span>
        <span class="hist-cost">${entry.cost} UZS</span>
      </div>
    </div>`).join('');
}

function addToHistory() {
  const r = calculate();
  const now = new Date();
  const dateStr = now.toLocaleDateString('ru-RU',{day:'2-digit',month:'2-digit'}) + ' ' + now.toLocaleTimeString('ru-RU',{hour:'2-digit',minute:'2-digit'});
  saveHistory({ carName: r.car.name, fuelName: r.fuel.name, consumption: r.consumption, range: r.range, cost: fmt(r.cost), date: dateStr });
  renderHistory();
  vib([30,50,30]);
  showToast('Расчёт сохранён!');
}

// ============= TABS =============
function initTabs() {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      vib(15);
      const target = btn.dataset.tab;
      const panel = document.getElementById('tab-' + target);
      if (panel) { panel.classList.add('active'); if (target === 'history') renderHistory(); if (target === 'monthly') updateMonthly(); }
    });
  });
}

// ============= DARK/LIGHT THEME =============
function initTheme() {
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
  const btn = document.getElementById('themeToggle');
  if (!btn) return;
  btn.innerHTML = prefersDark ? '☀️' : '🌙';
  btn.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    btn.innerHTML = next === 'dark' ? '☀️' : '🌙';
    vib(20);
  });
}

// ============= PWA INSTALL =============
let deferredPrompt = null;
window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault();
  deferredPrompt = e;
  const btn = document.getElementById('installBtn');
  if (btn) btn.style.display = 'flex';
});
window.addEventListener('appinstalled', () => {
  const btn = document.getElementById('installBtn');
  if (btn) btn.style.display = 'none';
  showToast('Приложение установлено! 🎉');
});
function initInstallBtn() {
  const btn = document.getElementById('installBtn');
  if (!btn) return;
  btn.addEventListener('click', () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then(() => { deferredPrompt = null; btn.style.display = 'none'; });
    } else {
      showToast('Откройте меню браузера → «Добавить на гл. экран»');
    }
  });
}

// ============= MONTHLY INPUTS =============
function initMonthlyInputs() {
  ['monthDays','monthKm'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', updateMonthly);
  });
}

// ============= DRAG TO SCROLL =============
let justDragged = false;
function bindCarsDrag() {
  const scroller = document.getElementById('carsScroll');
  if (!scroller) return;
  let isDown=false, startX=0, startLeft=0, moved=0;
  scroller.addEventListener('mousedown', e => { isDown=true; moved=0; startX=e.clientX; startLeft=scroller.scrollLeft; });
  window.addEventListener('mousemove', e => {
    if (!isDown) return;
    const dx = e.clientX - startX;
    if (Math.abs(dx) > 4) { moved=Math.abs(dx); scroller.classList.add('dragging'); scroller.scrollLeft=startLeft-dx; }
  });
  window.addEventListener('mouseup', () => {
    if (!isDown) return; isDown=false;
    if (moved > 6) { justDragged=true; setTimeout(() => { justDragged=false; }, 50); }
    scroller.classList.remove('dragging');
  });
  scroller.addEventListener('wheel', e => {
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) { e.preventDefault(); scroller.scrollLeft += e.deltaY; }
  }, { passive: false });
}

// ============= EVENTS =============
function bindTransmission() {
  document.querySelectorAll('#transmission .seg-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#transmission .seg-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active'); vib(20);
      state.transmission = btn.dataset.value;
      renderCars(); update();
    });
  });
}

// ============= SERVICE WORKER =============
function registerSW() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  }
}

// ============= INIT =============
function init() {
  registerSW();
  initTheme();
  renderCars();
  renderFuels();
  bindTransmission();
  bindCarsDrag();
  initTankSlider();
  initTabs();
  initMonthlyInputs();
  initInstallBtn();
  update();
  const shareBtn = document.getElementById('shareBtn');
  if (shareBtn) shareBtn.addEventListener('click', () => { vib([20,30,20]); shareResult(); });
  const saveBtn = document.getElementById('saveBtn');
  if (saveBtn) saveBtn.addEventListener('click', addToHistory);
}
document.addEventListener('DOMContentLoaded', init);