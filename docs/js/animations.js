import { getConfig } from './config.js';

export function initAnimations() {
  initHeaderScroll();
  initParticles();
  initSmoothNav();
  populateSiteContent();
}

function initHeaderScroll() {
  const header = document.getElementById('header');

  window.addEventListener('scroll', () => {
    header?.classList.toggle('scrolled', window.scrollY > 50);
  });
}

function initParticles() {
  const container = document.getElementById('hero-particles');
  if (!container) return;

  for (let i = 0; i < 20; i++) {
    const particle = document.createElement('div');
    particle.className = 'hero__particle';
    particle.style.left = `${Math.random() * 100}%`;
    particle.style.top = `${Math.random() * 100}%`;
    particle.style.animationDelay = `${Math.random() * 3}s`;
    particle.style.animationDuration = `${3 + Math.random() * 4}s`;
    particle.style.width = `${3 + Math.random() * 5}px`;
    particle.style.height = particle.style.width;
    container.appendChild(particle);
  }
}

function initSmoothNav() {
  const toggle = document.getElementById('menu-toggle');
  const nav = document.getElementById('header-nav');

  toggle?.addEventListener('click', () => {
    toggle.classList.toggle('active');
    nav?.classList.toggle('open');
  });

  document.querySelectorAll('.header__nav a').forEach(link => {
    link.addEventListener('click', () => {
      toggle?.classList.remove('active');
      nav?.classList.remove('open');
    });
  });
}

function populateSiteContent() {
  const config = getConfig();
  if (!config) return;

  const { restaurant, images, delivery } = config;

  setText('hero-title-name', restaurant.name);
  setText('hero-desc', restaurant.description);
  setAttr('hero-bg-img', 'src', images.hero);
  setAttr('about-img', 'src', images.about);
  setAttr('header-logo-img', 'src', images.logo);

  setText('contact-address', `${restaurant.address}, ${restaurant.city}`);
  setText('contact-phone', restaurant.phone);
  setAttr('contact-phone-link', 'href', `tel:${restaurant.phone.replace(/\s/g, '')}`);
  setText('contact-email', restaurant.email);
  setAttr('contact-email-link', 'href', `mailto:${restaurant.email}`);

  setText('hero-rating', restaurant.rating.toString());
  setText('hero-reviews', `${restaurant.reviewsCount} opinii`);
  setText('delivery-time', delivery.estimatedTime);
  setText('min-order', `${delivery.minOrder} zł`);

  renderFeatures(restaurant.features);
  renderGallery(images.gallery);
  renderHours(restaurant.hours);
  renderMarquee(restaurant.features);
  renderFooter(config);
}

function setText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

function setAttr(id, attr, value) {
  const el = document.getElementById(id);
  if (el) el.setAttribute(attr, value);
}

function renderFeatures(features) {
  const container = document.getElementById('features-list');
  if (!container) return;

  const icons = ['🚗', '🏪', '🎉', '🎯'];

  container.innerHTML = features.map((f, i) => `
    <div class="feature-item reveal-left">
      <span class="feature-item__icon">${icons[i] || '✓'}</span>
      <span>${f}</span>
    </div>
  `).join('');
}

function renderGallery(images) {
  const container = document.getElementById('gallery-grid');
  if (!container || !images) return;

  container.innerHTML = images.map((src, i) => `
    <div class="gallery-item reveal" style="transition-delay: ${i * 0.1}s">
      <img src="${src}" alt="Galeria ${i + 1}" loading="lazy">
    </div>
  `).join('');
}

function renderHours(hours) {
  const container = document.getElementById('hours-table');
  if (!container || !hours) return;

  const dayNames = {
    poniedzialek: 'Poniedziałek',
    wtorek: 'Wtorek',
    sroda: 'Środa',
    czwartek: 'Czwartek',
    piatek: 'Piątek',
    sobota: 'Sobota',
    niedziela: 'Niedziela'
  };

  container.innerHTML = Object.entries(hours).map(([day, time]) => `
    <div class="hours-table__row">
      <span class="hours-table__day">${dayNames[day] || day}</span>
      <span class="hours-table__time">${time}</span>
    </div>
  `).join('');
}

function renderMarquee(features) {
  const container = document.getElementById('marquee-track');
  if (!container) return;

  const items = [
    '🍕 Świeże składniki',
    '🚗 Szybka dostawa',
    '⭐ Ocena ' + getConfig().restaurant.rating + '/5',
    ...features.map(f => `✓ ${f}`)
  ];

  const doubled = [...items, ...items];
  container.innerHTML = doubled.map(text =>
    `<span class="marquee-bar__item">${text}</span>`
  ).join('');
}

function renderFooter(config) {
  const { restaurant } = config;
  setText('footer-desc', restaurant.description);
  setText('footer-address', `${restaurant.address}, ${restaurant.city}`);
  setText('footer-phone', restaurant.phone);
}
