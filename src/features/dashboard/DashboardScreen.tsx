import { router } from "expo-router";
import { Text, View } from "react-native";
import { Body, Button, Card, Heading, Screen, styles } from "@/components/ui";
import { useFridge } from "@/context/FridgeContext";
import { daysUntilExpiry } from "@/features/fridge/model";

export function DashboardScreen() {
  const { fridgeItems: items, consumedCount } = useFridge();
  const urgent = items.filter((item) => {
    if (!item.expiresAt) return item.isExpiring;
    const days = daysUntilExpiry(item.expiresAt);
    return days >= 0 && days <= 3;
  });
  const expired = items.filter((item) => item.expiresAt && daysUntilExpiry(item.expiresAt) < 0);
  return (
    <Screen
      title="Sua próxima refeição começa aqui."
      subtitle="Cuide do que você já tem. Aproveite mais, desperdice menos."
    >
      <Card>
        <Text style={styles.sectionEyebrow}>RESUMO DA SUA GELADEIRA</Text>
        <Heading>Sua geladeira em números</Heading>
        <View style={styles.metricGrid}>
          <View style={styles.metricTile}>
            <Text style={styles.metricLabel}>Na geladeira</Text>
            <View style={styles.metricValueRow}>
              <Text style={styles.metricValue}>
                {items.length}
              </Text>
              <Text style={styles.metricUnit}>alimentos</Text>
            </View>
          </View>
          <View style={[styles.metricTile, styles.metricUrgent]}>
            <Text style={[styles.metricLabel, styles.metricUrgentText]}>
              Vencem em até 3 dias
            </Text>
            <View style={styles.metricValueRow}>
              <Text style={[styles.metricValue, styles.metricUrgentValue]}>
                {urgent.length}
              </Text>
              <Text style={[styles.metricUnit, styles.metricUrgentText]}>
                alimentos
              </Text>
            </View>
          </View>
          <View style={styles.metricTile}>
            <Text style={styles.metricLabel}>Você já aproveitou</Text>
            <View style={styles.metricValueRow}>
              <Text style={styles.metricValue}>{consumedCount}</Text>
              <Text style={styles.metricUnit}>unidades</Text>
            </View>
          </View>
        </View>
        {expired.length > 0 && (
          <Body>
            {expired.length} alimentos vencidos — revise sua geladeira.
          </Body>
        )}
      </Card>
      <Button
        label="Abrir minha geladeira"
        onPress={() => router.navigate("/fridge")}
      />
      <Button
        label="Escanear um alimento"
        secondary
        onPress={() => router.navigate("/scanner")}
      />
      <Card>
        <Heading>O que preparar hoje?</Heading>
        <Body>
          Veja ideias com os ingredientes cadastrados, priorizando os que vencem
          primeiro.
        </Body>
        <Button
          label="Explorar receitas"
          onPress={() => router.navigate("/recipes")}
        />
      </Card>
    </Screen>
  );
}
