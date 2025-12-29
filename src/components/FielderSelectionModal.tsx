import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { Player } from '../types/match';

interface FielderSelectionModalProps {
    visible: boolean;
    players: Player[];
    onSelect: (playerId: string) => void;
    title?: string;
    onCancel?: () => void;
}

export const FielderSelectionModal = ({ visible, players, onSelect, title = "Select Fielder", onCancel }: FielderSelectionModalProps) => {
    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
        >
            <View className="flex-1 bg-black/80 justify-end">
                <View className="bg-gray-900 rounded-t-3xl p-6 h-2/3">
                    <Text className="text-white text-xl font-bold mb-4 text-center">{title}</Text>
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
                    {onCancel && (
                        <TouchableOpacity
                            onPress={onCancel}
                            className="p-4 bg-gray-800 rounded-xl items-center mt-2"
                        >
                            <Text className="text-gray-400 font-bold">Cancel</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </Modal>
    );
};
