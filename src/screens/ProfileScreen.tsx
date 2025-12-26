import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../store/useAuthStore';
import { useGoogleAuth, getUserInfo } from '../utils/googleAuth';

export default function ProfileScreen({ navigation }: any) {
    const { user, isAuthenticated, setUser, signOut } = useAuthStore();
    const { request, response, promptAsync } = useGoogleAuth();

    useEffect(() => {
        if (response?.type === 'success') {
            const { authentication } = response;
            if (authentication?.accessToken) {
                getUserInfo(authentication.accessToken).then((userInfo) => {
                    if (userInfo) {
                        setUser(userInfo, authentication.accessToken);
                        Alert.alert('Success', 'Signed in successfully!');
                    }
                });
            }
        }
    }, [response]);

    const handleSignOut = () => {
        Alert.alert(
            'Sign Out',
            'Are you sure you want to sign out?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Sign Out',
                    style: 'destructive',
                    onPress: () => {
                        signOut();
                        Alert.alert('Signed Out', 'You have been signed out successfully.');
                    },
                },
            ]
        );
    };

    if (!isAuthenticated || !user) {
        return (
            <SafeAreaView className="flex-1 bg-gray-900" edges={['bottom', 'left', 'right']}>
                <View className="flex-1 items-center justify-center p-6">
                    <Ionicons name="person-circle-outline" size={120} color="#6B7280" />
                    <Text className="text-white text-2xl font-bold mt-6 mb-2">Welcome to Cric Score</Text>
                    <Text className="text-gray-400 text-center mb-8">
                        Sign in with Google to sync your matches and access premium features
                    </Text>

                    <TouchableOpacity
                        disabled={!request}
                        onPress={() => promptAsync()}
                        className="bg-white flex-row items-center px-6 py-4 rounded-xl shadow-lg"
                    >
                        <Image
                            source={{ uri: 'https://www.google.com/favicon.ico' }}
                            style={{ width: 24, height: 24, marginRight: 12 }}
                        />
                        <Text className="text-gray-900 font-bold text-lg">Sign in with Google</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-gray-900" edges={['bottom', 'left', 'right']}>
            <ScrollView className="flex-1 p-6">
                <View className="items-center mb-8">
                    {user.picture ? (
                        <Image
                            source={{ uri: user.picture }}
                            style={{ width: 100, height: 100, borderRadius: 50 }}
                        />
                    ) : (
                        <Ionicons name="person-circle" size={100} color="#6B7280" />
                    )}
                    <Text className="text-white text-2xl font-bold mt-4">{user.name}</Text>
                    <Text className="text-gray-400 text-sm">{user.email}</Text>
                </View>

                <View className="bg-gray-800 rounded-xl p-4 mb-4 border border-gray-700">
                    <Text className="text-gray-500 text-xs uppercase tracking-wider mb-3">Account</Text>
                    <View className="flex-row items-center mb-2">
                        <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                        <Text className="text-white ml-2">Signed in with Google</Text>
                    </View>
                </View>

                <TouchableOpacity
                    onPress={handleSignOut}
                    className="bg-red-600 p-4 rounded-xl items-center mt-4"
                >
                    <Text className="text-white font-bold text-lg">Sign Out</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}
