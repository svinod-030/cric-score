import React from 'react';
import { View, Text, Modal, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSettingsStore, AppTheme } from '../store/useSettingsStore';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '../hooks/useAppTheme';

type ThemeOption = {
    value: AppTheme;
    labelKey: string;
    icon: keyof typeof Ionicons.glyphMap;
    color: string;
    description: string;
};

const THEME_OPTIONS: ThemeOption[] = [
    {
        value: 'light',
        labelKey: 'common.themeLight',
        icon: 'sunny',
        color: '#F59E0B',
        description: 'Always use light theme',
    },
    {
        value: 'dark',
        labelKey: 'common.themeDark',
        icon: 'moon',
        color: '#6366F1',
        description: 'Always use dark theme',
    },
    {
        value: 'system',
        labelKey: 'common.themeSystem',
        icon: 'phone-portrait-outline',
        color: '#10B981',
        description: 'Follow device settings',
    },
];

type Props = {
    visible: boolean;
    onClose: () => void;
};

export default function ThemeSelectionModal({ visible, onClose }: Props) {
    const { t } = useTranslation();
    const { isDark } = useAppTheme();
    const { theme, setTheme } = useSettingsStore();

    const handleSelect = (value: AppTheme) => {
        setTheme(value);
        onClose();
    };

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={onClose}
        >
            <View className="flex-1 bg-black/60 justify-center items-center p-6">
                <View className={`w-full max-w-sm rounded-3xl border overflow-hidden ${isDark ? 'bg-gray-805 border-gray-700' : 'bg-white border-gray-200'}`}>
                    {/* Header */}
                    <View className={`p-6 flex-row justify-between items-center ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                        <View>
                            <Text className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {t('common.selectTheme')}
                            </Text>
                            <Text className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                {t('common.chooseAppearance')}
                            </Text>
                        </View>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close" size={28} color={isDark ? '#9CA3AF' : '#4B5563'} />
                        </TouchableOpacity>
                    </View>

                    {/* Options */}
                    <View className="p-4 gap-3">
                        {THEME_OPTIONS.map((option) => {
                            const isSelected = theme === option.value;
                            return (
                                <TouchableOpacity
                                    key={option.value}
                                    onPress={() => handleSelect(option.value)}
                                    className={`flex-row items-center p-4 rounded-2xl border ${
                                        isSelected
                                            ? 'border-blue-500 bg-blue-600/10'
                                            : isDark 
                                                ? 'border-gray-600 bg-gray-700/50' 
                                                : 'border-gray-200 bg-gray-50'
                                    }`}
                                >
                                    <View
                                        className="w-11 h-11 rounded-full items-center justify-center mr-4"
                                        style={{ backgroundColor: `${option.color}20` }}
                                    >
                                        <Ionicons
                                            name={option.icon}
                                            size={22}
                                            color={isSelected ? '#3B82F6' : option.color}
                                        />
                                    </View>
                                    <View className="flex-1">
                                        <Text className={`font-semibold text-base ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                            {t(option.labelKey)}
                                        </Text>
                                        <Text className={`text-xs mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                            {option.description}
                                        </Text>
                                    </View>
                                    {isSelected && (
                                        <Ionicons name="checkmark-circle" size={22} color="#3B82F6" />
                                    )}
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>
            </View>
        </Modal>
    );
}
