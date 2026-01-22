import React from 'react';
import { View, Text, Modal, TouchableOpacity } from 'react-native';

interface WhoIsOutModalProps {
    visible: boolean;
    strikerName: string;
    nonStrikerName: string;
    onSelect: (who: 'striker' | 'non-striker') => void;
    onCancel: () => void;
}

export const WhoIsOutModal = ({ visible, strikerName, nonStrikerName, onSelect, onCancel }: WhoIsOutModalProps) => {
    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="slide"
            onRequestClose={onCancel}
        >
            <View className="flex-1 bg-black/50 justify-end">
                <View className="bg-gray-800 rounded-t-3xl p-6">
                    <Text className="text-white text-xl font-bold text-center mb-6">Who is out?</Text>

                    <TouchableOpacity
                        onPress={() => onSelect('striker')}
                        className="bg-red-600 p-4 rounded-xl mb-3"
                    >
                        <Text className="text-white text-center font-bold text-lg">{strikerName} (Striker)</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => onSelect('non-striker')}
                        className="bg-red-600 p-4 rounded-xl mb-3"
                    >
                        <Text className="text-white text-center font-bold text-lg">{nonStrikerName} (Non-Striker)</Text>
                    </TouchableOpacity>


                    <TouchableOpacity
                        onPress={onCancel}
                        className="mt-2 p-4"
                    >
                        <Text className="text-gray-400 text-center font-bold">Cancel</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};
