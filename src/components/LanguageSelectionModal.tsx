import React, { useEffect, useState } from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSettingsStore } from '../store/useSettingsStore';
import { Ionicons } from '@expo/vector-icons';

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
                <View className="bg-gray-800 w-full max-w-sm rounded-3xl border border-gray-700 overflow-hidden">
                    <View className="bg-gray-700 p-6 flex-row justify-between items-center">
                        <View>
                            <Text className="text-white text-2xl font-bold">{t('common.selectLanguage')}</Text>
                        </View>
                        {isLanguageSelected && (
                            <TouchableOpacity onPress={() => setShowLanguageModal(false)}>
                                <Ionicons name="close" size={28} color="#9CA3AF" />
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
                                        : 'bg-gray-700 border-gray-600'
                                        }`}
                                >
                                    <Text className="text-white font-bold text-lg">{lang.label}</Text>
                                    <Text className="text-white/50 text-[10px] mt-1 uppercase">{lang.code}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </ScrollView>

                    <View className="p-4 bg-gray-900/50">
                        <Text className="text-gray-500 text-center text-xs">
                            {t('common.changeInSettings')}
                        </Text>
                    </View>
                </View>
            </View>
        </Modal>
    );
}
