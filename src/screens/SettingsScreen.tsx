import { View, Text, ScrollView, TouchableOpacity, Alert, Linking, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { APP_CONFIG } from '../utils/constants';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../store/useAuthStore';
import { backupToDrive } from '../utils/backupService';
import React, { useState } from 'react';
import { useSettingsStore } from '../store/useSettingsStore';
import { useAppTheme } from '../hooks/useAppTheme';
import ThemeSelectionModal from '../components/ThemeSelectionModal';

type SettingItemProps = {
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    subtitle?: string;
    onPress: () => void;
    color?: string;
    isDark?: boolean;
    rightElement?: React.ReactNode;
};

const SettingItem = ({ icon, title, subtitle, onPress, color = '#3B82F6', isDark = true, rightElement }: SettingItemProps) => (
    <TouchableOpacity
        onPress={onPress}
        className={`flex-row items-center p-4 rounded-xl mb-3 border ${isDark
            ? 'bg-gray-800 border-gray-700 active:bg-gray-700'
            : 'bg-white border-gray-200 active:bg-gray-50'
            }`}
    >
        <View className={`w-10 h-10 rounded-full items-center justify-center mr-4`} style={{ backgroundColor: `${color}20` }}>
            <Ionicons name={icon} size={20} color={color} />
        </View>
        <View className="flex-1">
            <Text className={`font-semibold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>{title}</Text>
            {subtitle && <Text className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{subtitle}</Text>}
        </View>
        {rightElement ?? <Ionicons name="chevron-forward" size={20} color={isDark ? '#6B7280' : '#9CA3AF'} />}
    </TouchableOpacity>
);

const THEME_LABELS: Record<string, string> = {
    light: 'common.themeLight',
    dark: 'common.themeDark',
    system: 'common.themeSystem',
};

const THEME_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
    light: 'sunny',
    dark: 'moon',
    system: 'phone-portrait-outline',
};

export default function SettingsScreen() {
    const { t, i18n } = useTranslation();
    const navigation = useNavigation<any>();
    const { isAuthenticated } = useAuthStore();
    const { theme } = useSettingsStore();
    const { isDark } = useAppTheme();
    const [isBackingUp, setIsBackingUp] = useState(false);
    const [showThemeModal, setShowThemeModal] = useState(false);

    const bg = isDark ? 'bg-gray-900' : 'bg-gray-100';
    const sectionLabelColor = isDark ? 'text-gray-500' : 'text-gray-400';
    const titleColor = isDark ? 'text-white' : 'text-gray-900';
    const versionColor = isDark ? 'text-gray-600' : 'text-gray-400';
    const appNameColor = isDark ? 'text-gray-500' : 'text-gray-500';

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
            Linking.openURL(`mailto:${APP_CONFIG.SUPPORT_EMAIL}?subject=CricScore Support ${APP_CONFIG.APP_VERSION}`);
            return;
        }
        if (action === "Backup") {
            handleBackup();
            return;
        }

        Alert.alert(t('common.comingSoon'), t('common.featureUnderDevelopment', { feature: action }));
    };

    const ThemeBadge = () => (
        <View className={`flex-row items-center gap-2 px-3 py-1.5 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-100 border-gray-200'}`}>
            <Ionicons
                name={THEME_ICONS[theme]}
                size={14}
                color={isDark ? '#9CA3AF' : '#6B7280'}
            />
            <Text className={`text-xs font-semibold ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                {t(THEME_LABELS[theme])}
            </Text>
        </View>
    );

    return (
        <SafeAreaView className={`flex-1 ${bg}`} edges={['left', 'right']}>
            <ScrollView className="p-4">
                <Text className={`text-3xl font-bold mb-6 ${titleColor}`}>{t('common.settings')}</Text>

                {/* Appearance Section */}
                <View className="mb-6">
                    <Text className={`font-bold mb-3 uppercase text-xs tracking-wider ${sectionLabelColor}`}>
                        {t('common.appearance')}
                    </Text>

                    <SettingItem
                        icon={THEME_ICONS[theme]}
                        title={t('common.theme')}
                        subtitle={t(THEME_LABELS[theme])}
                        onPress={() => setShowThemeModal(true)}
                        color="#6366F1"
                        isDark={isDark}
                        rightElement={<ThemeBadge />}
                    />
                </View>

                {/* General Section */}
                <View className="mb-6">
                    <Text className={`font-bold mb-3 uppercase text-xs tracking-wider ${sectionLabelColor}`}>
                        {t('common.general')}
                    </Text>

                    <SettingItem
                        icon="star"
                        title={t('common.rateApp')}
                        subtitle={t('common.rateUsOnStore')}
                        onPress={() => handlePress("Rate App")}
                        color="#F59E0B"
                        isDark={isDark}
                    />

                    <SettingItem
                        icon="cloud-upload"
                        title={t('common.backup')}
                        subtitle={isBackingUp ? "Backing up..." : t('common.saveDataSafely')}
                        onPress={() => handlePress("Backup")}
                        color="#10B981"
                        isDark={isDark}
                    />
                </View>

                {/* About Section */}
                <View className="mb-6">
                    <Text className={`font-bold mb-3 uppercase text-xs tracking-wider ${sectionLabelColor}`}>
                        {t('common.about')}
                    </Text>
                    <SettingItem
                        icon="document-text"
                        title={t('common.openSourceLicenses')}
                        onPress={() => handlePress("Licenses")}
                        color="#6366F1"
                        isDark={isDark}
                    />
                    <SettingItem
                        icon="chatbubble-ellipses"
                        title={t('common.contactUs')}
                        subtitle={t('common.supportFeedback')}
                        onPress={() => handlePress("Contact Us")}
                        color="#3B82F6"
                        isDark={isDark}
                    />
                </View>

                <View className="items-center mt-4 mb-10">
                    <Text className={`font-bold text-lg ${appNameColor}`}>Cric Score</Text>
                    <Text className={`text-sm ${versionColor}`}>{t('common.version')} {APP_CONFIG.APP_VERSION}</Text>
                </View>
            </ScrollView>

            <ThemeSelectionModal
                visible={showThemeModal}
                onClose={() => setShowThemeModal(false)}
            />
        </SafeAreaView>
    );
}
