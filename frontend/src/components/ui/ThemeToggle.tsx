import { useThemeStore } from "../../store/ThemeStore";

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export default function ThemeToggle({ className = "", showLabel = false }: ThemeToggleProps) {
  const isDarkMode = useThemeStore((state) => state.isDarkMode);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);

  return (
    <button
      onClick={toggleTheme}
      type="button"
      className={`p-2.5 rounded-xl transition-all duration-200 flex items-center gap-2 border cursor-pointer select-none ${
        isDarkMode
          ? "bg-slate-800/90 hover:bg-slate-700 border-white/10 text-amber-300 shadow-lg shadow-black/20"
          : "bg-white hover:bg-slate-100 border-slate-300 text-amber-500 shadow-sm"
      } ${className}`}
      aria-label="Toggle theme"
      title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
    >
      {isDarkMode ? (
        // Sun Icon (Shows in dark mode -> click to turn into light mode)
        <svg className="w-5 h-5 shrink-0 text-amber-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      ) : (
        // Moon Icon (Shows in light mode -> click to turn into dark mode)
        <svg className="w-5 h-5 shrink-0 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
          />
        </svg>
      )}
      {showLabel && (
        <span className="text-sm font-medium text-text-primary">
          {isDarkMode ? "Light" : "Dark"}
        </span>
      )}
    </button>
  );
}
