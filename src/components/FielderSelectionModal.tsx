import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { Player } from '../types/match';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '../hooks/useAppTheme';

interface FielderSelectionModalProps {
    visible: boolean;
    players: Player[];
    onSelect: (playerId: string) => void;
    title?: string;
    onCancel?: () => void;
}

export const FielderSelectionModal = ({ visible, players, onSelect, title, onCancel }: FielderSelectionModalProps) => {
    const { t } = useTranslation();
    const { isDark } = useAppTheme();
    const modalTitle = title || t('common.selectFielder');

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
        >
            <View className="flex-1 bg-black/80 justify-end">
                <View className={`rounded-t-3xl p-6 h-2/3 ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
                    <Text className={`text-xl font-bold mb-4 text-center ${isDark ? 'text-white' : 'text-gray-900'}`}>{modalTitle}</Text>
                    <ScrollView>
                        {players.map(player => (
                            <TouchableOpacity
                                key={player.id}
                                className={`p-4 border-b ${isDark ? 'border-gray-800 active:bg-gray-800' : 'border-gray-200 active:bg-gray-100'}`}
                                onPress={() => onSelect(player.id)}
                            >
                                <Text className={`text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>{player.name}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                    {onCancel && (
                        <TouchableOpacity
                            onPress={onCancel}
                            className={`p-4 rounded-xl items-center mt-2 ${isDark ? 'bg-gray-800' : 'bg-gray-200'}`}
                        >
                            <Text className={`font-bold ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('common.cancel')}</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </Modal>
    );
};
