import {
  getCart,
  getCartCount,
  getCartTotal,
  updateQuantity,
  removeFromCart,
  clearCart,
  subscribe
} from './cart.js';
import { getConfig, formatPrice } from './config.js';
import { sendOrder } from './order.js';
import { showToast } from './toast.js';

let orderType = 'delivery';

export function initCartUI() {
  const drawer = document.getElementById('cart-drawer');
  const overlay = document.getElementById('overlay');
  const openBtn = document.getElementById('cart-btn');
  const closeBtn = document.getElementById('cart-close');

  openBtn?.addEventListener('click', () => openCart());
  closeBtn?.addEventListener('click', () => closeCart());
  overlay?.addEventListener('click', () => closeCart());

  document.querySelectorAll('.cart-tab').forEach(tab => {
    tab.addEventListener('click', () => switchTab(tab.dataset.tab));
  });

  document.querySelectorAll('.order-type__btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.order-type__btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      orderType = btn.dataset.type;
      toggleAddressField();
      togglePaymentField();
    });
  });

  document.getElementById('order-form')?.addEventListener('submit', handleSubmit);
  document.querySelector('[data-tab="order"]')?.addEventListener('click', () => {
    toggleAddressField();
    togglePaymentField();
  });

  subscribe(renderCart);
  renderCart();
  toggleAddressField();
  togglePaymentField();
}

function openCart() {
  document.getElementById('cart-drawer')?.classList.add('open');
  document.getElementById('overlay')?.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeCart() {
  document.getElementById('cart-drawer')?.classList.remove('open');
  document.getElementById('overlay')?.classList.remove('active');
  document.body.style.overflow = '';
}

function switchTab(tab) {
  document.querySelectorAll('.cart-tab').forEach(t => {
    t.classList.toggle('active', t.dataset.tab === tab);
  });
  document.querySelectorAll('.cart-panel').forEach(p => {
    p.classList.toggle('active', p.dataset.panel === tab);
  });
}

function toggleAddressField() {
  const addressGroup = document.getElementById('address-group');
  if (addressGroup) {
    addressGroup.style.display = orderType === 'delivery' ? 'block' : 'none';
  }
}

function togglePaymentField() {
  const paymentGroup = document.getElementById('payment-group');
  if (!paymentGroup) return;

  paymentGroup.style.display = orderType === 'pickup' ? 'block' : 'none';

  if (orderType === 'pickup') {
    const checkedPayment = document.querySelector('input[name="paymentMethod"]:checked');
    if (!checkedPayment) {
      const defaultPayment = document.querySelector('input[name="paymentMethod"][value="card"]');
      if (defaultPayment) defaultPayment.checked = true;
    }
  }
}

function renderCart() {
  const cart = getCart();
  const config = getConfig();
  const count = getCartCount();
  const totals = getCartTotal(config?.delivery);

  const countEl = document.querySelector('.cart-btn__count');
  if (countEl) {
    countEl.textContent = count;
    countEl.dataset.count = count;
  }

  const itemsContainer = document.getElementById('cart-items');

  if (!itemsContainer) return;

  if (cart.length === 0) {
    itemsContainer.innerHTML = `
      <div class="cart-empty">
        <div class="cart-empty__icon">🛒</div>
        <p>Twój koszyk jest pusty</p>
        <p style="margin-top:0.5rem;font-size:0.875rem">Dodaj coś pysznego z menu!</p>
      </div>
    `;
  } else {
    itemsContainer.innerHTML = cart.map(item => `
      <div class="cart-item">
        <img class="cart-item__image" src="${item.image}" alt="${item.name}">
        <div class="cart-item__info">
          <div class="cart-item__name">${item.name}</div>
          ${item.size ? `<div class="cart-item__size">${item.size}</div>` : ''}
          <div class="cart-item__price">${formatPrice(item.price * item.quantity)}</div>
          <div class="cart-item__controls">
            <button class="qty-btn" data-action="minus" data-key="${item.cartKey}">−</button>
            <span class="cart-item__qty">${item.quantity}</span>
            <button class="qty-btn" data-action="plus" data-key="${item.cartKey}">+</button>
            <button class="cart-item__remove" data-action="remove" data-key="${item.cartKey}">Usuń</button>
          </div>
        </div>
      </div>
    `).join('');

    itemsContainer.querySelectorAll('[data-action]').forEach(btn => {
      btn.addEventListener('click', () => {
        const key = btn.dataset.key;
        if (btn.dataset.action === 'minus') updateQuantity(key, -1);
        else if (btn.dataset.action === 'plus') updateQuantity(key, 1);
        else if (btn.dataset.action === 'remove') removeFromCart(key);
      });
    });
  }

  const subtotalEl = document.getElementById('cart-subtotal');
  const deliveryEl = document.getElementById('cart-delivery');
  const totalEl = document.getElementById('cart-total');

  if (subtotalEl) subtotalEl.textContent = formatPrice(totals.subtotal);
  if (deliveryEl) deliveryEl.textContent = totals.deliveryFee > 0 ? formatPrice(totals.deliveryFee) : 'Gratis';
  if (totalEl) totalEl.textContent = formatPrice(totals.total);

  const submitBtn = document.getElementById('submit-order');
  if (submitBtn) submitBtn.disabled = cart.length === 0;
}

function resetSubmitButton() {
  const submitBtn = document.getElementById('submit-order');
  if (submitBtn) {
    submitBtn.disabled = false;
    submitBtn.innerHTML = 'Złóż zamówienie';
  }
}

async function handleSubmit(e) {
  e.preventDefault();

  const cart = getCart();
  if (cart.length === 0) return;

  const config = getConfig();
  const form = e.target;
  const submitBtn = document.getElementById('submit-order');

  const orderData = {
    name: form.name.value.trim(),
    phone: form.phone.value.trim(),
    email: form.email.value.trim(),
    address: orderType === 'delivery' ? form.address.value.trim() : 'Odbiór osobisty',
    notes: form.notes.value.trim(),
    type: orderType,
    paymentMethod: orderType === 'pickup'
      ? form.querySelector('input[name="paymentMethod"]:checked')?.value || 'card'
      : '',
    items: cart,
    totals: getCartTotal(config?.delivery)
  };

  if (!orderData.name || !orderData.phone) {
    showToast('Podaj imię i numer telefonu', true);
    return;
  }

  if (orderType === 'delivery' && !orderData.address) {
    showToast('Podaj adres dostawy', true);
    return;
  }

  if (orderType === 'pickup' && !orderData.paymentMethod) {
    showToast('Wybierz formę płatności', true);
    return;
  }

  submitBtn.disabled = true;
  submitBtn.innerHTML = '<span class="spinner"></span> Wysyłanie...';

  try {
    await sendOrder(orderData, config);
    showToast('Zamówienie wysłane! Dziękujemy!');
    clearCart();
    form.reset();
    orderType = 'delivery';
    toggleAddressField();
    togglePaymentField();
    closeCart();
  } catch (err) {
    showToast(err.message || 'Błąd wysyłania zamówienia', true);
  } finally {
    resetSubmitButton();
  }
}

export { openCart };
