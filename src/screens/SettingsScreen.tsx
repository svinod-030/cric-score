import { View, Text, ScrollView, TouchableOpacity, Alert, Linking, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { APP_CONFIG } from '../utils/constants';
import { useTranslation } from 'react-i18next';

type SettingItemProps = {
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    subtitle?: string;
    onPress: () => void;
    color?: string;
};

const SettingItem = ({ icon, title, subtitle, onPress, color = '#3B82F6' }: SettingItemProps) => (
    <TouchableOpacity
        onPress={onPress}
        className="flex-row items-center bg-gray-800 p-4 rounded-xl mb-3 border border-gray-700 active:bg-gray-700"
    >
        <View className={`w-10 h-10 rounded-full items-center justify-center mr-4`} style={{ backgroundColor: `${color}20` }}>
            <Ionicons name={icon} size={20} color={color} />
        </View>
        <View className="flex-1">
            <Text className="text-white font-semibold text-lg">{title}</Text>
            {subtitle && <Text className="text-gray-400 text-xs">{subtitle}</Text>}
        </View>
        <Ionicons name="chevron-forward" size={20} color="#6B7280" />
    </TouchableOpacity>
);

import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../store/useAuthStore';
import { backupToDrive } from '../utils/backupService';
import React, { useState } from 'react';

export default function SettingsScreen() {
    const { t, i18n } = useTranslation();
    const navigation = useNavigation<any>();
    const { isAuthenticated } = useAuthStore();
    const [isBackingUp, setIsBackingUp] = useState(false);

    const handleBackup = async () => {
        if (!isAuthenticated) {
            Alert.alert(t('common.signInRequired'), t('common.pleaseSignInGoogle'));
            return;
        }

        setIsBackingUp(true);
        const success = await backupToDrive();
        setIsBackingUp(false);

        if (success) {
            Alert.alert(t('common.backupSuccess'), t('common.backupSuccessMsg'));
        } else {
            Alert.alert(t('common.backupFailed'), t('common.backupFailedMsg'));
        }
    };

    const toggleLanguage = (lang: string) => {
        i18n.changeLanguage(lang);
    };

    const handlePress = (action: string) => {
        if (action === "Rate App") {
            if (Platform.OS === 'android') {
                Linking.openURL(APP_CONFIG.STORE_URL_ANDROID);
            } else {
                Linking.openURL(APP_CONFIG.STORE_URL_IOS);
            }
            return;
        }
        if (action === "Licenses") {
            navigation.navigate('Licenses');
            return;
        }
        if (action === "Contact Us") {
            Linking.openURL(`mailto:${APP_CONFIG.SUPPORT_EMAIL}?subject=CricScore Support`);
            return;
        }
        if (action === "Backup") {
            handleBackup();
            return;
        }

        Alert.alert(t('common.comingSoon'), t('common.featureUnderDevelopment', { feature: action }));
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-900" edges={['left', 'right']}>
            <ScrollView className="p-4">
                <Text className="text-white text-3xl font-bold mb-6">{t('common.settings')}</Text>

                <View className="mb-6">
                    <Text className="text-gray-500 font-bold mb-3 uppercase text-xs tracking-wider">{t('common.general')}</Text>

                    <SettingItem
                        icon="star"
                        title={t('common.rateApp')}
                        subtitle={t('common.rateUsOnStore')}
                        onPress={() => handlePress("Rate App")}
                        color="#F59E0B"
                    />

                    <SettingItem
                        icon="cloud-upload"
                        title={t('common.backup')}
                        subtitle={isBackingUp ? "Backing up..." : t('common.saveDataSafely')}
                        onPress={() => handlePress("Backup")}
                        color="#10B981"
                    />
                </View>

                <View className="mb-6">
                    <Text className="text-gray-500 font-bold mb-3 uppercase text-xs tracking-wider">{t('common.about')}</Text>
                    <SettingItem
                        icon="document-text"
                        title={t('common.openSourceLicenses')}
                        onPress={() => handlePress("Licenses")}
                        color="#6366F1"
                    />
                    <SettingItem
                        icon="chatbubble-ellipses"
                        title={t('common.contactUs')}
                        subtitle={t('common.supportFeedback')}
                        onPress={() => handlePress("Contact Us")}
                        color="#3B82F6"
                    />
                </View>

                <View className="items-center mt-4 mb-10">
                    <Text className="text-gray-500 font-bold text-lg">Cric Score</Text>
                    <Text className="text-gray-600 text-sm">{t('common.version')} {APP_CONFIG.APP_VERSION}</Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
