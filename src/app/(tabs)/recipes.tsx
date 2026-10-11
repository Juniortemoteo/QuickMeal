import { useState, type ComponentProps } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { FlatList, Image, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { theme } from "@/theme";
import { useFridge } from "@/context/FridgeContext";
import { countRecipeMatches } from "@/features/recipes/matching";

type Category = "Todas" | "Rápidas" | "Com o que tenho" | "Sobremesas" | "Saudáveis";
type IconName = ComponentProps<typeof MaterialCommunityIcons>["name"];
type Recipe = {
  id: string;
  title: string;
  description: string;
  minutes: number;
  difficulty: "Fácil" | "Intermediário";
  image: string;
  imageLabel: string;
  categories: Category[];
  ingredients: string[];
};

const FILTERS: { label: Category; icon: IconName }[] = [
  { label: "Todas", icon: "silverware-fork-knife" },
  { label: "Rápidas", icon: "timer-outline" },
  { label: "Com o que tenho", icon: "fridge-outline" },
  { label: "Sobremesas", icon: "cupcake" },
  { label: "Saudáveis", icon: "leaf" },
];

// Catálogo local: o aproveitamento é calculado a partir da geladeira global.
const RECIPES: Recipe[] = [
  {
    id: "omelete",
    title: "Omelete Proteico",
    description: "Um clássico leve para dar uma nova chance aos ingredientes do dia.",
    minutes: 15,
    difficulty: "Fácil",
    image: "https://images.unsplash.com/photo-1510693206972-df098062cb71?auto=format&fit=crop&w=1000&q=85",
    imageLabel: "Foto ilustrativa de uma refeição com ovos",
    categories: ["Rápidas", "Saudáveis"],
    ingredients: ["Ovos", "Tomate", "Queijo"],
  },
  {
    id: "arroz-forno",
    title: "Arroz de Forno Prático",
    description: "O arroz que sobrou vira protagonista, com legumes e muito sabor.",
    minutes: 35,
    difficulty: "Fácil",
    image: "https://images.unsplash.com/photo-1516684732162-798a0062be99?auto=format&fit=crop&w=1000&q=85",
    imageLabel: "Foto ilustrativa de um prato de arroz",
    categories: [],
    ingredients: ["Arroz", "Frango", "Cenoura", "Queijo"],
  },
  {
    id: "panqueca",
    title: "Panqueca Rápida",
    description: "Uma pausa doce e simples para aproveitar o que já está em casa.",
    minutes: 20,
    difficulty: "Fácil",
    image: "https://images.unsplash.com/photo-1506084868230-bb9d95c24759?auto=format&fit=crop&w=1000&q=85",
    imageLabel: "Foto ilustrativa de panquecas com frutas",
    categories: ["Rápidas", "Sobremesas"],
    ingredients: ["Leite", "Ovos", "Banana"],
  },
];

function RecipeCard({ recipe }: { recipe: Recipe & { fridgeItems: number } }) {
  const [imageFailed, setImageFailed] = useState(false);
  return (
    <View style={styles.card}>
      <View style={styles.photoFrame}>
        <View style={styles.photoPlaceholder} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
          <MaterialCommunityIcons name="silverware-fork-knife" size={42} color={theme.colors.primary} accessible={false} />
          {imageFailed && <Text style={styles.fallbackText}>Feito com o que você tem</Text>}
        </View>
        {!imageFailed && (
          <Image
            source={{ uri: recipe.image }}
            style={styles.photo}
            resizeMode="cover"
            accessibilityLabel={recipe.imageLabel}
            onError={() => setImageFailed(true)}
          />
        )}
        <View style={styles.photoBadge}>
          <MaterialCommunityIcons name="chef-hat" size={16} color={theme.colors.primary} accessible={false} />
          <Text style={styles.photoBadgeText}>SIMPLES E GOSTOSO</Text>
        </View>
      </View>
      <View style={styles.cardBody}>
        <Text accessibilityRole="header" style={styles.recipeTitle}>{recipe.title}</Text>
        <View style={styles.metadata}>
          <View style={styles.metaItem}>
            <MaterialCommunityIcons name="clock-outline" size={17} color={theme.colors.textSecondary} accessible={false} />
            <Text style={styles.metaText}>{recipe.minutes} min</Text>
          </View>
          <View style={styles.metaItem}>
            <MaterialCommunityIcons name="chef-hat" size={17} color={theme.colors.textSecondary} accessible={false} />
            <Text style={styles.metaText}>{recipe.difficulty}</Text>
          </View>
        </View>
        <Text style={styles.description}>{recipe.description}</Text>
        <Text style={styles.ingredients}>{recipe.ingredients.join(" · ")}</Text>
        <View style={styles.savingsTag}>
          <MaterialCommunityIcons name="fridge-outline" size={20} color={theme.colors.primary} accessible={false} />
          <Text style={styles.savingsText}>Aproveita {recipe.fridgeItems} itens da sua geladeira!</Text>
        </View>
      </View>
    </View>
  );
}

export default function RecipesScreen() {
  const { fridgeItems, ready } = useFridge();
  const [selectedCategory, setSelectedCategory] = useState<Category>("Todas");
  const { width, fontScale } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const contentWidth = Math.max(0, Math.min(width - insets.left - insets.right, 1000) - 40);
  const columns = contentWidth >= 620 && fontScale <= 1.4 ? 2 : 1;
  const cardWidth = (contentWidth - (columns - 1) * 20) / columns;
  const recipes = RECIPES.map((recipe) => ({ ...recipe, fridgeItems: countRecipeMatches(recipe.ingredients, ready ? fridgeItems : []) }));
  const filteredRecipes = recipes.filter((recipe) => selectedCategory === "Todas"
    || (selectedCategory === "Com o que tenho" ? recipe.fridgeItems > 0 : recipe.categories.includes(selectedCategory)));

  return (
    <SafeAreaView edges={["top", "left", "right"]} style={styles.screen}>
      <FlatList
        key={columns}
        data={filteredRecipes}
        keyExtractor={(recipe) => recipe.id}
        numColumns={columns}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={columns > 1 ? styles.gridRow : undefined}
        ItemSeparatorComponent={() => <View style={styles.rowGap} />}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={styles.brandRow}>
              <MaterialCommunityIcons name="chef-hat" size={23} color={theme.colors.primary} accessible={false} />
              <Text style={styles.brand}>QUICK MEAL</Text>
            </View>
            <View style={styles.hero}>
              <Text style={styles.eyebrow}>MAIS SABOR, MENOS DESPERDÍCIO</Text>
              <Text accessibilityRole="header" style={styles.title}>O que vamos cozinhar hoje?</Text>
              <Text style={styles.subtitle}>Transforme o que já está na sua geladeira em uma boa refeição. Cada ingrediente aproveitado faz a diferença.</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
              {FILTERS.map(({ label, icon }) => {
                const selected = label === selectedCategory;
                return (
                  <Pressable
                    key={label}
                    accessibilityRole="button"
                    accessibilityLabel={label}
                    accessibilityState={{ selected }}
                    onPress={() => setSelectedCategory(label)}
                    style={({ pressed }) => [styles.filter, selected && styles.selectedFilter, pressed && styles.pressed]}
                  >
                    <MaterialCommunityIcons name={icon} size={18} color={selected ? theme.colors.onPrimary : theme.colors.textSecondary} accessible={false} />
                    <Text style={[styles.filterText, selected && styles.selectedFilterText]}>{label}</Text>
                  </Pressable>
                );
              })}
            </ScrollView>
            <View style={styles.sectionRow}>
              <Text accessibilityRole="header" style={styles.sectionTitle}>{selectedCategory === "Todas" ? "Para inspirar seu dia" : selectedCategory}</Text>
              <Text accessibilityLiveRegion="polite" style={styles.count}>{filteredRecipes.length} {filteredRecipes.length === 1 ? "receita" : "receitas"}</Text>
            </View>
          </View>
        }
        renderItem={({ item }) => <View style={{ width: cardWidth }}><RecipeCard recipe={item} /></View>}
        ListEmptyComponent={<Text style={styles.emptyText}>Nenhuma receita nesta categoria por enquanto.</Text>}
        ListFooterComponent={<Text style={styles.demoNote}>Aproveitamento calculado com os ingredientes da sua geladeira. Fotos ilustrativas: Unsplash.</Text>}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.colors.background },
  list: { width: "100%", maxWidth: 1000, alignSelf: "center" },
  listContent: { padding: 20, paddingBottom: 40 },
  header: { gap: 22, paddingTop: 8, paddingBottom: 18 },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 9 },
  brand: { fontSize: 12, fontWeight: "800", letterSpacing: 1.6, color: theme.colors.primary },
  hero: { padding: 24, gap: 12, backgroundColor: theme.colors.softRed, borderWidth: 1, borderColor: theme.colors.softRedBorder, borderRadius: 16 },
  eyebrow: { color: theme.colors.primary, fontSize: 10, lineHeight: 16, letterSpacing: 1.3, fontWeight: "800" },
  title: { color: theme.colors.text, fontSize: 30, lineHeight: 38, fontWeight: "800", letterSpacing: -0.8, maxWidth: 520 },
  subtitle: { color: theme.colors.textSecondary, fontSize: 15, lineHeight: 23, maxWidth: 580 },
  filters: { gap: 10, paddingVertical: 2 },
  filter: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, minHeight: 46, paddingHorizontal: 16, paddingVertical: 12, backgroundColor: "#F0ECEB", borderRadius: 14 },
  selectedFilter: { backgroundColor: theme.colors.primary },
  filterText: { color: theme.colors.textSecondary, fontSize: 13, fontWeight: "600" },
  selectedFilterText: { color: theme.colors.onPrimary },
  pressed: { opacity: 0.8 },
  sectionRow: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 8 },
  sectionTitle: { color: theme.colors.text, fontSize: 18, lineHeight: 26, fontWeight: "700" },
  count: { color: theme.colors.textSecondary, fontSize: 12, lineHeight: 18 },
  gridRow: { gap: 20, alignItems: "stretch" },
  rowGap: { height: 20 },
  card: { flex: 1, backgroundColor: theme.colors.surface, borderRadius: 16, borderWidth: 1, borderColor: theme.colors.border, shadowColor: theme.colors.shadow, shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.065, shadowRadius: 14, elevation: 3 },
  photoFrame: { aspectRatio: 1.8, borderTopLeftRadius: 16, borderTopRightRadius: 16, overflow: "hidden", backgroundColor: theme.colors.softRed },
  photo: { width: "100%", height: "100%" },
  photoPlaceholder: { ...StyleSheet.absoluteFill, alignItems: "center", justifyContent: "center", gap: 10, padding: 20 },
  fallbackText: { color: theme.colors.primary, fontSize: 13, textAlign: "center" },
  photoBadge: { position: "absolute", top: 14, left: 14, right: 14, alignSelf: "flex-start", flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "rgba(255,255,255,0.95)", borderRadius: 10, paddingHorizontal: 10, paddingVertical: 7, maxWidth: 240 },
  photoBadgeText: { color: theme.colors.primary, fontSize: 9, lineHeight: 14, fontWeight: "800", letterSpacing: 0.7, flexShrink: 1 },
  cardBody: { flex: 1, padding: 20, gap: 12 },
  recipeTitle: { color: theme.colors.text, fontSize: 21, lineHeight: 29, fontWeight: "800", letterSpacing: -0.4 },
  metadata: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 16 },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  metaText: { color: theme.colors.textSecondary, fontSize: 13, lineHeight: 19 },
  description: { color: theme.colors.textSecondary, fontSize: 14, lineHeight: 22 },
  ingredients: { color: theme.colors.text, fontSize: 12, lineHeight: 19, fontWeight: "500" },
  savingsTag: { flexDirection: "row", alignItems: "center", gap: 9, backgroundColor: theme.colors.softRed, borderRadius: 12, padding: 12, marginTop: "auto" },
  savingsText: { flex: 1, color: theme.colors.primary, fontSize: 12, lineHeight: 18, fontWeight: "700" },
  emptyText: { padding: 24, color: theme.colors.textSecondary, textAlign: "center" },
  demoNote: { marginTop: 24, color: theme.colors.textSecondary, textAlign: "center", fontSize: 11, lineHeight: 18 },
});
