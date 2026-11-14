import { create } from 'zustand';

interface ThemeState {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

// Helper to get initial theme (checks localStorage, falls back to system preference)
const getInitialTheme = (): boolean => {
  if (typeof window === "undefined") return true;
  const stored = localStorage.getItem("theme");
  const isDark = stored ? stored === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
  if (typeof document !== "undefined") {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }
  return isDark;
};

const initialTheme = getInitialTheme();

export const useThemeStore = create<ThemeState>((set) => ({
  isDarkMode: initialTheme,
  
  toggleTheme: () => set((state) => {
    const newIsDark = !state.isDarkMode;
    
    // Update the DOM and LocalStorage immediately
    const root = window.document.documentElement;
    if (newIsDark) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
    
    // Return the new state to Zustand
    return { isDarkMode: newIsDark };
  }),
}));