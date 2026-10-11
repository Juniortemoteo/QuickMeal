import { useState, type ComponentProps } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import type { FridgeContextValue } from "@/context/FridgeContext";
import { daysUntilExpiry } from "./model";

type Food = {
  id: string;
  name: string;
  amount: string;
  expiry: string;
  status: "normal" | "soon";
  expired: boolean;
  icon: ComponentProps<typeof MaterialCommunityIcons>["name"];
};

type Filter = "all" | "soon";

const colors = {
  background: "#F8F7F5",
  card: "#FFFFFF",
  text: "#302729",
  muted: "#796E71",
  border: "#ECE7E6",
  red: "#CC3040",
  redSoft: "#FFF0F2",
  green: "#426B54",
  greenSoft: "#F1F6F2",
  iconBackground: "#F7F5F4",
  shadow: "#392329",
};

function FoodTile({ food, onRemove }: { food: Food; onRemove: (id: string) => void }) {
  const urgent = food.status === "soon" || food.expired;
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.foodIcon} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
          <MaterialCommunityIcons name={food.icon} size={32} color={colors.red} accessible={false} />
        </View>
        <View style={styles.foodIdentity}>
          <Text accessibilityRole="header" style={styles.foodName}>{food.name}</Text>
          <Text style={styles.amount}>{food.amount}</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Remover ${food.name}`}
          onPress={() => onRemove(food.id)}
          style={({ pressed }) => [styles.removeButton, pressed && styles.pressed]}
          hitSlop={6}
        >
          <MaterialCommunityIcons name="trash-can-outline" size={19} color={colors.muted} accessible={false} />
        </Pressable>
      </View>
      <View style={styles.cardDivider} />
      <Text style={styles.expiryCaption}>VALIDADE</Text>
      <View style={[styles.tag, urgent ? styles.urgentTag : styles.normalTag]}>
        <View style={[styles.dot, { backgroundColor: urgent ? colors.red : colors.green }]} />
        <Text style={[styles.tagText, { color: urgent ? colors.red : colors.green }]}>{food.expiry}</Text>
      </View>
    </View>
  );
}

type FridgeScreenProps = Pick<FridgeContextValue, "fridgeItems" | "addFoodItem" | "removeFoodItem" | "ready" | "storageError">;

export function FridgeScreen({ fridgeItems, addFoodItem, removeFoodItem, ready, storageError }: FridgeScreenProps) {
  const [foodName, setFoodName] = useState("");
  const [foodAmount, setFoodAmount] = useState("");
  const [activeFilter, setActiveFilter] = useState<Filter>("all");
  const [formError, setFormError] = useState<string | null>(null);
  const { width, fontScale } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const contentWidth = Math.max(0, Math.min(width - insets.left - insets.right, 920) - 40);
  const columns = fontScale > 1.4 ? 1 : contentWidth >= 780 ? 3 : contentWidth >= 520 ? 2 : 1;
  const itemWidth = (contentWidth - (columns - 1) * 16) / columns;
  const foodItems: Food[] = (ready ? fridgeItems : []).map((item) => {
    const name = item.name.toLowerCase();
    const days = item.expiresAt ? daysUntilExpiry(item.expiresAt) : null;
    return {
      id: item.id,
      name: item.name,
      amount: item.quantity,
      status: item.isExpiring ? "soon" : "normal",
      expired: days !== null && days < 0,
      expiry: days === null ? (item.isExpiring ? "Vence em breve" : "Validade não informada")
        : days < 0 ? "Validade vencida" : days === 0 ? "Vence hoje"
        : days === 1 ? "Vence amanhã" : days <= 3 ? `Vence em ${days} dias` : "Dentro da validade",
      icon: name.includes("tomate") ? "food-apple-outline" : name.includes("leite")
        ? "bottle-soda-classic-outline" : name.includes("frango") ? "food-drumstick-outline" : "food-variant",
    };
  });
  const soonCount = foodItems.filter((food) => food.status === "soon").length;
  const foods = foodItems.filter((food) => activeFilter === "all" || food.status === "soon");

  function addFood() {
    const name = foodName.trim();
    const amount = foodAmount.trim();
    if (!name || !amount) return;

    try {
      addFoodItem({ name, quantity: amount, isExpiring: false });
      setFoodName("");
      setFoodAmount("");
      setFormError(null);
      setActiveFilter("all");
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Não foi possível adicionar o alimento.");
    }
  }

  return (
    <SafeAreaView edges={["top", "left", "right"]} style={styles.screen}>
      <FlatList
        key={columns}
        data={foods}
        numColumns={columns}
        keyExtractor={(food) => food.id}
        style={styles.list}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={columns > 1 ? styles.gridRow : undefined}
        ItemSeparatorComponent={() => <View style={styles.rowGap} />}
        ListHeaderComponent={
          <View style={styles.header}>
            {storageError && <Text accessibilityRole="alert" style={styles.summaryText}>{storageError}</Text>}
            <View style={styles.brandRow}>
              <View style={styles.brandMark} accessibilityElementsHidden importantForAccessibility="no-hide-descendants"><MaterialCommunityIcons name="leaf" size={19} color={colors.card} accessible={false} /></View>
              <Text style={styles.brandName}>QUICK MEAL</Text>
            </View>
            <View style={styles.titleBlock}>
              <View style={styles.fridgeIllustration} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
                <MaterialCommunityIcons name="fridge-outline" size={40} color={colors.red} accessible={false} />
              </View>
              <View style={styles.titleCopy}>
                <Text accessibilityRole="header" style={styles.title}>Minha geladeira</Text>
                <Text style={styles.subtitle}>Tudo o que você tem, pronto para ser aproveitado.</Text>
              </View>
            </View>
            <View style={styles.summary}>
              <View style={styles.summaryIcon} accessibilityElementsHidden importantForAccessibility="no-hide-descendants"><MaterialCommunityIcons name="clock-outline" size={23} color={colors.red} accessible={false} /></View>
              <View style={styles.summaryCopy}>
                <Text style={styles.summaryTitle}>Um pouco de atenção, menos desperdício.</Text>
                <Text style={styles.summaryText}>{soonCount} alimentos para aproveitar primeiro.</Text>
              </View>
            </View>
            <View style={styles.filters}>
              <Pressable accessibilityRole="button" accessibilityState={{ selected: activeFilter === "all" }} onPress={() => setActiveFilter("all")} style={({ pressed }) => [styles.filter, activeFilter === "all" && styles.selectedFilter, pressed && styles.pressed]}>
                <MaterialCommunityIcons name="view-grid-outline" size={18} color={activeFilter === "all" ? colors.card : colors.muted} accessible={false} />
                <Text style={[styles.filterText, activeFilter === "all" && styles.selectedFilterText]}>Todos · {foodItems.length}</Text>
              </Pressable>
              <Pressable accessibilityRole="button" accessibilityState={{ selected: activeFilter === "soon" }} onPress={() => setActiveFilter("soon")} style={({ pressed }) => [styles.filter, activeFilter === "soon" && styles.selectedFilter, pressed && styles.pressed]}>
                <MaterialCommunityIcons name="clock-alert-outline" size={18} color={activeFilter === "soon" ? colors.card : colors.muted} accessible={false} />
                <Text style={[styles.filterText, activeFilter === "soon" && styles.selectedFilterText]}>Vencem logo · {soonCount}</Text>
              </Pressable>
            </View>
            <View style={styles.addForm}>
              <Text style={styles.formTitle}>Adicionar alimento</Text>
              <TextInput
                accessibilityLabel="Nome do alimento"
                placeholder="Ex.: Cenoura"
                placeholderTextColor={colors.muted}
                returnKeyType="next"
                value={foodName}
                maxLength={80}
                onChangeText={setFoodName}
                style={styles.input}
              />
              <TextInput
                accessibilityLabel="Quantidade do alimento"
                placeholder="Ex.: 4 unidades, 1 L, 500 g"
                placeholderTextColor={colors.muted}
                returnKeyType="done"
                value={foodAmount}
                onChangeText={setFoodAmount}
                onSubmitEditing={addFood}
                style={styles.input}
              />
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Adicionar alimento"
                accessibilityState={{ disabled: !ready }}
                disabled={!ready}
                onPress={addFood}
                style={({ pressed }) => [styles.addButton, pressed && styles.pressed]}
              >
                <MaterialCommunityIcons name="plus" size={20} color={colors.card} accessible={false} />
                <Text style={styles.addButtonText}>Adicionar</Text>
              </Pressable>
              {formError && <Text accessibilityRole="alert" style={styles.summaryText}>{formError}</Text>}
            </View>
            <View style={styles.listHeading}>
              <Text accessibilityRole="header" style={styles.sectionTitle}>Seus alimentos</Text>
              <Text style={styles.itemCount}>{foods.length} itens</Text>
            </View>
          </View>
        }
        renderItem={({ item }) => <View style={{ width: itemWidth }}><FoodTile food={item} onRemove={removeFoodItem} /></View>}
        ListEmptyComponent={<Text style={styles.demoNote}>{ready ? "Nenhum alimento nesta lista. Adicione um item acima." : "Carregando geladeira…"}</Text>}
        ListFooterComponent={<Text style={styles.demoNote}>Sua geladeira conectada às sugestões de receitas.</Text>}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  list: { width: "100%", maxWidth: 920, alignSelf: "center" },
  listContent: { padding: 20, paddingBottom: 40 },
  gridRow: { gap: 16, alignItems: "stretch" },
  rowGap: { height: 16 },
  header: { gap: 24, paddingTop: 8, paddingBottom: 16 },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  brandMark: { width: 32, height: 32, borderRadius: 10, alignItems: "center", justifyContent: "center", backgroundColor: colors.red },
  brandName: { color: colors.red, fontSize: 12, fontWeight: "800", letterSpacing: 1.6 },
  titleBlock: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 16 },
  titleCopy: { flexGrow: 1, flexShrink: 1, flexBasis: 220, minWidth: 0, gap: 8 },
  fridgeIllustration: { width: 72, height: 72, flexShrink: 0, borderRadius: 16, alignItems: "center", justifyContent: "center", backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, shadowColor: colors.shadow, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.04, shadowRadius: 10, elevation: 2 },
  title: { color: colors.text, fontSize: 30, lineHeight: 37, fontWeight: "800", letterSpacing: -0.8 },
  subtitle: { color: colors.muted, fontSize: 15, lineHeight: 23 },
  summary: { flexDirection: "row", alignItems: "center", gap: 12, padding: 16, backgroundColor: colors.redSoft, borderRadius: 14 },
  summaryIcon: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  summaryCopy: { flex: 1, minWidth: 0, gap: 4 },
  summaryTitle: { color: colors.text, fontSize: 13, lineHeight: 19, fontWeight: "600" },
  summaryText: { color: colors.muted, fontSize: 12, lineHeight: 18 },
  filters: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  filter: { minHeight: 44, maxWidth: "100%", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingHorizontal: 18, paddingVertical: 12, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 14 },
  selectedFilter: { backgroundColor: colors.red, borderColor: colors.red },
  filterText: { color: colors.muted, fontSize: 13, lineHeight: 18, fontWeight: "600", flexShrink: 1 },
  selectedFilterText: { color: colors.card },
  pressed: { opacity: 0.8 },
  listHeading: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 8 },
  sectionTitle: { color: colors.text, fontSize: 17, lineHeight: 24, fontWeight: "700" },
  itemCount: { color: colors.muted, fontSize: 12, lineHeight: 18 },
  card: { flex: 1, backgroundColor: colors.card, borderRadius: 14, borderWidth: 1, borderColor: colors.border, padding: 20, shadowColor: colors.shadow, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 3 },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: 14 },
  foodIcon: { width: 56, height: 56, flexShrink: 0, borderRadius: 14, backgroundColor: colors.redSoft, alignItems: "center", justifyContent: "center" },
  foodIdentity: { flex: 1, minWidth: 0, gap: 5 },
  removeButton: { width: 40, height: 40, flexShrink: 0, alignItems: "center", justifyContent: "center", borderRadius: 12, backgroundColor: colors.background },
  foodName: { color: colors.text, fontSize: 18, lineHeight: 25, fontWeight: "700", letterSpacing: -0.25 },
  amount: { color: colors.muted, fontSize: 13, lineHeight: 19, opacity: 0.85 },
  cardDivider: { height: 1, backgroundColor: colors.border, marginVertical: 20 },
  expiryCaption: { color: colors.muted, fontSize: 10, lineHeight: 15, fontWeight: "600", letterSpacing: 1.2, marginBottom: 9 },
  tag: { alignSelf: "flex-start", flexDirection: "row", alignItems: "center", gap: 7, paddingHorizontal: 10, paddingVertical: 7, borderRadius: 10, maxWidth: "100%" },
  urgentTag: { backgroundColor: colors.redSoft },
  normalTag: { backgroundColor: colors.greenSoft },
  dot: { width: 5, height: 5, borderRadius: 3, flexShrink: 0 },
  tagText: { fontSize: 12, lineHeight: 18, fontWeight: "600", flexShrink: 1 },
  addForm: { gap: 12, padding: 16, backgroundColor: colors.card, borderRadius: 16, borderWidth: 1, borderColor: colors.border, shadowColor: colors.shadow, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.045, shadowRadius: 10, elevation: 2 },
  formTitle: { color: colors.text, fontSize: 15, lineHeight: 21, fontWeight: "700" },
  input: { minHeight: 48, paddingHorizontal: 14, paddingVertical: 11, backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border, borderRadius: 14, color: colors.text, fontSize: 14 },
  addButton: { minHeight: 48, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingHorizontal: 16, backgroundColor: colors.red, borderRadius: 14 },
  addButtonText: { color: colors.card, fontSize: 14, fontWeight: "700" },
  demoNote: { textAlign: "center", color: colors.muted, fontSize: 11, lineHeight: 18, marginTop: 24 },
});
