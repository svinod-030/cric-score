import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TouchableOpacity, Switch } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '../hooks/useAppTheme';

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
    const { t } = useTranslation();
    const { isDark } = useAppTheme();
    const [isBye, setIsBye] = useState(false);

    // Reset state when modal opens
    useEffect(() => {
        if (visible) setIsBye(false);
    }, [visible]);

    return (
        <Modal visible={visible} transparent animationType="fade">
            <View className="flex-1 justify-center items-center bg-black/60 p-6">
                <View className={`w-full rounded-3xl p-6 border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                    <Text className={`text-xl font-bold mb-6 text-center ${isDark ? 'text-white' : 'text-gray-900'}`}>{title}</Text>

                    {showByeToggle && (
                        <View className={`flex-row items-center justify-between mb-6 p-4 rounded-xl ${isDark ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
                            <Text className={`font-medium text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('common.byesNotFromBat')}</Text>
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
                                className={`w-16 h-16 rounded-2xl items-center justify-center border active:bg-blue-600 ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-100 border-gray-300'}`}
                            >
                                <Text className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{run}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <TouchableOpacity
                        onPress={onClose}
                        className={`mt-8 p-4 rounded-xl items-center ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}
                    >
                        <Text className={`font-bold ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{t('common.cancel')}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};
