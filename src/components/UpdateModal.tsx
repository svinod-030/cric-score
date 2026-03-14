import React from 'react';
import { View, Text, Modal, TouchableOpacity, Linking, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

interface UpdateModalProps {
    visible: boolean;
    onClose: () => void;
    latestVersion: string;
    storeUrl: string;
}

export default function UpdateModal({ visible, onClose, latestVersion, storeUrl }: UpdateModalProps) {
    const { t } = useTranslation();

    const handleUpdate = () => {
        if (storeUrl) {
            Linking.openURL(storeUrl).catch(err => console.error("Couldn't load page", err));
        }
    };

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={onClose}
        >
            <View className="flex-1 bg-black/70 justify-center items-center p-6">
                <View className="bg-gray-800 w-full max-w-sm rounded-[32px] border border-gray-700 overflow-hidden shadow-2xl">
                    {/* Header with Icon */}
                    <View className="bg-blue-600/20 p-8 items-center">
                        <View className="bg-blue-500 w-20 h-20 rounded-full items-center justify-center shadow-lg shadow-blue-500/50">
                            <Ionicons name="rocket-outline" size={40} color="white" />
                        </View>
                    </View>

                    <View className="p-8 items-center">
                        <Text className="text-white text-2xl font-bold text-center mb-2">
                            {t('common.updateAvailable') || 'Update Available!'}
                        </Text>
                        <Text className="text-gray-400 text-center mb-6 leading-5">
                            {t('common.newVersionMsg', { version: latestVersion }) || 
                             `A new version (${latestVersion}) of Cric Score is available with new features and improvements.`}
                        </Text>

                        <TouchableOpacity
                            onPress={handleUpdate}
                            className="bg-blue-600 w-full py-4 rounded-2xl items-center shadow-lg shadow-blue-600/30 active:bg-blue-700"
                        >
                            <Text className="text-white font-bold text-lg">
                                {t('common.updateNow') || 'Update Now'}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={onClose}
                            className="mt-4 w-full py-2 items-center active:opacity-60"
                        >
                            <Text className="text-gray-500 font-semibold">
                                {t('common.maybeLater') || 'Maybe Later'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}
