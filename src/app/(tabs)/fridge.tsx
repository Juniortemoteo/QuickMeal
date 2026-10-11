import { useFridge } from "@/context/FridgeContext";
import { FridgeScreen } from "@/features/fridge/FridgeScreen";

export default function FridgeRoute() {
  const fridge = useFridge();
  return <FridgeScreen {...fridge} />;
}
