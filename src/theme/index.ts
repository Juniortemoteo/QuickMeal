/** Red and white brand palette, with muted semantic colors for expiry status. */
export const theme = {
  colors: {
    primary: "#D12F3D",
    primaryPressed: "#AF1D2B",
    background: "#FAF7F6",
    surface: "#FFFFFF",
    text: "#3F2226",
    textSecondary: "#79676A",
    border: "#EEE5E4",
    onPrimary: "#FFFFFF",
    softRed: "#FFF1F2",
    softRedBorder: "#F5D7DA",
    shadow: "#4C2025",
    expiry: { fresh: "#486B59", warning: "#886518" },
  },
  spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 },
  radius: { sm: 12, md: 16, lg: 24, pill: 999 },
  fontSize: { caption: 12, body: 16, subtitle: 20, title: 30, display: 44 },
} as const;
