// ============= DATA =============
// Цены — UZS за литр / кубометр (примерные значения для Узбекистана, можно править)
const FUEL_TYPES = {
  methane: { name: 'Метан',     icon: '⛽', price: 5500,  unit: 'м³', priceLabel: '5 500 / м³',  factor: 0.85 },
  propane: { name: 'Пропан',    icon: '🔥', price: 6500,  unit: 'л',  priceLabel: '6 500 / л',   factor: 1.10 },
  ai95:    { name: 'Бензин 95', icon: '⛽', price: 12500, unit: 'л',  priceLabel: '12 500 / л',  factor: 1.00 },
  ai92:    { name: 'Бензин 92', icon: '⛽', price: 11000, unit: 'л',  priceLabel: '11 000 / л',  factor: 1.05 },
};

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
        <span class="car-logo">CHEVY</span>
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
      <div class="fuel-price">${f.priceLabel}</div>
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
  const litersPerTrip = (consumption * state.trip) / 100;
  const cost = litersPerTrip * fuel.price;

  return {
    consumption: consumption.toFixed(1),
    range: Math.round(range),
    cost: Math.round(cost),
    litersPerTrip: litersPerTrip.toFixed(1),
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

  // Trip slider value
  document.getElementById('tripDistanceValue').textContent = state.trip;
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

function bindTrip() {
  const slider = document.getElementById('tripDistance');
  slider.addEventListener('input', (e) => {
    state.trip = +e.target.value;
    update();
  });
}

// ============= INIT =============
function init() {
  renderCars();
  renderFuels();
  bindTransmission();
  bindTrip();
  update();
}

document.addEventListener('DOMContentLoaded', init);
