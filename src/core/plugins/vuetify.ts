import "vuetify/styles";
import "@mdi/font/css/materialdesignicons.css";
import { createVuetify } from "vuetify";
import { aliases, mdi } from "vuetify/iconsets/mdi";
import { ar } from "vuetify/locale"; // 👈 استيراد اللغة العربية

// Brand palette (from Frontend Specification doc)
const BRAND = {
  primary: "#0D1B2A", // Navy Dark
  secondary: "#1B263B", // Dark Blue
  accent: "#D4AF37", // Gold
  gray: "#6C757D",
  bgLight: "#F5F7FA",
};

const lightTheme = {
  dark: false,
  colors: {
    primary: BRAND.primary,
    secondary: BRAND.secondary,
    accent: BRAND.accent,
    background: BRAND.bgLight,
    surface: "#FFFFFF",
    "on-primary": "#FFFFFF",
    "on-secondary": "#FFFFFF",
    "on-accent": "#0D1B2A",
    "on-background": BRAND.primary,
    "on-surface": BRAND.primary,
    success: "#2E7D32",
    warning: "#ED6C02",
    error: "#D32F2F",
    info: "#0288D1",
    gray: BRAND.gray,
  },
};

const darkTheme = {
  dark: true,
  colors: {
    primary: BRAND.accent, // Gold pops as primary action color in dark mode
    secondary: BRAND.secondary,
    accent: BRAND.accent,
    background: BRAND.primary,
    surface: BRAND.secondary,
    "on-primary": "#0D1B2A",
    "on-secondary": "#FFFFFF",
    "on-accent": "#0D1B2A",
    "on-background": "#FFFFFF",
    "on-surface": "#FFFFFF",
    success: "#66BB6A",
    warning: "#FFA726",
    error: "#EF5350",
    info: "#29B6F6",
    gray: BRAND.gray,
  },
};

export default createVuetify({
  locale: {
    locale: "ar", // 👈 تعيين اللغة الافتراضية
    fallback: "ar", // 👈 اللغة الاحتياطية
    messages: { ar }, // 👈 تحميل ترجمات Vuetify العربية
    rtl: { ar: true }, // 👈 تفعيل الاتجاه من اليمين لليسار للغة العربية
  },
  icons: {
    defaultSet: "mdi",
    aliases,
    sets: { mdi },
  },
  theme: {
    defaultTheme: "lightTheme",
    themes: {
      lightTheme,
      darkTheme,
    },
  },
  defaults: {
    VCard: {
      rounded: "lg",
      elevation: 0,
      class: "app-card",
    },
    VBtn: {
      rounded: "lg",
      style: "text-transform: none; font-weight: 600;",
    },
    VTextField: {
      variant: "outlined",
      density: "comfortable",
      rounded: "lg",
    },
    VSelect: {
      variant: "outlined",
      density: "comfortable",
      rounded: "lg",
    },
    VTextarea: {
      variant: "outlined",
      density: "comfortable",
      rounded: "lg",
    },
  },
});
