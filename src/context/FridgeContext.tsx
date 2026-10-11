import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useCallback, useContext, useEffect, useRef, useState, type PropsWithChildren } from "react";
import { createInitialItems, decodeFridge, refreshExpiry, type FridgeItem, type NewFoodItem } from "./fridgeState";
import { isValidDate } from "@/features/fridge/model";

export type { FridgeItem, NewFoodItem } from "./fridgeState";
export type FridgeContextValue = {
  fridgeItems: FridgeItem[];
  addFoodItem: (item: NewFoodItem) => void;
  removeFoodItem: (id: string) => void;
  ready: boolean;
  storageError: string | null;
  consumedCount: number;
};

const STORAGE_KEY = "@quick-meal/fridge:v2";
const LEGACY_STORAGE_KEY = "@quick-meal/fridge:v1";
const FridgeContext = createContext<FridgeContextValue | undefined>(undefined);

export function FridgeProvider({ children }: PropsWithChildren) {
  const [fridgeItems, setFridgeItems] = useState<FridgeItem[]>(createInitialItems);
  const [consumedCount, setConsumedCount] = useState(0);
  const [ready, setReady] = useState(false);
  const [storageError, setStorageError] = useState<string | null>(null);
  const sequence = useRef(0);
  const writes = useRef(Promise.resolve());
  const canPersist = useRef(false);

  useEffect(() => {
    let active = true;
    async function restore() {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        const raw = saved ?? await AsyncStorage.getItem(LEGACY_STORAGE_KEY);
        const restored = raw === null ? null : decodeFridge(raw);
        if (!active) return;
        if (restored) {
          setFridgeItems(restored.fridgeItems);
          setConsumedCount(restored.consumedCount);
        }
        canPersist.current = true;
      } catch {
        if (active) setStorageError("Não foi possível restaurar a geladeira. As alterações desta sessão não serão salvas para preservar os dados anteriores.");
      } finally {
        if (active) setReady(true);
      }
    }
    void restore();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!ready || !canPersist.current) return;
    const snapshot = JSON.stringify({ version: 2, fridgeItems, consumedCount });
    // Mantém a ordem das gravações, inclusive quando há várias alterações rápidas.
    writes.current = writes.current
      .then(() => AsyncStorage.setItem(STORAGE_KEY, snapshot))
      .then(() => setStorageError(null))
      .catch(() => setStorageError("Alterações disponíveis nesta sessão, mas não foi possível salvá-las no aparelho."));
  }, [fridgeItems, consumedCount, ready]);

  const addFoodItem = useCallback((input: NewFoodItem) => {
    if (!ready) throw new Error("Aguarde o carregamento da geladeira.");
    const name = input.name.trim();
    const quantity = input.quantity.trim();
    if (!name || name.length > 80) throw new Error("Informe um nome com 1 a 80 caracteres.");
    if (!quantity) throw new Error("Informe a quantidade do alimento.");
    if (input.expiresAt && !isValidDate(input.expiresAt)) throw new Error("Informe uma validade válida.");
    const item = refreshExpiry({ ...input, name, quantity, id: `${Date.now()}-${++sequence.current}-${Math.random().toString(36).slice(2, 10)}` });
    setFridgeItems((current) => [item, ...current]);
  }, [ready]);

  const removeFoodItem = useCallback((id: string) => {
    if (!ready) return;
    setFridgeItems((current) => current.filter((item) => item.id !== id));
  }, [ready]);

  return (
    <FridgeContext.Provider value={{ fridgeItems, addFoodItem, removeFoodItem, ready, storageError, consumedCount }}>
      {children}
    </FridgeContext.Provider>
  );
}

export function useFridge(): FridgeContextValue {
  const context = useContext(FridgeContext);
  if (!context) throw new Error("useFridge deve estar dentro de FridgeProvider.");
  return context;
}
