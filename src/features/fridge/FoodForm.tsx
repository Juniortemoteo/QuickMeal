import { useState } from "react";
import { Text } from "react-native";
import { Body, Button, Card, Field, Heading, styles } from "@/components/ui";
import { useFridge } from "@/context/FridgeContext";
import { localDate, validateFood, daysUntilExpiry } from "./model";

export function FoodForm({
  barcode,
  onSaved,
}: {
  barcode?: string;
  onSaved?: () => void;
}) {
  const { addFoodItem } = useFridge();
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [expiresAt, setExpiresAt] = useState(localDate());
  const [message, setMessage] = useState<string | null>(null);
  function save() {
    try {
      const error = validateFood({ name, quantity: Number(quantity), expiresAt });
      if (error) throw new Error(error);
      const days = daysUntilExpiry(expiresAt);
      addFoodItem({
        name,
        quantity: `${Number(quantity)} ${Number(quantity) === 1 ? "unidade" : "unidades"}`,
        isExpiring: days >= 0 && days <= 3,
        expiresAt,
        ...(barcode ? { barcode } : {}),
      });
      setName("");
      setQuantity("1");
      setExpiresAt(localDate());
      setMessage("Alimento adicionado à geladeira.");
      onSaved?.();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Não foi possível adicionar.",
      );
    }
  }
  return (
    <Card>
      <Heading>Adicionar alimento</Heading>
      {barcode && (
        <Body>
          Código lido: {barcode}. Confira o nome e a validade na embalagem.
        </Body>
      )}
      <Field
        label="Nome do alimento"
        value={name}
        maxLength={80}
        placeholder="Ex.: tomate"
        onChangeText={(value) => {
          setName(value);
          setMessage(null);
        }}
      />
      <Field
        label="Quantidade (unidades)"
        keyboardType="number-pad"
        value={quantity}
        maxLength={3}
        onChangeText={(value) => {
          setQuantity(value);
          setMessage(null);
        }}
      />
      <Field
        label="Validade (AAAA-MM-DD)"
        value={expiresAt}
        maxLength={10}
        autoCapitalize="none"
        placeholder="2026-12-31"
        onChangeText={(value) => {
          setExpiresAt(value);
          setMessage(null);
        }}
      />
      {message && (
        <Text
          accessibilityRole="alert"
          accessibilityLiveRegion="polite"
          style={styles.notice}
        >
          {message}
        </Text>
      )}
      <Button label="Salvar na geladeira" onPress={save} />
    </Card>
  );
}
