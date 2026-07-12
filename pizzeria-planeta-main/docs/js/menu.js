import { getMenu, formatPrice, getTagClass, getTagLabel } from './config.js';
import { addToCart } from './cart.js';
import { showToast } from './toast.js';

let activeCategory = 'all';
const selectedSizes = {};

export function renderMenu() {
  const menu = getMenu();
  const container = document.getElementById('menu-content');
  const filters = document.getElementById('menu-filters');

  if (!container || !menu) return;

  renderFilters(menu.categories, filters);
  renderCategories(menu.categories, container);
}

function renderFilters(categories, container) {
  const allBtn = `<button class="menu-filter active" data-category="all">Wszystko</button>`;
  const categoryBtns = categories.map(cat =>
    `<button class="menu-filter" data-category="${cat.id}">${cat.icon} ${cat.name}</button>`
  ).join('');

  container.innerHTML = allBtn + categoryBtns;

  container.querySelectorAll('.menu-filter').forEach(btn => {
    btn.addEventListener('click', () => {
      container.querySelectorAll('.menu-filter').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeCategory = btn.dataset.category;
      filterCategories();
    });
  });
}

function filterCategories() {
  document.querySelectorAll('.menu-category').forEach(section => {
    if (activeCategory === 'all') {
      section.style.display = 'block';
    } else {
      section.style.display = section.dataset.category === activeCategory ? 'block' : 'none';
    }
  });
}

function renderCategories(categories, container) {
  container.innerHTML = categories.map(cat => `
    <div class="menu-category reveal" data-category="${cat.id}">
      <h3 class="menu-category__title">
        <span>${cat.icon}</span> ${cat.name}
      </h3>
      <div class="menu-grid stagger-children">
        ${cat.items.map(item => renderMenuCard(item)).join('')}
      </div>
    </div>
  `).join('');

  bindMenuEvents();
  initReveal();
}

function renderMenuCard(item) {
  const hasSizes = item.sizes && item.sizes.length > 0;
  const defaultSize = hasSizes ? item.sizes[1] || item.sizes[0] : null;
  const price = hasSizes
    ? item.price + (defaultSize?.priceModifier || 0)
    : item.price;

  const sizesHtml = hasSizes ? `
    <div class="menu-card__sizes" data-item-id="${item.id}">
      ${item.sizes.map((size, i) => `
        <button class="size-btn ${i === (item.sizes.length > 1 ? 1 : 0) ? 'active' : ''}"
                data-size="${size.name}"
                data-modifier="${size.priceModifier}">
          ${size.name}
        </button>
      `).join('')}
    </div>
  ` : '';

  const badgesHtml = (item.tags || []).map(tag =>
    `<span class="badge ${getTagClass(tag)}">${getTagLabel(tag)}</span>`
  ).join('');

  return `
    <article class="menu-card" data-item-id="${item.id}">
      <div class="menu-card__image">
        <img src="${item.image}" alt="${item.name}" loading="lazy">
        ${badgesHtml ? `<div class="menu-card__badges">${badgesHtml}</div>` : ''}
      </div>
      <div class="menu-card__body">
        <h4 class="menu-card__name">${item.name}</h4>
        ${item.description ? `<p class="menu-card__desc">${item.description}</p>` : ''}
        ${sizesHtml}
        <div class="menu-card__footer">
          <div class="menu-card__price" data-base-price="${item.price}">
            ${formatPrice(price)}
          </div>
          <button class="btn btn-primary btn-sm add-to-cart-btn"
                  data-id="${item.id}"
                  data-name="${item.name}"
                  data-image="${item.image}"
                  data-price="${price}"
                  data-size="${defaultSize?.name || ''}">
            Dodaj
          </button>
        </div>
      </div>
    </article>
  `;
}

function bindMenuEvents() {
  document.querySelectorAll('.size-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const sizesContainer = e.target.closest('.menu-card__sizes');
      const card = e.target.closest('.menu-card');
      const basePrice = parseFloat(card.querySelector('.menu-card__price').dataset.basePrice);
      const modifier = parseFloat(e.target.dataset.modifier);
      const newPrice = basePrice + modifier;

      sizesContainer.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');

      card.querySelector('.menu-card__price').textContent = formatPrice(newPrice);
      const addBtn = card.querySelector('.add-to-cart-btn');
      addBtn.dataset.price = newPrice;
      addBtn.dataset.size = e.target.dataset.size;
    });
  });

  document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      addToCart({
        id: btn.dataset.id,
        name: btn.dataset.name,
        image: btn.dataset.image,
        price: parseFloat(btn.dataset.price),
        size: btn.dataset.size || null
      });
      showToast(`${btn.dataset.name} dodano do koszyka!`);

      btn.textContent = '✓ Dodano';
      btn.style.background = 'var(--color-accent)';
      setTimeout(() => {
        btn.textContent = 'Dodaj';
        btn.style.background = '';
      }, 1200);
    });
  });
}

function initReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  document.querySelectorAll('.reveal, .stagger-children, .reveal-left, .reveal-right').forEach(el => {
    observer.observe(el);
  });
}

export { initReveal };
