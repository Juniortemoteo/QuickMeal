import test from "node:test";
import assert from "node:assert/strict";
import { decodeFridge, type FridgeItem } from "../src/context/fridgeState.ts";
import { countRecipeMatches } from "../src/features/recipes/matching.ts";

const food = (id: string, name: string, expiresAt?: string): FridgeItem => ({
  id, name, quantity: "1 unidade", isExpiring: false, ...(expiresAt ? { expiresAt } : {}),
});

test("matches are insensitive to case and spaces, support ovos, and do not double-count packs", () => {
  const items = [food("1", "  ToMaTe  "), food("2", "tomate"), food("3", "OVO")];
  assert.equal(countRecipeMatches(["Tomate", "Ovos", "Queijo"], items), 2);
  assert.equal(countRecipeMatches(["Tomate", "tomate"], items), 1);
});

test("adding and removing ingredients changes the recipe count; expired food is excluded", () => {
  const items = [food("milk", "Leite"), food("egg", "Ovos", "2020-01-01")];
  const ingredients = ["Leite", "Ovos", "Banana"];
  assert.equal(countRecipeMatches(ingredients, items, "2026-10-10"), 1);
  const added = [...items, food("banana", "BANANA")];
  assert.equal(countRecipeMatches(ingredients, added, "2026-10-10"), 2);
  assert.equal(countRecipeMatches(ingredients, added.filter((item) => item.id !== "banana"), "2026-10-10"), 1);
  assert.equal(countRecipeMatches(ingredients, []), 0);
});

test("migrates the prior inventory without losing quantities, barcode or consumed count", () => {
  const migrated = decodeFridge(JSON.stringify({ version: 1, consumedCount: 5, items: [
    { id: "saved", name: "Ovos", quantity: 6, expiresAt: "2099-12-31", barcode: "123" },
  ] }));
  assert.equal(migrated.consumedCount, 5);
  assert.deepEqual(migrated.fridgeItems[0], { id: "saved", name: "Ovos", quantity: "6 unidades", expiresAt: "2099-12-31", barcode: "123", isExpiring: false });
});

test("a deliberately empty inventory stays empty and v2 preserves quantities with units", () => {
  assert.deepEqual(decodeFridge('{"version":2,"fridgeItems":[],"consumedCount":0}').fridgeItems, []);
  const items = [{ ...food("chicken", "Frango"), quantity: "500 g" }];
  assert.deepEqual(decodeFridge(JSON.stringify({ version: 2, fridgeItems: items, consumedCount: 0 })).fridgeItems, items);
  assert.throws(() => decodeFridge(JSON.stringify({ version: 2, fridgeItems: [items[0], items[0]], consumedCount: 0 })));
});
