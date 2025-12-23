import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { Player } from '../types/match';

interface BowlerSelectionModalProps {
    visible: boolean;
    players: Player[];
    onSelect: (playerId: string) => void;
}

export const BowlerSelectionModal = ({ visible, players, onSelect }: BowlerSelectionModalProps) => {
    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={() => { }} // Block back button
        >
            <View className="flex-1 bg-black/80 justify-end">
                <View className="bg-gray-900 rounded-t-3xl p-6 h-2/3">
                    <Text className="text-white text-xl font-bold mb-4 text-center">Select Bowler</Text>
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
