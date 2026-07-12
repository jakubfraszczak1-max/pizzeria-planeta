import test from 'node:test';
import assert from 'node:assert/strict';

import { formatPaymentMethod, getOrderRecipientEmail } from './order.js';

test('formatPaymentMethod returns human-readable label for supported payment methods', () => {
  assert.equal(formatPaymentMethod('card'), 'Karta przy odbiorze');
  assert.equal(formatPaymentMethod('blik'), 'Blik');
  assert.equal(formatPaymentMethod('gateway'), 'Bramka płatności');
  assert.equal(formatPaymentMethod(''), 'Nie wybrano');
});

test('getOrderRecipientEmail prefers the configured owner email', () => {
  const config = {
    email: { ownerEmail: 'kakaskubaxd@gail.com' },
    restaurant: { email: 'kontakt@pizzeriaplaneta.pl' }
  };

  assert.equal(getOrderRecipientEmail(config), 'kakaskubaxd@gail.com');
});
