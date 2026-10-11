import type {
  FoodInput,
  FoodItem,
  FridgeAction,
  FridgeState,
} from "./types.ts";

export const initialFridgeState: FridgeState = { items: [], consumedCount: 0 };

export function localDate(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function isValidDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T12:00:00`);
  return !Number.isNaN(parsed.getTime()) && localDate(parsed) === value;
}

export function daysUntilExpiry(
  expiresAt: string,
  today = localDate(),
): number {
  return Math.round(
    (Date.parse(`${expiresAt}T00:00:00Z`) - Date.parse(`${today}T00:00:00Z`)) /
      86_400_000,
  );
}

export function validateFood(input: FoodInput): string | null {
  if (!input.name.trim() || input.name.trim().length > 80)
    return "Informe um nome com 1 a 80 caracteres.";
  if (
    !Number.isSafeInteger(input.quantity) ||
    input.quantity < 1 ||
    input.quantity > 999
  )
    return "Informe uma quantidade inteira entre 1 e 999.";
  if (!isValidDate(input.expiresAt))
    return "Informe uma data válida no formato AAAA-MM-DD.";
  return null;
}

export function fridgeReducer(
  state: FridgeState,
  action: FridgeAction,
): FridgeState {
  switch (action.type) {
    case "hydrate":
      return action.state;
    case "add":
      return { ...state, items: [...state.items, action.item] };
    case "remove":
      return {
        ...state,
        items: state.items.filter((item) => item.id !== action.id),
      };
    case "consume": {
      const item = state.items.find((candidate) => candidate.id === action.id);
      if (!item) return state;
      return {
        items:
          item.quantity > 1
            ? state.items.map((candidate) =>
                candidate.id === action.id
                  ? { ...candidate, quantity: candidate.quantity - 1 }
                  : candidate,
              )
            : state.items.filter((candidate) => candidate.id !== action.id),
        consumedCount: state.consumedCount + 1,
      };
    }
  }
}

export function decodeStoredFridge(raw: string): FridgeState {
  const value: unknown = JSON.parse(raw);
  if (!value || typeof value !== "object") throw new Error("Formato inválido.");
  const data = value as Record<string, unknown>;
  if (
    data.version !== 1 ||
    !Array.isArray(data.items) ||
    !Number.isSafeInteger(data.consumedCount) ||
    (data.consumedCount as number) < 0
  )
    throw new Error("Dados inválidos.");
  const ids = new Set<string>();
  const items = data.items.map((item: unknown): FoodItem => {
    if (!item || typeof item !== "object")
      throw new Error("Alimento inválido.");
    const food = item as FoodItem;
    if (
      typeof food.id !== "string" ||
      !food.id ||
      ids.has(food.id) ||
      typeof food.name !== "string" ||
      typeof food.expiresAt !== "string" ||
      (food.barcode !== undefined && typeof food.barcode !== "string") ||
      validateFood(food)
    )
      throw new Error("Alimento inválido.");
    ids.add(food.id);
    return {
      id: food.id,
      name: food.name.trim(),
      quantity: food.quantity,
      expiresAt: food.expiresAt,
      ...(food.barcode ? { barcode: food.barcode } : {}),
    };
  });
  return { items, consumedCount: data.consumedCount as number };
}
