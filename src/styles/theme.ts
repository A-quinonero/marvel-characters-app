// src/styles/theme.ts

import { AppTheme } from "@/types/theme";

const theme: AppTheme = {
  colors: {
    primary: "#EC1D24",
    text: "#111111",
    mutedText: "#666666",
    background: "#FFFFFF",
    surface: "#FFFFFF",
    black: "#000000",
    white: "#FFFFFF",
    gray100: "#F5F5F5",
    gray200: "#EEEEEE",
    gray300: "#E6E6E6",
  },
  radii: { sm: "6px", md: "10px", lg: "12px", xl: "16px", pill: "9999px" },
  spacing: (n: number) => `${n * 4}px`,
  shadows: { sm: "0 2px 8px rgba(0,0,0,0.06)", md: "0 6px 18px rgba(0,0,0,0.08)" },
  z: { header: 100, overlay: 1000 },
  bp: { sm: "480px", md: "768px", lg: "1024px", xl: "1280px" },
};

export type { AppTheme };
export default theme;
