import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SettingsState {
    language: string | null;
    isLanguageSelected: boolean;
    showLanguageModal: boolean;
    setLanguage: (lang: string) => void;
    setShowLanguageModal: (show: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
    persist(
        (set) => ({
            language: null,
            isLanguageSelected: false,
            showLanguageModal: false,
            setLanguage: (lang: string) => set({ language: lang, isLanguageSelected: true }),
            setShowLanguageModal: (show: boolean) => set({ showLanguageModal: show }),
        }),
        {
            name: 'settings-storage',
            storage: createJSONStorage(() => AsyncStorage),
            partialize: (state) => ({
                language: state.language,
                isLanguageSelected: state.isLanguageSelected,
            }), // Don't persist showLanguageModal
        }
    )
);
