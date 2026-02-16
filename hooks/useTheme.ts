import { Colors } from '../constants/Colors';
import { ThemeContext } from '../providers/ThemeProvider';
import { useContext } from 'react';
export function useTheme() {
  const { theme, toggleTheme } = useContext(ThemeContext)
  const colors = Colors[theme];
  
  return {
    theme,
    toggleTheme,
    colors,

  };
}