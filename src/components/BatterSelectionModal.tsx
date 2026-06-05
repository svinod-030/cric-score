import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Player, BattingStats } from '../types/match';
import { useAppTheme } from '../hooks/useAppTheme';

interface BatterSelectionModalProps {
    visible: boolean;
    players: Player[];
    battingStats: Record<string, BattingStats>;
    onSelect: (playerId: string) => void;
    title: string;
}

export const BatterSelectionModal = ({ visible, players, battingStats, onSelect, title }: BatterSelectionModalProps) => {
    const { t } = useTranslation();
    const { isDark } = useAppTheme();

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={() => { }} // Block back button
        >
            <View className="flex-1 bg-black/80 justify-end">
                <View className={`rounded-t-3xl p-6 h-2/3 ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
                    <Text className={`text-xl font-bold mb-4 text-center ${isDark ? 'text-white' : 'text-gray-900'}`}>{title}</Text>
                    <ScrollView>
                        {players.map(player => (
                            <TouchableOpacity
                                key={player.id}
                                className={`p-4 border-b ${isDark ? 'border-gray-800 active:bg-gray-800' : 'border-gray-200 active:bg-gray-100'}`}
                                onPress={() => onSelect(player.id)}
                            >
                                <View className="flex-row items-center justify-between">
                                    <Text className={`text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>{player.name}</Text>
                                    {battingStats[player.id]?.isRetired && (
                                        <Text className="text-orange-500 text-sm italic font-bold">
                                            ({t('common.retired')})
                                        </Text>
                                    )}
                                </View>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
};
