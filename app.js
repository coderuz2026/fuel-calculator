// ============= DATA =============
// Цены — UZS за литр / кубометр (примерные значения для Узбекистана, можно править)
// SVG иконки для типов топлива
// Топливная колонка как на референсе: белый «пистолет» с круглой головой,
// корпусом, горизонтальной полоской и шлангом-носиком справа сверху.
const PUMP_SVG = `<svg viewBox="0 0 28 28" width="24" height="24" fill="#fff">
  <!-- основной корпус колонки -->
  <path d="M7 26V8.5C7 6 8.8 4 11.2 4h5.6C19.2 4 21 6 21 8.5V26z"/>
  <!-- горизонтальная полоска -->
  <rect x="9" y="12.5" width="10" height="2" rx="0.6" fill="#1a3a6a"/>
  <!-- основание -->
  <rect x="5.5" y="25" width="17" height="2" rx="1"/>
  <!-- круглая голова сверху -->
  <circle cx="14" cy="6" r="2.2"/>
  <!-- шланг-носик справа -->
  <path d="M21 9.5h2.2c1.1 0 2 0.9 2 2v8c0 0.7 0.6 1.3 1.3 1.3s1.3-0.6 1.3-1.3v-7" fill="none" stroke="#fff" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

// Пламя как на референсе: основной язык пламени и маленький слева, белая заливка.
const FIRE_SVG = `<svg viewBox="0 0 28 28" width="24" height="24" fill="#fff">
  <!-- основной язык пламени -->
  <path d="M16 2c0.5 3-1.8 4.5-1.8 7.5 0 1.6 1.2 2.6 2.4 2.6 1 0 1.8-0.6 1.8-1.6 0-0.6-0.3-1-0.6-1.4 1.6 0.5 3.4 2.4 3.4 5.4 0 3.6-3 6.5-7 6.5s-7-2.9-7-6.5c0-2.6 1.5-4.5 3.4-5.6 0.4 1.4-0.4 2.4 0.4 3.4 0.6 0.6 1.6 0.4 1.6-0.6 0-1.4-0.6-2.6 0-4.4 0.7-2 2.4-3.4 3.4-5.3z"/>
  <!-- маленький язык слева -->
  <path d="M6 16c-0.6 0.8-1 2-1 3.2 0 2.4 2 4.4 4.4 4.4 0.8 0 1.5-0.2 2-0.5-2.4-0.6-4.2-2.6-4.4-5.1-0.1-0.7-0.4-1.4-1-2z" opacity="0.85"/>
</svg>`;

const FUEL_TYPES = {
  methane: { name: 'Метан',     icon: PUMP_SVG, price: 5500,  unit: 'м³', priceLabel: '5,500 UZS / м³',  factor: 0.85 },
  propane: { name: 'Пропан',    icon: FIRE_SVG, price: 6500,  unit: 'л',  priceLabel: '6,500 UZS / л',   factor: 1.10 },
  ai95:    { name: 'Бензин 95', icon: PUMP_SVG, price: 12500, unit: 'л',  priceLabel: '12,500 UZS / л',  factor: 1.00 },
  ai92:    { name: 'Бензин 92', icon: PUMP_SVG, price: 11000, unit: 'л',  priceLabel: '11,000 UZS / л',  factor: 1.05 },
};

// SVG логотип Chevrolet (золотой галстук-бабочка)
const CHEVY_LOGO = `<svg viewBox="0 0 64 24" width="42" height="16"><defs><linearGradient id="chevy" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#ffe066"/><stop offset="50%" stop-color="#f5b800"/><stop offset="100%" stop-color="#a07000"/></linearGradient></defs><path d="M2 8h20l4-5h12l4 5h20l-4 4h-16l-4 5h-12l-4-5H6z" fill="url(#chevy)" stroke="#7a5a00" stroke-width="0.8"/></svg>`;

// Машины — характеристики и базовый расход на бензине 95 (л/100км)
const CARS = [
  {
    id: 'gentra',
    name: 'Gentra',
    image: 'assets/gentra.png',
    engine: '1.5L',
    power: 107,
    tank: 50,
    consumption: { auto: 8.2, manual: 7.4 },
    badge: 'Chevrolet',
  },
  {
    id: 'malibu',
    name: 'Malibu',
    image: 'assets/malibu.png',
    engine: '2.0L',
    power: 250,
    tank: 60,
    consumption: { auto: 9.8, manual: 9.0 },
    badge: 'Chevrolet',
  },
  {
    id: 'cobalt',
    name: 'Cobalt',
    image: 'assets/cobalt.png',
    engine: '1.5L',
    power: 105,
    tank: 44,
    consumption: { auto: 7.8, manual: 7.0 },
    badge: 'Chevrolet',
  },
  {
    id: 'nexia',
    name: 'Nexia 3',
    image: 'assets/nexia.png',
    engine: '1.5L',
    power: 107,
    tank: 45,
    consumption: { auto: 7.5, manual: 6.8 },
    badge: 'Chevrolet',
  },
  {
    id: 'spark',
    name: 'Spark',
    image: 'assets/spark.png',
    engine: '1.2L',
    power: 81,
    tank: 35,
    consumption: { auto: 6.4, manual: 5.8 },
    badge: 'Chevrolet',
  },
];

// ============= STATE =============
const state = {
  carId: 'gentra',
  transmission: 'auto',
  fuel: 'methane',
  trip: 100,
};

// ============= RENDER =============
function renderCars() {
  const container = document.getElementById('carsScroll');
  container.innerHTML = CARS.map((car) => `
    <div class="car-card ${car.id === state.carId ? 'active' : ''}" data-car="${car.id}">
      <div class="car-card-head">
        <span class="car-name">${car.name}</span>
        <span class="car-logo">${CHEVY_LOGO}</span>
      </div>
      <div class="car-image" style="background-image:url('${car.image}')"></div>
      <div class="car-meta">
        <strong>${car.engine}, ${car.power} hp</strong><br />
        ${state.transmission === 'auto' ? 'Auto' : 'Manual'}
      </div>
    </div>
  `).join('');

  container.querySelectorAll('.car-card').forEach((el) => {
    el.addEventListener('click', () => {
      if (justDragged) return;
      state.carId = el.dataset.car;
      renderCars();
      update();
    });
  });
}

function renderFuels() {
  const grid = document.getElementById('fuelGrid');
  grid.innerHTML = Object.entries(FUEL_TYPES).map(([key, f]) => `
    <div class="fuel-card ${state.fuel === key ? 'active' : ''}" data-fuel="${key}">
      <div class="fuel-icon">${f.icon}</div>
      <div class="fuel-name">${f.name}</div>
      ${state.fuel === key ? `<div class="fuel-price">${f.priceLabel}</div>` : ''}
    </div>
  `).join('');

  grid.querySelectorAll('.fuel-card').forEach((el) => {
    el.addEventListener('click', () => {
      state.fuel = el.dataset.fuel;
      renderFuels();
      update();
    });
  });
}

// ============= CALCULATION =============
function calculate() {
  const car = CARS.find((c) => c.id === state.carId);
  const fuel = FUEL_TYPES[state.fuel];
  const transFactor = state.transmission === 'auto' ? 1.0 : 0.92;

  // расход с учётом топлива и КПП
  const consumption = car.consumption[state.transmission] * fuel.factor;
  const range = (car.tank / consumption) * 100;
  // стоимость полного бака (всего запаса хода)
  const litersPerTrip = car.tank;
  const cost = litersPerTrip * fuel.price;

  return {
    consumption: consumption.toFixed(1),
    range: Math.round(range),
    cost: Math.round(cost),
    car,
    fuel,
  };
}

// ============= UPDATE UI =============
function formatMoney(n) {
  return n.toLocaleString('ru-RU').replace(/,/g, ' ');
}

function update() {
  const r = calculate();

  // Главное число с подсветкой при изменении
  const consumEl = document.getElementById('consumptionValue');
  if (consumEl.textContent !== r.consumption) {
    consumEl.textContent = r.consumption;
    consumEl.classList.remove('flash');
    void consumEl.offsetWidth;
    consumEl.classList.add('flash');
  }

  document.getElementById('rangeValue').textContent = `${r.range} км`;
  document.getElementById('tripCost').textContent = `${formatMoney(r.cost)} UZS`;

  // Spec tiles
  document.getElementById('specEngine').textContent = r.car.engine;
  document.getElementById('specPower').textContent = `${r.car.power} л.с.`;
  document.getElementById('specTank').textContent = `${r.car.tank} л`;
  document.getElementById('specConsumption').textContent = `${r.consumption} л/100км`;
}

// ============= EVENTS =============
function bindTransmission() {
  document.querySelectorAll('#transmission .seg-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#transmission .seg-btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      state.transmission = btn.dataset.value;
      renderCars();
      update();
    });
  });
}

// ============= DRAG TO SCROLL =============
let justDragged = false;
function bindCarsDrag() {
  const scroller = document.getElementById('carsScroll');
  if (!scroller) return;

  let isDown = false;
  let startX = 0;
  let startLeft = 0;
  let moved = 0;

  scroller.addEventListener('mousedown', (e) => {
    isDown = true;
    moved = 0;
    startX = e.clientX;
    startLeft = scroller.scrollLeft;
  });

  window.addEventListener('mousemove', (e) => {
    if (!isDown) return;
    const dx = e.clientX - startX;
    if (Math.abs(dx) > 4) {
      moved = Math.abs(dx);
      scroller.classList.add('dragging');
      scroller.scrollLeft = startLeft - dx;
    }
  });

  window.addEventListener('mouseup', () => {
    if (!isDown) return;
    isDown = false;
    if (moved > 6) {
      justDragged = true;
      setTimeout(() => { justDragged = false; }, 50);
    }
    scroller.classList.remove('dragging');
  });

  // Колесо мыши — горизонтальный скролл
  scroller.addEventListener('wheel', (e) => {
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      e.preventDefault();
      scroller.scrollLeft += e.deltaY;
    }
  }, { passive: false });
}

// ============= INIT =============
function init() {
  renderCars();
  renderFuels();
  bindTransmission();
  bindCarsDrag();
  update();
}

document.addEventListener('DOMContentLoaded', init);
