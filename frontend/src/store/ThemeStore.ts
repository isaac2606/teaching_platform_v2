import { create } from 'zustand';

interface ThemeState {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

// Helper to get initial theme (just like your old Context)
const getInitialTheme = () => {
  const stored = localStorage.getItem("theme");
  if (stored) return stored === "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
};

export const useThemeStore = create<ThemeState>((set) => ({
  isDarkMode: getInitialTheme(),
  
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