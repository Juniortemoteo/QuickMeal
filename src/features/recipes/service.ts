import { daysUntilExpiry } from "../fridge/model.ts";
import type { FoodItem } from "../fridge/types.ts";

export type RecipeSuggestion = {
  id: string;
  title: string;
  minutes: number;
  ingredients: string[];
  steps: string[];
  available: string[];
  missing: string[];
  urgentMatches: number;
};

const catalog = [
  {
    id: "omelete",
    title: "Omelete de tomate",
    minutes: 10,
    ingredients: ["ovo", "tomate"],
    steps: [
      "Lave e pique o tomate.",
      "Bata os ovos e misture o tomate.",
      "Cozinhe em uma frigideira até os ovos ficarem firmes.",
    ],
  },
  {
    id: "arroz",
    title: "Arroz com cenoura",
    minutes: 25,
    ingredients: ["arroz", "cenoura"],
    steps: [
      "Lave e rale a cenoura.",
      "Refogue a cenoura e adicione o arroz.",
      "Cubra com água e cozinhe até ficar macio.",
    ],
  },
  {
    id: "salada",
    title: "Salada fresca",
    minutes: 10,
    ingredients: ["alface", "tomate", "cenoura"],
    steps: [
      "Higienize as folhas e os legumes.",
      "Pique o tomate e rale a cenoura.",
      "Misture e tempere a gosto.",
    ],
  },
];

function normalize(name: string) {
  const normalized = name
    .trim()
    .toLocaleLowerCase("pt-BR")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  const aliases: Record<string, string> = {
    ovos: "ovo",
    tomates: "tomate",
    cenouras: "cenoura",
    alfaces: "alface",
  };
  return aliases[normalized] ?? normalized;
}

/** Local adapter. Replace with a backend call when the AI service is available. */
export function suggestRecipes(
  items: FoodItem[],
  today?: string,
): RecipeSuggestion[] {
  const usable = items.filter(
    (item) => daysUntilExpiry(item.expiresAt, today) >= 0,
  );
  return catalog
    .map((recipe) => {
      const available = recipe.ingredients.filter((ingredient) =>
        usable.some((item) => normalize(item.name) === ingredient),
      );
      const urgentMatches = recipe.ingredients.filter((ingredient) =>
        usable.some(
          (item) =>
            normalize(item.name) === ingredient &&
            daysUntilExpiry(item.expiresAt, today) <= 3,
        ),
      ).length;
      return {
        ...recipe,
        available,
        missing: recipe.ingredients.filter(
          (ingredient) => !available.includes(ingredient),
        ),
        urgentMatches,
      };
    })
    .filter((recipe) => recipe.available.length > 0)
    .sort(
      (a, b) =>
        b.urgentMatches - a.urgentMatches ||
        b.available.length / b.ingredients.length -
          a.available.length / a.ingredients.length,
    );
}
