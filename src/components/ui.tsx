import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { PropsWithChildren } from "react";
import { useFridge } from "@/context/FridgeContext";
import { theme } from "@/theme";

export function Screen({
  title,
  subtitle,
  children,
}: PropsWithChildren<{ title: string; subtitle: string }>) {
  const { ready, storageError } = useFridge();
  return (
    <SafeAreaView edges={["top", "left", "right"]} style={styles.safe}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.screen}
      >
        <View style={styles.screenHeader}>
          <View style={styles.brandRow}>
            <View style={styles.brandMark}><Text style={styles.brandMarkText}>Q</Text></View>
            <Text style={styles.eyebrow}>QUICK MEAL</Text>
            <View style={styles.brandDivider} />
            <Text style={styles.eyebrowMuted}>MENOS DESPERDÍCIO</Text>
          </View>
          <Text accessibilityRole="header" style={styles.title}>
            {title}
          </Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
        {storageError && (
          <Text accessibilityRole="alert" style={styles.notice}>
            {storageError}
          </Text>
        )}
        {ready ? (
          children
        ) : (
          <ActivityIndicator
            accessibilityLabel="Carregando geladeira"
            color={theme.colors.primary}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

export function Button({
  label,
  onPress,
  secondary = false,
  disabled = false,
}: {
  label: string;
  onPress: () => void;
  secondary?: boolean;
  disabled?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        secondary && styles.secondaryButton,
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}
    >
      <Text
        style={[styles.buttonText, secondary && styles.secondaryButtonText]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export function Card({ children }: PropsWithChildren) {
  return <View style={styles.card}>{children}</View>;
}
export function Heading({ children }: PropsWithChildren) {
  return (
    <Text accessibilityRole="header" style={styles.heading}>
      {children}
    </Text>
  );
}
export function Body({ children }: PropsWithChildren) {
  return <Text style={styles.body}>{children}</Text>;
}
export function Field({ label, ...props }: TextInputProps & { label: string }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        placeholderTextColor={theme.colors.textSecondary}
        selectionColor={theme.colors.primary}
        {...props}
        style={[styles.input, props.style]}
      />
    </View>
  );
}

export const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.background },
  screen: {
    width: "100%",
    maxWidth: 760,
    alignSelf: "center",
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    paddingBottom: 56,
    gap: theme.spacing.md + 4,
  },
  screenHeader: { gap: theme.spacing.sm },
  brandRow: { minHeight: 32, flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 6 },
  brandMark: { width: 28, height: 28, borderRadius: 9, alignItems: "center", justifyContent: "center", backgroundColor: theme.colors.primary },
  brandMarkText: { color: theme.colors.onPrimary, fontSize: 16, fontWeight: "900" },
  eyebrow: {
    color: theme.colors.primary,
    fontSize: theme.fontSize.caption,
    fontWeight: "800",
    letterSpacing: 1.2,
  },
  eyebrowMuted: { color: theme.colors.textSecondary, fontSize: 10, fontWeight: "700", letterSpacing: 1 },
  brandDivider: { width: 1, height: 14, backgroundColor: theme.colors.border },
  title: {
    color: theme.colors.text,
    fontSize: 32,
    lineHeight: 39,
    fontWeight: "800",
    letterSpacing: -0.8,
  },
  subtitle: { color: theme.colors.textSecondary, fontSize: 15, lineHeight: 23 },
  heading: {
    color: theme.colors.text,
    fontSize: theme.fontSize.subtitle,
    lineHeight: 27,
    fontWeight: "700",
    letterSpacing: -0.3,
  },
  body: {
    color: theme.colors.textSecondary,
    fontSize: 15,
    lineHeight: 23,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 14,
    elevation: 3,
  },
  button: {
    minHeight: 54,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
    borderWidth: 1,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: 15,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.16,
    shadowRadius: 10,
    elevation: 3,
  },
  buttonText: {
    color: theme.colors.onPrimary,
    fontSize: 15,
    fontWeight: "700",
    textAlign: "center",
  },
  secondaryButton: { backgroundColor: theme.colors.surface, borderColor: theme.colors.softRedBorder, shadowOpacity: 0.035, elevation: 1 },
  secondaryButtonText: { color: theme.colors.primary },
  pressed: { opacity: 0.84, transform: [{ scale: 0.985 }] },
  disabled: { opacity: 0.5 },
  field: { gap: theme.spacing.sm + 2 },
  label: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: "600",
  },
  input: {
    minHeight: 54,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing.md + 2,
    paddingVertical: theme.spacing.md,
    color: theme.colors.text,
    backgroundColor: theme.colors.background,
    fontSize: 15,
  },
  notice: {
    color: theme.colors.primary,
    backgroundColor: theme.colors.softRed,
    borderColor: theme.colors.softRedBorder,
    borderWidth: 1,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    fontSize: 14,
    lineHeight: 22,
    fontWeight: "600",
  },
  metricGrid: { flexDirection: "row", flexWrap: "wrap", gap: theme.spacing.sm + 4 },
  metricTile: { flexGrow: 1, flexBasis: "30%", minWidth: 135, minHeight: 112, justifyContent: "space-between", backgroundColor: theme.colors.background, borderColor: theme.colors.border, borderWidth: 1, borderRadius: theme.radius.md, padding: theme.spacing.md, gap: theme.spacing.sm },
  metricLabel: { color: theme.colors.textSecondary, fontSize: 12, lineHeight: 17, fontWeight: "600" },
  metricValueRow: { flexDirection: "row", alignItems: "baseline", gap: 6 },
  metricValue: { color: theme.colors.text, fontSize: 32, lineHeight: 38, fontWeight: "800", letterSpacing: -1 },
  metricUnit: { color: theme.colors.textSecondary, fontSize: 12, lineHeight: 17, fontWeight: "600" },
  metricUrgent: { backgroundColor: theme.colors.softRed, borderColor: theme.colors.softRedBorder },
  metricUrgentText: { color: theme.colors.primary },
  metricUrgentValue: { color: theme.colors.primary },
  sectionEyebrow: { color: theme.colors.primary, fontSize: 11, fontWeight: "800", letterSpacing: 1.1 },
});
