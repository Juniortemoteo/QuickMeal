import assert from "node:assert/strict";
import test from "node:test";
import {
  daysUntilExpiry,
  decodeStoredFridge,
  fridgeReducer,
  initialFridgeState,
  isValidDate,
  validateFood,
} from "../src/features/fridge/model.ts";
import { suggestRecipes } from "../src/features/recipes/service.ts";

const food = { id: "1", name: "Tomate", quantity: 2, expiresAt: "2026-10-12" };

test("cadastro, consumo unitário e remoção compartilham o mesmo estado", () => {
  const added = fridgeReducer(initialFridgeState, { type: "add", item: food });
  const consumed = fridgeReducer(added, { type: "consume", id: "1" });
  assert.equal(consumed.items[0]?.quantity, 1);
  assert.equal(consumed.consumedCount, 1);
  assert.equal(added.items[0]?.quantity, 2);
  const empty = fridgeReducer(consumed, { type: "consume", id: "1" });
  assert.deepEqual(empty, { items: [], consumedCount: 2 });
  assert.equal(fridgeReducer(empty, { type: "consume", id: "1" }), empty);
  assert.deepEqual(
    fridgeReducer(added, { type: "remove", id: "1" }),
    initialFridgeState,
  );
});

test("validação rejeita campos vazios, quantidade inválida e data impossível", () => {
  assert.equal(validateFood(food), null);
  for (const quantity of [0, -1, 1.5, NaN, 1000])
    assert.ok(validateFood({ ...food, quantity }));
  assert.ok(validateFood({ ...food, name: "  " }));
  assert.ok(validateFood({ ...food, expiresAt: "2026-02-30" }));
  assert.equal(isValidDate("2028-02-29"), true);
  assert.equal(isValidDate("2026-02-29"), false);
  assert.equal(isValidDate("12/10/2026"), false);
});

test("validade usa dias de calendário, inclusive hoje e troca de mês", () => {
  assert.equal(daysUntilExpiry("2026-10-10", "2026-10-10"), 0);
  assert.equal(daysUntilExpiry("2026-10-09", "2026-10-10"), -1);
  assert.equal(daysUntilExpiry("2026-11-01", "2026-10-31"), 1);
});

test("persistência restaura o estado e rejeita dados incompatíveis ou corrompidos", () => {
  const state = { items: [food], consumedCount: 3 };
  assert.deepEqual(
    decodeStoredFridge(JSON.stringify({ version: 1, ...state })),
    state,
  );
  assert.throws(() => decodeStoredFridge("broken"));
  assert.throws(() =>
    decodeStoredFridge(JSON.stringify({ version: 2, ...state })),
  );
  assert.throws(() =>
    decodeStoredFridge(
      JSON.stringify({
        version: 1,
        ...state,
        items: [{ ...food, quantity: -1 }],
      }),
    ),
  );
  assert.throws(() =>
    decodeStoredFridge(
      JSON.stringify({ version: 1, ...state, items: [food, food] }),
    ),
  );
});

test("receitas reagem ao estoque, informam faltantes e ignoram vencidos", () => {
  assert.deepEqual(suggestRecipes([], "2026-10-10"), []);
  assert.deepEqual(
    suggestRecipes([{ ...food, expiresAt: "2026-10-09" }], "2026-10-10"),
    [],
  );
  const recipes = suggestRecipes(
    [food, { ...food, id: "2", name: "Ovos" }],
    "2026-10-10",
  );
  assert.equal(recipes[0]?.id, "omelete");
  assert.deepEqual(recipes[0]?.missing, []);
  assert.equal(recipes[0]?.urgentMatches, 2);
  const incomplete = suggestRecipes([food], "2026-10-10");
  assert.deepEqual(
    incomplete.find((recipe) => recipe.id === "omelete")?.missing,
    ["ovo"],
  );
});

test("receitas priorizam ingredientes próximos do vencimento", () => {
  const recipes = suggestRecipes(
    [
      { ...food, expiresAt: "2026-10-20" },
      { ...food, id: "2", name: "Cenoura", expiresAt: "2026-10-10" },
    ],
    "2026-10-10",
  );
  assert.ok(recipes[0] && recipes[0].urgentMatches > 0);
  assert.equal(recipes.at(-1)?.id, "omelete");
});
