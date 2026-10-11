export type FoodInput = {
  name: string;
  quantity: number;
  expiresAt: string;
  barcode?: string;
};

export type FoodItem = FoodInput & { id: string };

export type FridgeState = { items: FoodItem[]; consumedCount: number };

export type FridgeAction =
  | { type: "add"; item: FoodItem }
  | { type: "remove"; id: string }
  | { type: "consume"; id: string }
  | { type: "hydrate"; state: FridgeState };
