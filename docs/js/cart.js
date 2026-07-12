const CART_KEY = 'planeta_cart';

let cart = [];
let listeners = [];

export function initCart() {
  const saved = localStorage.getItem(CART_KEY);
  if (saved) {
    try {
      cart = JSON.parse(saved);
    } catch {
      cart = [];
    }
  }
  notify();
}

export function getCart() {
  return [...cart];
}

export function getCartCount() {
  return cart.reduce((sum, item) => sum + item.quantity, 0);
}

export function getCartTotal(deliveryConfig) {
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  let deliveryFee = 0;

  if (deliveryConfig && subtotal > 0 && subtotal < deliveryConfig.freeDeliveryFrom) {
    deliveryFee = deliveryConfig.deliveryFee;
  }

  return { subtotal, deliveryFee, total: subtotal + deliveryFee };
}

export function addToCart(item) {
  const key = `${item.id}-${item.size || 'default'}`;
  const existing = cart.find(i => i.cartKey === key);

  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({
      cartKey: key,
      id: item.id,
      name: item.name,
      size: item.size || null,
      price: item.price,
      image: item.image,
      quantity: 1
    });
  }

  save();
  notify();
}

export function updateQuantity(cartKey, delta) {
  const item = cart.find(i => i.cartKey === cartKey);
  if (!item) return;

  item.quantity += delta;

  if (item.quantity <= 0) {
    cart = cart.filter(i => i.cartKey !== cartKey);
  }

  save();
  notify();
}

export function removeFromCart(cartKey) {
  cart = cart.filter(i => i.cartKey !== cartKey);
  save();
  notify();
}

export function clearCart() {
  cart = [];
  save();
  notify();
}

function save() {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

export function subscribe(callback) {
  listeners.push(callback);
  return () => {
    listeners = listeners.filter(l => l !== callback);
  };
}

function notify() {
  listeners.forEach(cb => cb(getCart()));
}
