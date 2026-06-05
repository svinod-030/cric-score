import { useColorScheme } from 'nativewind';
import { useSettingsStore } from '../store/useSettingsStore';

/**
 * Returns the resolved dark/light state based on the user's theme preference.
 * - 'dark'   → always dark
 * - 'light'  → always light
 * - 'system' → follows the device color scheme
 */
export function useAppTheme() {
    const { theme } = useSettingsStore();
    const { colorScheme } = useColorScheme();

    const isDark =
        theme === 'dark' ||
        (theme === 'system' && colorScheme === 'dark');

    return { isDark, theme, colorScheme };
}
