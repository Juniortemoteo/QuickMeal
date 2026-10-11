import { daysUntilExpiry, decodeStoredFridge, isValidDate, localDate } from "../features/fridge/model.ts";

export type FridgeItem = {
  id: string;
  name: string;
  quantity: string;
  isExpiring: boolean;
  expiresAt?: string;
  barcode?: string;
};
export type NewFoodItem = Omit<FridgeItem, "id">;
export type StoredFridge = { fridgeItems: FridgeItem[]; consumedCount: number };

export function refreshExpiry(item: FridgeItem): FridgeItem {
  if (!item.expiresAt) return item;
  const days = daysUntilExpiry(item.expiresAt);
  return { ...item, isExpiring: days >= 0 && days <= 3 };
}

export function createInitialItems(): FridgeItem[] {
  const expiresIn = (days: number) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return localDate(date);
  };
  return [
    { id: "tomato", name: "Tomate", quantity: "4 unidades", isExpiring: true, expiresAt: expiresIn(2) },
    { id: "milk", name: "Leite", quantity: "1 L", isExpiring: false, expiresAt: expiresIn(7) },
    { id: "chicken", name: "Frango", quantity: "500 g", isExpiring: true, expiresAt: expiresIn(1) },
  ];
}

export function decodeFridge(raw: string): StoredFridge {
  const value: unknown = JSON.parse(raw);
  if (!value || typeof value !== "object") throw new Error("Formato inválido.");
  const data = value as Record<string, unknown>;
  if (data.version === 1) {
    const previous = decodeStoredFridge(raw);
    return {
      consumedCount: previous.consumedCount,
      fridgeItems: previous.items.map((item) => refreshExpiry({
        ...item,
        quantity: `${item.quantity} ${item.quantity === 1 ? "unidade" : "unidades"}`,
        isExpiring: false,
      })),
    };
  }
  if (data.version !== 2 || !Array.isArray(data.fridgeItems) ||
      !Number.isSafeInteger(data.consumedCount) || (data.consumedCount as number) < 0) {
    throw new Error("Dados inválidos.");
  }
  const ids = new Set<string>();
  const fridgeItems = data.fridgeItems.map((value: unknown) => {
    if (!value || typeof value !== "object") throw new Error("Alimento inválido.");
    const item = value as FridgeItem;
    if (typeof item.id !== "string" || !item.id || ids.has(item.id) ||
        typeof item.name !== "string" || !item.name.trim() ||
        typeof item.quantity !== "string" || !item.quantity.trim() ||
        typeof item.isExpiring !== "boolean" ||
        (item.expiresAt !== undefined && (typeof item.expiresAt !== "string" || !isValidDate(item.expiresAt))) ||
        (item.barcode !== undefined && typeof item.barcode !== "string")) {
      throw new Error("Alimento inválido.");
    }
    ids.add(item.id);
    return refreshExpiry({ ...item, name: item.name.trim(), quantity: item.quantity.trim() });
  });
  return { fridgeItems, consumedCount: data.consumedCount as number };
}
