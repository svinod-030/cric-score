import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { matchSyncService } from '../services/matchSyncService';

export default function JoinLiveMatchScreen({ navigation }: any) {
    const { t } = useTranslation();
    const [matchId, setMatchId] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleJoin = async () => {
        if (!matchId.trim()) return;
        
        setIsLoading(true);
        try {
            // Quick check if it exists
            const match = await matchSyncService.getMatch(matchId.trim().toUpperCase());
            if (match) {
                navigation.navigate('LiveViewer', { matchId: matchId.trim().toUpperCase() });
            } else {
                Alert.alert(t('common.error'), t('common.matchNotFound'));
            }
        } catch (error) {
            Alert.alert(t('common.error'), t('common.failedToConnect'));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-900" edges={['top', 'left', 'right']}>
            <KeyboardAvoidingView 
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1"
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <ScrollView 
                        contentContainerStyle={{ flexGrow: 1 }}
                        keyboardShouldPersistTaps="handled"
                    >
                        <View className="flex-1 p-6 justify-center">
                            <View className="items-center mb-10">
                                <View className="w-24 h-24 bg-blue-600/20 rounded-full items-center justify-center mb-6">
                                    <Ionicons name="radio" size={48} color="#3b82f6" />
                                </View>
                                <Text className="text-3xl font-black text-white text-center mb-2">{t('common.watchLive')}</Text>
                                <Text className="text-gray-400 text-center px-4">
                                    {t('common.enterMatchIdDescription')}
                                </Text>
                            </View>

                            <View className="bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow-xl">
                                <Text className="text-gray-300 font-bold mb-3 uppercase tracking-wider text-xs">{t('common.matchIdLabel')}</Text>
                                <TextInput
                                    className="bg-gray-900 text-white p-4 rounded-xl border border-gray-700 text-center text-2xl font-black tracking-widest mb-6 uppercase"
                                    placeholder={t('common.enterIdPlaceholder')}
                                    placeholderTextColor="#4b5563"
                                    value={matchId}
                                    onChangeText={setMatchId}
                                    autoCapitalize="characters"
                                    maxLength={8}
                                />

                                <TouchableOpacity
                                    onPress={handleJoin}
                                    disabled={!matchId.trim() || isLoading}
                                    className={`p-4 rounded-xl flex-row justify-center items-center ${!matchId.trim() || isLoading ? 'bg-gray-700' : 'bg-blue-600'}`}
                                >
                                    {isLoading ? (
                                        <ActivityIndicator color="#fff" />
                                    ) : (
                                        <>
                                            <Ionicons name="enter-outline" size={24} color={!matchId.trim() ? '#9ca3af' : '#fff'} />
                                            <Text className={`text-lg font-bold ml-2 ${!matchId.trim() ? 'text-gray-400' : 'text-white'}`}>{t('common.joinMatch')}</Text>
                                        </>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </View>
                    </ScrollView>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
