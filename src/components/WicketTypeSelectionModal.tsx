import React from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { WicketType } from '../types/match';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '../hooks/useAppTheme';

interface WicketTypeSelectionModalProps {
    visible: boolean;
    onSelect: (type: WicketType) => void;
    onClose: () => void;
}

export const WicketTypeSelectionModal = ({ visible, onSelect, onClose }: WicketTypeSelectionModalProps) => {
    const { t } = useTranslation();
    const { isDark } = useAppTheme();
    const wicketTypes: { label: string; value: WicketType }[] = [
        { label: t('common.bowled'), value: 'bowled' },
        { label: t('common.caught'), value: 'caught' },
        { label: t('common.lbw'), value: 'lbw' },
        { label: t('common.runOut'), value: 'run-out' },
        { label: t('common.stumped'), value: 'stumped' },
        { label: t('common.other'), value: 'other' },
    ];

    return (
        <Modal visible={visible} transparent animationType="slide">
            <View className="flex-1 justify-end bg-black/60">
                <View className={`rounded-t-3xl p-6 border-t ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                    <Text className={`text-xl font-bold mb-6 text-center ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('common.selectModeOfOut')}</Text>

                    <View className="flex-row flex-wrap gap-3 justify-center mb-6">
                        {wicketTypes.map((type) => (
                            <TouchableOpacity
                                key={type.value}
                                onPress={() => onSelect(type.value)}
                                className={`w-[45%] p-4 rounded-xl items-center border active:bg-red-600 ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-100 border-gray-300'}`}
                            >
                                <Text className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{type.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <TouchableOpacity
                        onPress={onClose}
                        className={`p-4 rounded-xl items-center ${isDark ? 'bg-gray-900' : 'bg-gray-200'}`}
                    >
                        <Text className={`font-bold ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('common.cancel')}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};
