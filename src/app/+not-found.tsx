import { router } from "expo-router";
import { Button, Screen } from "@/components/ui";

export default function NotFound() {
  return (
    <Screen
      title="Página não encontrada"
      subtitle="Volte ao início para cuidar da sua geladeira."
    >
      <Button label="Ir para o início" onPress={() => router.replace("/")} />
    </Screen>
  );
}
