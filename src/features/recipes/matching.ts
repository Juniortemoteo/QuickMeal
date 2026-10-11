import { daysUntilExpiry } from "../fridge/model.ts";
import type { FridgeItem } from "../../context/fridgeState.ts";

function normalizeIngredient(value: string): string {
  const name = value.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const aliases: Record<string, string> = {
    ovos: "ovo", tomates: "tomate", cenouras: "cenoura", bananas: "banana", queijos: "queijo",
  };
  return aliases[name] ?? name;
}

/** Conta ingredientes distintos presentes; embalagens repetidas não duplicam o total. */
export function countRecipeMatches(ingredients: string[], fridgeItems: FridgeItem[], today?: string): number {
  const available = new Set(fridgeItems
    .filter((item) => !item.expiresAt || daysUntilExpiry(item.expiresAt, today) >= 0)
    .map((item) => normalizeIngredient(item.name)));
  return new Set(ingredients.map(normalizeIngredient).filter((name) => available.has(name))).size;
}
