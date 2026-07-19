import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { Player, InningsState } from '../types/match';
import { useTranslation } from 'react-i18next';
import { PersistentScoreStrip } from './PersistentScoreStrip';

interface BowlerSelectionModalProps {
    visible: boolean;
    players: Player[];
    onSelect: (playerId: string) => void;
    innings?: InningsState;
    oversLimit?: number;
    allPlayers?: Player[];
}

export const BowlerSelectionModal = ({ visible, players, onSelect, innings, oversLimit, allPlayers }: BowlerSelectionModalProps) => {
    const { t } = useTranslation();
    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={() => { }} // Block back button
        >
            <View className="flex-1 bg-black/50 justify-end">
                <View className="bg-gray-900 rounded-t-3xl p-6 h-2/3">
                    {innings && oversLimit !== undefined && allPlayers && (
                        <PersistentScoreStrip innings={innings} oversLimit={oversLimit} allPlayers={allPlayers} />
                    )}
                    <Text className="text-white text-xl font-bold mb-4 text-center">{t('common.selectBowler')}</Text>
                    <ScrollView>
                        {players.map(player => (
                            <TouchableOpacity
                                key={player.id}
                                className="p-4 border-b border-gray-800 active:bg-gray-800"
                                onPress={() => onSelect(player.id)}
                            >
                                <Text className="text-white text-lg">{player.name}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
};
