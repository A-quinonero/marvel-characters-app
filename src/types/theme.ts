export interface AppTheme {
  colors: {
    primary: string;
    text: string;
    mutedText: string;
    background: string;
    surface: string;
    black: string;
    white: string;
    gray100: string;
    gray200: string;
    gray300: string;
  };
  radii: { sm: string; md: string; lg: string; xl: string; pill: string };
  spacing: (n: number) => string;
  shadows: { sm: string; md: string };
  z: { header: number; overlay: number };
  bp: { sm: string; md: string; lg: string; xl: string };
}
