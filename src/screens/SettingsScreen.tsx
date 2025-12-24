import { View, Text, ScrollView, TouchableOpacity, Alert, Linking, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { APP_CONFIG } from '../utils/constants';

type SettingItemProps = {
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    subtitle?: string;
    onPress: () => void;
    color?: string;
};

const SettingItem = ({ icon, title, subtitle, onPress, color = '#3B82F6' }: SettingItemProps) => (
    <TouchableOpacity
        onPress={onPress}
        className="flex-row items-center bg-gray-800 p-4 rounded-xl mb-3 border border-gray-700 active:bg-gray-700"
    >
        <View className={`w-10 h-10 rounded-full items-center justify-center mr-4`} style={{ backgroundColor: `${color}20` }}>
            <Ionicons name={icon} size={20} color={color} />
        </View>
        <View className="flex-1">
            <Text className="text-white font-semibold text-lg">{title}</Text>
            {subtitle && <Text className="text-gray-400 text-xs">{subtitle}</Text>}
        </View>
        <Ionicons name="chevron-forward" size={20} color="#6B7280" />
    </TouchableOpacity>
);

import { useNavigation } from '@react-navigation/native';

export default function SettingsScreen() {
    const navigation = useNavigation<any>();

    const handlePress = (action: string) => {
        if (action === "Rate App") {
            if (Platform.OS === 'android') {
                Linking.openURL(APP_CONFIG.STORE_URL_ANDROID);
            } else {
                Linking.openURL(APP_CONFIG.STORE_URL_IOS);
            }
            return;
        }
        if (action === "Licenses") {
            navigation.navigate('Licenses');
            return;
        }
        if (action === "Contact Us") {
            Linking.openURL(`mailto:${APP_CONFIG.SUPPORT_EMAIL}?subject=CricScore Support`);
            return;
        }
        // TODO: Implement "Remove Ads" functionality with login and in-app purchase integration
        Alert.alert("Coming Soon", `${action} feature is under development.`);
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-900" edges={['left', 'right']}>
            <ScrollView className="p-4">
                <Text className="text-white text-3xl font-bold mb-6">Settings</Text>

                <View className="mb-6">
                    <Text className="text-gray-500 font-bold mb-3 uppercase text-xs tracking-wider">General</Text>
                    <SettingItem
                        icon="star"
                        title="Rate App"
                        subtitle="Rate us on the App Store"
                        onPress={() => handlePress("Rate App")}
                        color="#F59E0B"
                    />
                    <SettingItem
                        icon="diamond"
                        title="Remove Ads"
                        subtitle="Go Premium"
                        onPress={() => handlePress("Remove Ads")}
                        color="#EC4899"
                    />
                    <SettingItem
                        icon="cloud-upload"
                        title="Backup"
                        subtitle="Save your data safely"
                        onPress={() => handlePress("Backup")}
                        color="#10B981"
                    />
                </View>

                <View className="mb-6">
                    <Text className="text-gray-500 font-bold mb-3 uppercase text-xs tracking-wider">About</Text>
                    <SettingItem
                        icon="document-text"
                        title="Open Source Licenses"
                        onPress={() => handlePress("Licenses")}
                        color="#6366F1"
                    />
                    <SettingItem
                        icon="chatbubble-ellipses"
                        title="Contact Us"
                        subtitle="Support & Feedback"
                        onPress={() => handlePress("Contact Us")}
                        color="#3B82F6"
                    />
                </View>

                <View className="items-center mt-4 mb-10">
                    <Text className="text-gray-500 font-bold text-lg">Cric Score</Text>
                    <Text className="text-gray-600 text-sm">Version {APP_CONFIG.APP_VERSION}</Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
