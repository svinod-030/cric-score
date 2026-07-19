import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TouchableOpacity, Switch, TextInput } from 'react-native';
import { useTranslation } from 'react-i18next';

interface RunSelectionModalProps {
    visible: boolean;
    title: string;
    onSelect: (runs: number, isBye?: boolean) => void;
    onClose: () => void;
    options?: number[];
    showByeToggle?: boolean;
    allowCustom?: boolean;
}

export const RunSelectionModal = ({
    visible,
    title,
    onSelect,
    onClose,
    options = [0, 1, 2, 3, 4, 6],
    showByeToggle = false,
    allowCustom = true,
}: RunSelectionModalProps) => {
    const { t } = useTranslation();
    const [isBye, setIsBye] = useState(false);
    const [showCustomInput, setShowCustomInput] = useState(false);
    const [customRuns, setCustomRuns] = useState('');

    // Reset state when modal opens
    useEffect(() => {
        if (visible) {
            setIsBye(false);
            setShowCustomInput(false);
            setCustomRuns('');
        }
    }, [visible]);

    const handleCustomConfirm = () => {
        const parsed = parseInt(customRuns, 10);
        if (!isNaN(parsed) && parsed >= 0) {
            onSelect(parsed, isBye);
        }
    };

    return (
        <Modal visible={visible} transparent animationType="fade">
            <View className="flex-1 justify-center items-center bg-black/60 p-6">
                <View className="bg-gray-800 w-full rounded-3xl p-6 border border-gray-700">
                    <Text className="text-white text-xl font-bold mb-6 text-center">{title}</Text>

                    {showByeToggle && (
                        <View className="flex-row items-center justify-between mb-6 bg-gray-700/50 p-4 rounded-xl">
                            <Text className="text-white font-medium text-lg">{t('common.byesNotFromBat')}</Text>
                            <Switch
                                value={isBye}
                                onValueChange={setIsBye}
                                trackColor={{ false: '#374151', true: '#2563eb' }}
                                thumbColor={isBye ? '#60a5fa' : '#9ca3af'}
                            />
                        </View>
                    )}

                    {!showCustomInput ? (
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
                            {allowCustom && (
                                <TouchableOpacity
                                    onPress={() => setShowCustomInput(true)}
                                    className="w-16 h-16 bg-gray-700 rounded-2xl items-center justify-center border border-dashed border-gray-500 active:bg-blue-600"
                                >
                                    <Text className="text-white text-xs font-bold text-center">{t('common.other')}</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    ) : (
                        <View className="items-center">
                            <Text className="text-gray-400 mb-3 text-sm text-center">{t('common.enterCustomRuns')}</Text>
                            <TextInput
                                autoFocus
                                keyboardType="number-pad"
                                value={customRuns}
                                onChangeText={(v) => setCustomRuns(v.replace(/[^0-9]/g, ''))}
                                className="bg-gray-700 text-white text-2xl font-bold text-center w-24 h-16 rounded-2xl border border-gray-600 mb-4"
                                placeholder="0"
                                placeholderTextColor="#666"
                                maxLength={3}
                            />
                            <View className="flex-row gap-3 w-full">
                                <TouchableOpacity
                                    onPress={() => setShowCustomInput(false)}
                                    className="flex-1 p-4 bg-gray-700 rounded-xl items-center"
                                >
                                    <Text className="text-gray-300 font-bold">{t('common.back')}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={handleCustomConfirm}
                                    disabled={customRuns === ''}
                                    className={`flex-1 p-4 rounded-xl items-center ${customRuns === '' ? 'bg-gray-700' : 'bg-blue-600'}`}
                                >
                                    <Text className="text-white font-bold">{t('common.confirm')}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}

                    <TouchableOpacity
                        onPress={onClose}
                        className="mt-8 p-4 bg-gray-700 rounded-xl items-center"
                    >
                        <Text className="text-gray-300 font-bold">{t('common.cancel')}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};
