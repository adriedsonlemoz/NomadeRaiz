import React, { createContext, useContext, useMemo } from "react";
import { useStore } from "./StoreContext";
import { T, darkT, FONT_SCALES } from "../styles/theme";
import type { FontScale } from "../styles/theme";

export interface ThemeCtx {
  theme:     typeof T;
  isDark:    boolean;
  F:         (typeof FONT_SCALES)[FontScale];
  fontScale: FontScale;
}

export const ThemeContext = createContext<ThemeCtx>({
  theme: T, isDark: false, F: FONT_SCALES.md, fontScale: "md",
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { state } = useStore();
  const isDark    = state.settings.themeMode === "dark";
  const fontScale = state.settings.fontScale ?? "md";

  const value = useMemo<ThemeCtx>(() => ({
    theme:     isDark ? darkT : T,
    isDark,
    F:         FONT_SCALES[fontScale],
    fontScale,
  }), [isDark, fontScale]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

// Reexportado por hooks/useTheme.ts (mantido aqui também por conveniência).
export const useTheme = () => useContext(ThemeContext);
