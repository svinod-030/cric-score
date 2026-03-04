import React from 'react';
import { View, Text, Modal, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';

interface WhoIsOutModalProps {
    visible: boolean;
    strikerName: string;
    nonStrikerName: string;
    onSelect: (who: 'striker' | 'non-striker') => void;
    onCancel: () => void;
}

export const WhoIsOutModal = ({ visible, strikerName, nonStrikerName, onSelect, onCancel }: WhoIsOutModalProps) => {
    const { t } = useTranslation();
    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="slide"
            onRequestClose={onCancel}
        >
            <View className="flex-1 bg-black/50 justify-end">
                <View className="bg-gray-800 rounded-t-3xl p-6">
                    <Text className="text-white text-xl font-bold text-center mb-6">{t('common.whoIsOut')}</Text>

                    <TouchableOpacity
                        onPress={() => onSelect('striker')}
                        className="bg-red-600 p-4 rounded-xl mb-3"
                    >
                        <Text className="text-white text-center font-bold text-lg">{strikerName} ({t('common.striker')})</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => onSelect('non-striker')}
                        className="bg-red-600 p-4 rounded-xl mb-3"
                    >
                        <Text className="text-white text-center font-bold text-lg">{nonStrikerName} ({t('common.nonStriker')})</Text>
                    </TouchableOpacity>


                    <TouchableOpacity
                        onPress={onCancel}
                        className="mt-2 p-4"
                    >
                        <Text className="text-gray-400 text-center font-bold">{t('common.cancel')}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};
