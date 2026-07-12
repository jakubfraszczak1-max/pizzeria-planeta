import { loadConfig } from './config.js';
import { initCart } from './cart.js';
import { renderMenu, initReveal } from './menu.js';
import { initCartUI } from './cart-ui.js';
import { initAnimations } from './animations.js';

async function init() {
  try {
    await loadConfig();
    initCart();
    initAnimations();
    renderMenu();
    initCartUI();
    initReveal();

    document.getElementById('loader')?.classList.add('hidden');
  } catch (err) {
    console.error('Błąd ładowania strony:', err);
    document.getElementById('loader')?.classList.add('hidden');
  }
}

document.addEventListener('DOMContentLoaded', init);
