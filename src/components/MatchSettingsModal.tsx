import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { ExtrasRulesEditor, ExtrasRulesValues } from './ExtrasRulesEditor';

interface MatchSettingsModalProps {
    visible: boolean;
    onClose: () => void;
    values: ExtrasRulesValues;
    onSave: (updates: Partial<ExtrasRulesValues>) => void;
}

// Lets scorers fix extras rules (run value for Wide/No Ball, re-ball toggles)
// mid-game, in case they weren't configured correctly during Match Setup.
export const MatchSettingsModal = ({ visible, onClose, values, onSave }: MatchSettingsModalProps) => {
    const { t } = useTranslation();
    const [draft, setDraft] = useState<ExtrasRulesValues>(values);

    useEffect(() => {
        if (visible) setDraft(values);
    }, [visible, values]);

    const handleSave = () => {
        onSave(draft);
        onClose();
    };

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <View className="flex-1 justify-end bg-black/60">
                <View className="bg-gray-900 rounded-t-3xl p-6 border-t border-gray-800">
                    <View className="flex-row items-center justify-between mb-2">
                        <Text className="text-white text-xl font-bold">{t('common.matchSettingsMidGame')}</Text>
                        <TouchableOpacity onPress={onClose} className="p-1">
                            <Ionicons name="close" size={24} color="#9ca3af" />
                        </TouchableOpacity>
                    </View>
                    <Text className="text-gray-400 text-sm mb-6">{t('common.editMatchRulesDescription')}</Text>

                    <ExtrasRulesEditor
                        values={draft}
                        onChange={(patch) => setDraft((prev) => ({ ...prev, ...patch }))}
                    />

                    <TouchableOpacity
                        onPress={handleSave}
                        className="mt-6 p-4 bg-blue-600 rounded-xl items-center shadow-lg shadow-blue-900/40"
                    >
                        <Text className="text-white font-bold text-lg">{t('common.saveChanges')}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};
