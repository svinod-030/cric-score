import React, { useEffect, useState } from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSettingsStore } from '../store/useSettingsStore';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../hooks/useAppTheme';

export const SUPPORTED_LANGUAGES = [
    { code: 'en', label: 'English' },
    { code: 'te', label: 'తెలుగు' },
    { code: 'hi', label: 'हिन्दी' },
    { code: 'ta', label: 'தமிழ்' },
    { code: 'kn', label: 'ಕನ್ನಡ' },
    { code: 'ml', label: 'മലയാളம்' }
];

export default function LanguageSelectionModal() {
    const { t, i18n } = useTranslation();
    const { isDark } = useAppTheme();
    const { isLanguageSelected, setLanguage, showLanguageModal, setShowLanguageModal } = useSettingsStore();

    const handleSelect = (langCode: string) => {
        setLanguage(langCode);
        i18n.changeLanguage(langCode);
        setShowLanguageModal(false);
    };

    const isVisible = !isLanguageSelected || showLanguageModal;

    return (
        <Modal
            visible={isVisible}
            transparent={true}
            animationType="fade"
            onRequestClose={() => {
                if (isLanguageSelected) {
                    setShowLanguageModal(false);
                }
            }}
        >
            <View className="flex-1 bg-black/60 justify-center items-center p-6">
                <View className={`w-full max-w-sm rounded-3xl border overflow-hidden ${isDark ? 'bg-gray-805 border-gray-700' : 'bg-white border-gray-200'}`}>
                    <View className={`p-6 flex-row justify-between items-center ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                        <View>
                            <Text className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('common.selectLanguage')}</Text>
                        </View>
                        {isLanguageSelected && (
                            <TouchableOpacity onPress={() => setShowLanguageModal(false)}>
                                <Ionicons name="close" size={28} color={isDark ? '#9CA3AF' : '#4b5563'} />
                            </TouchableOpacity>
                        )}
                    </View>

                    <ScrollView className="max-h-[400px] p-4">
                        <View className="flex-row flex-wrap justify-between">
                            {SUPPORTED_LANGUAGES.map((lang) => (
                                <TouchableOpacity
                                    key={lang.code}
                                    onPress={() => handleSelect(lang.code)}
                                    className={`w-[48%] py-4 rounded-2xl items-center border mb-3 ${i18n.language === lang.code
                                        ? 'bg-purple-600 border-purple-500 shadow-lg'
                                        : isDark 
                                            ? 'bg-gray-700 border-gray-600' 
                                            : 'bg-gray-50 border-gray-200'
                                        }`}
                                >
                                    <Text className={`font-bold text-lg ${i18n.language === lang.code ? 'text-white' : isDark ? 'text-white' : 'text-gray-900'}`}>{lang.label}</Text>
                                    <Text className={`text-[10px] mt-1 uppercase ${i18n.language === lang.code ? 'text-white/50' : isDark ? 'text-white/40' : 'text-gray-400'}`}>{lang.code}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </ScrollView>

                    <View className={`p-4 ${isDark ? 'bg-gray-900/50' : 'bg-gray-50'}`}>
                        <Text className={`text-center text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                            {t('common.changeInSettings')}
                        </Text>
                    </View>
                </View>
            </View>
        </Modal>
    );
}
