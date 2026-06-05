import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type AppTheme = 'light' | 'dark' | 'system';

interface SettingsState {
    language: string | null;
    isLanguageSelected: boolean;
    showLanguageModal: boolean;
    theme: AppTheme;
    setLanguage: (lang: string) => void;
    setShowLanguageModal: (show: boolean) => void;
    setTheme: (theme: AppTheme) => void;
}

export const useSettingsStore = create<SettingsState>()(
    persist(
        (set) => ({
            language: null,
            isLanguageSelected: false,
            showLanguageModal: false,
            theme: 'system',
            setLanguage: (lang: string) => set({ language: lang, isLanguageSelected: true }),
            setShowLanguageModal: (show: boolean) => set({ showLanguageModal: show }),
            setTheme: (theme: AppTheme) => set({ theme }),
        }),
        {
            name: 'settings-storage',
            storage: createJSONStorage(() => AsyncStorage),
            partialize: (state) => ({
                language: state.language,
                isLanguageSelected: state.isLanguageSelected,
                theme: state.theme,
            }), // Don't persist showLanguageModal
        }
    )
);
