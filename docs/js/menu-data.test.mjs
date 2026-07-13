import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const menuPath = path.resolve('docs/data/menu.json');
const menu = JSON.parse(readFileSync(menuPath, 'utf8'));

test('pizza items are grouped into a single category without duplicate names', () => {
  const pizzaCategory = menu.categories.find((category) => category.id === 'pizza');
  assert.ok(pizzaCategory, 'Pizza category should exist');

  const names = pizzaCategory.items.map((item) => item.name);
  const uniqueNames = new Set(names);
  assert.equal(uniqueNames.size, names.length, 'Pizza items should not be duplicated');

  pizzaCategory.items.forEach((item) => {
    assert.ok(Array.isArray(item.sizes) && item.sizes.length > 0, `${item.name} should define size options`);
  });
});
