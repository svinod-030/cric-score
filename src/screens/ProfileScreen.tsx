import React from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../store/useAuthStore';
import { signInWithGoogle, signOutGoogle } from '../utils/googleAuth';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '../hooks/useAppTheme';

export default function ProfileScreen({ navigation }: any) {
    const { t } = useTranslation();
    const { user, isAuthenticated, setUser, signOut } = useAuthStore();
    const { isDark } = useAppTheme();

    const bg = isDark ? 'bg-gray-900' : 'bg-gray-100';
    const cardBg = isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
    const titleColor = isDark ? 'text-white' : 'text-gray-900';
    const subtitleColor = isDark ? 'text-gray-400' : 'text-gray-500';
    const labelColor = isDark ? 'text-gray-500' : 'text-gray-400';

    const handleGoogleSignIn = async () => {
        try {
            const result = await signInWithGoogle();
            if (result) {
                setUser(result.user, result.accessToken);
                Alert.alert(t('common.success'), t('common.signedInSuccess'));
            }
        } catch (error: any) {
            Alert.alert(t('common.error'), error.message || t('common.authenticationFailed'));
        }
    };

    const handleSignOut = async () => {
        Alert.alert(
            t('common.signOut'),
            t('common.signOutConfirm'),
            [
                { text: t('common.cancel'), style: 'cancel' },
                {
                    text: t('common.signOut'),
                    style: 'destructive',
                    onPress: async () => {
                        await signOutGoogle();
                        signOut();
                        Alert.alert(t('common.signedOut'), t('common.signedOutSuccess'));
                    },
                },
            ]
        );
    };

    if (!isAuthenticated || !user) {
        return (
            <SafeAreaView className={`flex-1 ${bg}`} edges={['bottom', 'left', 'right']}>
                <View className="flex-1 items-center justify-center p-6">
                    <Ionicons name="person-circle-outline" size={120} color={isDark ? '#6B7280' : '#9CA3AF'} />
                    <Text className={`text-2xl font-bold mt-6 mb-2 ${titleColor}`}>{t('common.welcomeToCricScore')}</Text>
                    <Text className={`text-center mb-8 ${subtitleColor}`}>
                        {t('common.signInGoogleSync')}
                    </Text>

                    <TouchableOpacity
                        onPress={handleGoogleSignIn}
                        className="bg-white flex-row items-center px-6 py-4 rounded-xl shadow-lg"
                    >
                        <Image
                            source={{ uri: 'https://www.google.com/favicon.ico' }}
                            style={{ width: 24, height: 24, marginRight: 12 }}
                        />
                        <Text className="text-gray-900 font-bold text-lg">{t('common.signInWithGoogle')}</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className={`flex-1 ${bg}`} edges={['bottom', 'left', 'right']}>
            <ScrollView className="flex-1 p-6">
                <View className="items-center mb-8">
                    {user.picture ? (
                        <Image
                            source={{ uri: user.picture }}
                            style={{ width: 100, height: 100, borderRadius: 50 }}
                        />
                    ) : (
                        <Ionicons name="person-circle" size={100} color={isDark ? '#6B7280' : '#9CA3AF'} />
                    )}
                    <Text className={`text-2xl font-bold mt-4 ${titleColor}`}>{user.name}</Text>
                    <Text className={`text-sm ${subtitleColor}`}>{user.email}</Text>
                </View>

                <View className={`rounded-xl p-4 mb-4 border ${cardBg}`}>
                    <Text className={`text-xs uppercase tracking-wider mb-3 ${labelColor}`}>{t('common.account')}</Text>
                    <View className="flex-row items-center mb-2">
                        <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                        <Text className={`ml-2 ${titleColor}`}>{t('common.signedInWithGoogle')}</Text>
                    </View>
                </View>

                <TouchableOpacity
                    onPress={handleSignOut}
                    className="bg-red-600 p-4 rounded-xl items-center mt-4"
                >
                    <Text className="text-white font-bold text-lg">{t('common.signOut')}</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}
