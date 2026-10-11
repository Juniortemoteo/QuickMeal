import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { theme } from "@/theme";
import { daysUntilExpiry } from "./model";
import type { FoodItem } from "./types";

type FoodCardProps = {
  item: FoodItem;
  onConsume: (id: string) => void;
  onRemove: (id: string) => void;
};

export function FoodCard({ item, onConsume, onRemove }: FoodCardProps) {
  const days = daysUntilExpiry(item.expiresAt);
  const expired = days < 0;
  const urgent = days >= 0 && days <= 3;
  const color =
    expired || urgent
      ? theme.colors.primary
      : days <= 7
        ? theme.colors.expiry.warning
        : theme.colors.expiry.fresh;
  const label = expired
    ? "Vencido"
    : days === 0
      ? "Vence hoje"
      : days === 1
        ? "Vence amanhã"
        : `Vence em ${days} dias`;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View
          style={styles.icon}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        >
          <MaterialCommunityIcons
            name="food-apple-outline"
            size={24}
            color={theme.colors.textSecondary}
          />
        </View>
        <View style={styles.identity}>
          <Text accessibilityRole="header" style={styles.name}>
            {item.name}
          </Text>
          <Text style={styles.quantity}>
            {item.quantity}{" "}
            {item.quantity === 1
              ? "unidade armazenada"
              : "unidades armazenadas"}
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Remover ${item.name}`}
          onPress={() => onRemove(item.id)}
          style={({ pressed }) => [styles.remove, pressed && styles.pressed]}
        >
          <MaterialCommunityIcons
            name="trash-can-outline"
            size={18}
            color={theme.colors.textSecondary}
            accessible={false}
          />
        </Pressable>
      </View>
      <View style={styles.details}>
        <View style={[styles.status, (urgent || expired) && styles.urgent]}>
          <View style={[styles.dot, { backgroundColor: color }]} />
          <Text style={[styles.statusText, { color }]}>{label}</Text>
        </View>
        <Text style={styles.date}>
          Validade · {item.expiresAt.split("-").reverse().join("/")}
        </Text>
      </View>
      <View style={styles.footer}>
        <Text style={styles.hint}>
          {expired ? "Revise este alimento." : "Cada alimento conta."}
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Consumir 1 unidade de ${item.name}`}
          accessibilityState={{ disabled: expired }}
          disabled={expired}
          onPress={() => onConsume(item.id)}
          style={({ pressed }) => [
            styles.consume,
            pressed && styles.pressed,
            expired && styles.disabled,
          ]}
        >
          <MaterialCommunityIcons name="check" size={16} color={theme.colors.primary} accessible={false} />
          <Text style={styles.consumeText}>Consumir 1</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexBasis: 280,
    flexGrow: 1,
    flexShrink: 1,
    minWidth: 0,
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 20,
    gap: 20,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.055,
    shadowRadius: 14,
    elevation: 2,
  },
  header: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  icon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.background,
  },
  identity: { flex: 1, minWidth: 0, gap: 5, paddingTop: 2 },
  name: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "700",
    letterSpacing: -0.3,
    color: theme.colors.text,
  },
  quantity: {
    fontSize: 12,
    lineHeight: 18,
    color: theme.colors.textSecondary,
    opacity: 0.85,
  },
  remove: {
    minWidth: 44,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    marginRight: -10,
    marginTop: -6,
  },
  details: { gap: 10, alignItems: "flex-start" },
  status: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 12,
    maxWidth: "100%",
  },
  urgent: { backgroundColor: theme.colors.softRed },
  dot: { width: 5, height: 5, borderRadius: 3, flexShrink: 0 },
  statusText: {
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "600",
    flexShrink: 1,
  },
  date: { fontSize: 12, lineHeight: 18, color: theme.colors.textSecondary },
  footer: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingTop: 12,
    marginTop: "auto",
  },
  hint: {
    fontSize: 11,
    lineHeight: 17,
    color: theme.colors.textSecondary,
    flexShrink: 1,
  },
  consume: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 12,
    backgroundColor: theme.colors.softRed,
  },
  consumeText: { fontSize: 12, fontWeight: "700", color: theme.colors.primary },
  pressed: { opacity: 0.65 },
  disabled: { opacity: 0.4 },
});
