import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TouchableOpacity, Switch } from 'react-native';

interface RunSelectionModalProps {
    visible: boolean;
    title: string;
    onSelect: (runs: number, isBye?: boolean) => void;
    onClose: () => void;
    options?: number[];
    showByeToggle?: boolean;
}

export const RunSelectionModal = ({ 
    visible, 
    title, 
    onSelect, 
    onClose, 
    options = [0, 1, 2, 3, 4, 6],
    showByeToggle = false
}: RunSelectionModalProps) => {
    const [isBye, setIsBye] = useState(false);

    // Reset state when modal opens
    useEffect(() => {
        if (visible) setIsBye(false);
    }, [visible]);

    return (
        <Modal visible={visible} transparent animationType="fade">
            <View className="flex-1 justify-center items-center bg-black/60 p-6">
                <View className="bg-gray-800 w-full rounded-3xl p-6 border border-gray-700">
                    <Text className="text-white text-xl font-bold mb-6 text-center">{title}</Text>

                    {showByeToggle && (
                        <View className="flex-row items-center justify-between mb-6 bg-gray-700/50 p-4 rounded-xl">
                            <Text className="text-white font-medium text-lg">Byes (Not from Bat)</Text>
                            <Switch
                                value={isBye}
                                onValueChange={setIsBye}
                                trackColor={{ false: '#374151', true: '#2563eb' }}
                                thumbColor={isBye ? '#60a5fa' : '#9ca3af'}
                            />
                        </View>
                    )}

                    <View className="flex-row flex-wrap gap-4 justify-center">
                        {options.map((run) => (
                            <TouchableOpacity
                                key={run}
                                onPress={() => onSelect(run, isBye)}
                                className="w-16 h-16 bg-gray-700 rounded-2xl items-center justify-center border border-gray-600 active:bg-blue-600"
                            >
                                <Text className="text-white text-2xl font-bold">{run}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <TouchableOpacity
                        onPress={onClose}
                        className="mt-8 p-4 bg-gray-700 rounded-xl items-center"
                    >
                        <Text className="text-gray-300 font-bold">Cancel</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};
