import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Themes, ThemeId, AppTheme, ThemeColors } from './themes';
import { StorageService } from '../services/storage';
import { setAlternateAppIcon, getAppIconName, supportsAlternateIcons } from 'expo-alternate-app-icons';

export interface ThemeContextType {
  theme: AppTheme;
  themeId: ThemeId;
  colors: ThemeColors;
  setThemeId: (id: ThemeId) => Promise<void>;
  ringIcon: string;
  setRingIcon: (icon: string) => Promise<void>;
  appIcon: string;
  setAppIcon: (iconName: string | null) => Promise<boolean>;
  canChangeAppIcon: boolean;
}

const defaultThemeId: ThemeId = 'monochrome';

export const ThemeContext = createContext<ThemeContextType>({
  theme: Themes[defaultThemeId],
  themeId: defaultThemeId,
  colors: Themes[defaultThemeId].colors,
  setThemeId: async () => {},
  ringIcon: 'droplet',
  setRingIcon: async () => {},
  appIcon: 'Default',
  setAppIcon: async () => false,
  canChangeAppIcon: false,
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [themeId, setThemeIdState] = useState<ThemeId>('monochrome');
  const [ringIcon, setRingIconState] = useState<string>('droplet');
  const [appIcon, setAppIconState] = useState<string>('Default');
  const [canChangeAppIcon, setCanChangeAppIcon] = useState<boolean>(false);

  useEffect(() => {
    (async () => {
      try {
        const [storedTheme, storedRing, storedAppIcon] = await Promise.all([
          StorageService.getThemeId(),
          StorageService.getRingIcon(),
          StorageService.getAppIcon(),
        ]);
        setThemeIdState(storedTheme);
        setRingIconState(storedRing);
        setAppIconState(storedAppIcon);

        if (supportsAlternateIcons) {
          setCanChangeAppIcon(true);
          try {
            const current = getAppIconName();
            if (current) {
              setAppIconState(current);
            }
          } catch {}
        }
      } catch (e) {
        console.error('Error initializing theme:', e);
      }
    })();
  }, []);

  const setThemeId = async (id: ThemeId) => {
    setThemeIdState(id);
    await StorageService.saveThemeId(id);
  };

  const setRingIcon = async (icon: string) => {
    setRingIconState(icon);
    await StorageService.saveRingIcon(icon);
  };

  const setAppIcon = async (iconName: string | null): Promise<boolean> => {
    try {
      const target = iconName === 'Default' || !iconName ? null : iconName;
      if (supportsAlternateIcons) {
        await setAlternateAppIcon(target);
      }
      const savedName = iconName || 'Default';
      setAppIconState(savedName);
      await StorageService.saveAppIcon(savedName);
      return true;
    } catch (e) {
      console.error('Error setting alternate app icon:', e);
      // Still persist choice in user preferences even if on simulator or restricted device
      const savedName = iconName || 'Default';
      setAppIconState(savedName);
      await StorageService.saveAppIcon(savedName);
      return false;
    }
  };

  const theme = Themes[themeId] || Themes.monochrome;

  return (
    <ThemeContext.Provider
      value={{
        theme,
        themeId,
        colors: theme.colors,
        setThemeId,
        ringIcon,
        setRingIcon,
        appIcon,
        setAppIcon,
        canChangeAppIcon,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};
