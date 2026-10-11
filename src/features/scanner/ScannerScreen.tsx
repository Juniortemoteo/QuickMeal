import { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, AppState, Linking, Platform, StyleSheet, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions, type BarcodeScanningResult } from "expo-camera";
import { router, useFocusEffect, useIsFocused } from "expo-router";
import { Body, Button, Card, Heading, Screen, styles } from "@/components/ui";
import { FoodForm } from "@/features/fridge/FoodForm";
import { theme } from "@/theme";

export function ScannerScreen() {
  const [permission, requestPermission, getPermission] = useCameraPermissions();
  const [enabled, setEnabled] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [barcode, setBarcode] = useState<string>();
  const [error, setError] = useState<string | null>(null);
  const scanLock = useRef(false);
  const requestLock = useRef(false);
  const screenActive = useRef(false);
  const focused = useIsFocused();
  const cameraVisible = focused && enabled && permission?.granted;
  const permissionBlocked = permission && !permission.granted && !permission.canAskAgain;

  useFocusEffect(useCallback(() => {
    screenActive.current = true;
    return () => {
      screenActive.current = false;
      scanLock.current = true;
      setEnabled(false);
    };
  }, []));

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "background") {
        scanLock.current = true;
        setEnabled(false);
      }
    });
    return () => subscription.remove();
  }, []);

  async function start() {
    if (requestLock.current) return;
    requestLock.current = true;
    setRequesting(true);
    setError(null);
    try {
      const currentPermission = await getPermission();
      const result = currentPermission.granted ? currentPermission : await requestPermission();
      if (!screenActive.current || AppState.currentState === "background") return;
      if (result.granted) {
        scanLock.current = false;
        setBarcode(undefined);
        setCameraReady(false);
        setEnabled(true);
      } else {
        setError(Platform.OS === "web"
          ? "Permita a câmera nas configurações deste site no navegador ou use o cadastro manual."
          : "Câmera não autorizada. Você ainda pode cadastrar o alimento manualmente.");
      }
    } catch {
      if (screenActive.current) setError("Não foi possível acessar a câmera. Use o cadastro manual.");
    } finally {
      requestLock.current = false;
      setRequesting(false);
    }
  }

  function stop() {
    scanLock.current = true;
    setEnabled(false);
    setCameraReady(false);
  }

  function onScan(result: BarcodeScanningResult) {
    if (scanLock.current || !screenActive.current || !result.data) return;
    scanLock.current = true;
    setBarcode(result.data);
    setEnabled(false);
    setCameraReady(false);
  }

  return (
    <Screen title="Escaneie. Confira. Aproveite." subtitle="Leia um código de barras e confirme os dados do alimento.">
      <Card>
        <View style={cameraStyles.header}>
          <MaterialCommunityIcons name="barcode-scan" size={24} color={theme.colors.primary} accessible={false} />
          <View style={cameraStyles.headerCopy}><Heading>Câmera / Scanner</Heading></View>
        </View>
        <View style={cameraStyles.viewport}>
          {cameraVisible ? (
            <>
              <CameraView
                style={StyleSheet.absoluteFill}
                facing="back"
                onBarcodeScanned={onScan}
                barcodeScannerSettings={{ barcodeTypes: ["ean13", "ean8", "upc_a", "upc_e", "code128"] }}
                onCameraReady={() => setCameraReady(true)}
                onMountError={() => {
                  stop();
                  setError("Câmera indisponível. Tente novamente ou use o cadastro manual.");
                }}
              />
              {/* Overlay separado: CameraView não recebe componentes filhos. */}
              <View pointerEvents="none" style={cameraStyles.overlay} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
                <View style={cameraStyles.scanFrame}>
                  <View style={[cameraStyles.corner, cameraStyles.topLeft]} />
                  <View style={[cameraStyles.corner, cameraStyles.topRight]} />
                  <View style={[cameraStyles.corner, cameraStyles.bottomLeft]} />
                  <View style={[cameraStyles.corner, cameraStyles.bottomRight]} />
                  <View style={cameraStyles.scanLine} />
                </View>
                {!cameraReady && <ActivityIndicator color={theme.colors.onPrimary} style={cameraStyles.loading} />}
              </View>
            </>
          ) : (
            <View style={cameraStyles.placeholder}>
              <View style={cameraStyles.cameraBadge}>
                <MaterialCommunityIcons name={barcode ? "check-circle-outline" : "camera-outline"} size={40} color={theme.colors.primary} accessible={false} />
              </View>
              <Text style={cameraStyles.placeholderTitle}>{barcode ? "Código capturado" : "Sua câmera, pronta para ajudar"}</Text>
              <Text style={cameraStyles.placeholderText}>{barcode ? "Confira os dados do alimento no formulário abaixo." : "Toque em Ativar câmera e permita o acesso para começar."}</Text>
              {requesting && <ActivityIndicator color={theme.colors.primary} accessibilityLabel="Solicitando acesso à câmera" />}
            </View>
          )}
        </View>
        <Body>{cameraVisible ? "Centralize o código de barras na moldura vermelha." : "Use a câmera para ler a embalagem ou preencha os dados abaixo."}</Body>
        {enabled ? (
          <Button label="Parar câmera" secondary onPress={stop} />
        ) : (
          <Button label={requesting ? "Aguardando permissão…" : barcode ? "Ler outro código" : "Ativar câmera"} disabled={requesting} onPress={() => { void start(); }} />
        )}
        {permissionBlocked && Platform.OS !== "web" && (
          <Button label="Abrir configurações de permissão" secondary onPress={() => {
            void Linking.openSettings().catch(() => setError("Abra as configurações do aparelho para permitir a câmera."));
          }} />
        )}
        {error && <Text accessibilityRole="alert" style={styles.notice}>{error}</Text>}
        <Text style={cameraStyles.caption}>O código não informa a validade. Confira nome, quantidade e data na embalagem antes de salvar.</Text>
      </Card>
      <FoodForm barcode={barcode} onSaved={() => {
        setBarcode(undefined);
        stop();
        router.navigate("/fridge");
      }} />
    </Screen>
  );
}

const cameraStyles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", gap: 10 },
  headerCopy: { flex: 1, minWidth: 0 },
  viewport: { width: "100%", aspectRatio: 1.15, minHeight: 260, maxHeight: 380, borderRadius: 16, overflow: "hidden", backgroundColor: "#211B1D", borderWidth: 1, borderColor: theme.colors.border },
  overlay: { ...StyleSheet.absoluteFill, alignItems: "center", justifyContent: "center" },
  scanFrame: { width: "78%", maxWidth: 340, aspectRatio: 1.4, borderRadius: 14, borderWidth: 1, borderColor: "rgba(255,255,255,0.35)" },
  corner: { position: "absolute", width: 28, height: 28, borderColor: theme.colors.primary },
  topLeft: { top: -2, left: -2, borderTopWidth: 4, borderLeftWidth: 4, borderTopLeftRadius: 14 },
  topRight: { top: -2, right: -2, borderTopWidth: 4, borderRightWidth: 4, borderTopRightRadius: 14 },
  bottomLeft: { bottom: -2, left: -2, borderBottomWidth: 4, borderLeftWidth: 4, borderBottomLeftRadius: 14 },
  bottomRight: { bottom: -2, right: -2, borderBottomWidth: 4, borderRightWidth: 4, borderBottomRightRadius: 14 },
  scanLine: { position: "absolute", top: "50%", left: 12, right: 12, height: 2, backgroundColor: theme.colors.primary },
  loading: { position: "absolute" },
  placeholder: { flex: 1, alignItems: "center", justifyContent: "center", padding: 20, gap: 12, backgroundColor: theme.colors.background },
  cameraBadge: { width: 72, height: 72, borderRadius: 16, alignItems: "center", justifyContent: "center", backgroundColor: theme.colors.softRed },
  placeholderTitle: { color: theme.colors.text, fontSize: 17, lineHeight: 24, fontWeight: "700", textAlign: "center" },
  placeholderText: { color: theme.colors.textSecondary, fontSize: 14, lineHeight: 21, textAlign: "center", maxWidth: 300 },
  caption: { color: theme.colors.textSecondary, fontSize: 12, lineHeight: 18 },
});
