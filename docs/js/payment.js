import { formatPrice } from './config.js';

function getPaymentProviderConfig(config = {}, method = '') {
  return config?.payment?.[method] || null;
}

export function buildPaymentRedirectUrl(orderData, config = {}, method = '') {
  const providerConfig = getPaymentProviderConfig(config, method);
  const baseUrl = providerConfig?.redirectUrl?.trim();
  const orderId = `${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
  const amount = Math.round((Number(orderData?.totals?.total) || 0) * 100);
  const params = new URLSearchParams({
    orderId,
    amount: String(amount),
    currency: 'PLN',
    method,
    description: `Zamówienie ${orderId}`,
    customerName: orderData?.name || '',
    customerPhone: orderData?.phone || '',
    customerEmail: orderData?.email || '',
    address: orderData?.address || '',
    orderType: orderData?.type || 'delivery',
    total: formatPrice(Number(orderData?.totals?.total) || 0)
  });

  if (baseUrl) {
    const separator = baseUrl.includes('?') ? '&' : '?';
    return `${baseUrl}${separator}${params.toString()}`;
  }

  return `${window.location.origin}${window.location.pathname.replace(/[^/]*$/, '')}payment.html?${params.toString()}`;
}

export async function startPayment(orderData, config = {}) {
  const method = orderData?.paymentMethod;
  if (!['payu', 'blik'].includes(method)) {
    return { ok: true, skipped: true };
  }

  const paymentUrl = buildPaymentRedirectUrl(orderData, config, method);
  const popup = window.open(paymentUrl, '_blank', 'width=900,height=700,noopener,noreferrer');

  if (!popup) {
    throw new Error('Nie udało się otworzyć okna płatności. Włącz popupy w przeglądarce.');
  }

  return { ok: true, paymentUrl, method };
}
