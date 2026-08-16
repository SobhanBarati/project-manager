import { useTheme as useThemeContext } from "@/provider/theme-provider";

export const useTheme = () => {
  const { theme, setTheme, resolvedTheme } = useThemeContext();
  
  return {
    theme,
    setTheme,
    resolvedTheme,
    isDark: resolvedTheme === 'dark',
    isLight: resolvedTheme === 'light',
  };
};