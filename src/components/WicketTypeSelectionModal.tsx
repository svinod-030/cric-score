import React from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { WicketType } from '../types/match';
import { useTranslation } from 'react-i18next';

interface WicketTypeSelectionModalProps {
    visible: boolean;
    onSelect: (type: WicketType) => void;
    onClose: () => void;
}

export const WicketTypeSelectionModal = ({ visible, onSelect, onClose }: WicketTypeSelectionModalProps) => {
    const { t } = useTranslation();
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
                <View className="bg-gray-800 rounded-t-3xl p-6 border-t border-gray-700">
                    <Text className="text-white text-xl font-bold mb-6 text-center">{t('common.selectModeOfOut')}</Text>

                    <View className="flex-row flex-wrap gap-3 justify-center mb-6">
                        {wicketTypes.map((type) => (
                            <TouchableOpacity
                                key={type.value}
                                onPress={() => onSelect(type.value)}
                                className="w-[45%] bg-gray-700 p-4 rounded-xl items-center border border-gray-600 active:bg-red-600"
                            >
                                <Text className="text-white font-bold">{type.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <TouchableOpacity
                        onPress={onClose}
                        className="p-4 bg-gray-900 rounded-xl items-center"
                    >
                        <Text className="text-gray-400 font-bold">{t('common.cancel')}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};
