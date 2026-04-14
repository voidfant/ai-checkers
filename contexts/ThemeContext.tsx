
import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

// This function is called once by useState for initial state.
// It should be pure and not have side effects like directly manipulating DOM.
const calculateInitialTheme = (): Theme => {
  let initialUserSetting: Theme = 'light'; // Default
  try {
    // Ensure localStorage is accessed only in a browser environment
    if (typeof window !== 'undefined') {
      const storedThemeValue = localStorage.getItem('checkersTheme');
      if (storedThemeValue === 'light' || storedThemeValue === 'dark') {
        initialUserSetting = storedThemeValue;
        console.log('[ThemeContext] Initial theme determined from localStorage:', initialUserSetting);
      } else {
        // No valid stored theme, check system preference.
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
          initialUserSetting = 'dark';
          console.log('[ThemeContext] Initial theme determined from system preference: dark');
        } else {
          initialUserSetting = 'light'; // Fallback default
          console.log('[ThemeContext] Initial theme defaulting to light (no valid storage, system not dark or uncheckable)');
        }
      }
    }
  } catch (error) {
    console.error("[ThemeContext] Error reading initial theme from localStorage/matchMedia:", error);
    // initialUserSetting remains 'light' if any error occurs
    initialUserSetting = 'light';
  }
  return initialUserSetting;
};

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(calculateInitialTheme);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      console.log("[ThemeContext] Applied 'dark' class to HTML element for theme:", theme);
    } else {
      root.classList.remove('dark');
      console.log("[ThemeContext] Ensured 'dark' class is removed from HTML element for theme:", theme);
    }

    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('checkersTheme', theme);
        console.log('[ThemeContext] Theme saved to localStorage:', theme);
      }
    } catch (error) {
      console.error("[ThemeContext] Could not save theme to localStorage:", error);
    }
  }, [theme]); 

  const toggleTheme = () => {
    setTheme((prevTheme) => {
      const newTheme = prevTheme === 'light' ? 'dark' : 'light';
      console.log('[ThemeContext] Toggling theme from', prevTheme, 'to', newTheme);
      return newTheme;
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
