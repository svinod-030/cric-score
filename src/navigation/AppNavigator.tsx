import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MatchSetupScreen from '../screens/MatchSetupScreen';
import ScoreboardScreen from '../screens/ScoreboardScreen';
import MatchResultScreen from '../screens/MatchResultScreen';

import { Image, Text, View } from 'react-native';

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import MatchesHistoryScreen from '../screens/MatchesHistoryScreen';
import SettingsScreen from '../screens/SettingsScreen';
import LicensesScreen from '../screens/LicensesScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function LogoTitle() {
    return (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Image
                style={{ width: 40, height: 40, borderRadius: 20 }}
                source={require('../../assets/icon.png')}
                resizeMode="contain"
            />
            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 20 }}>Cric Score</Text>
        </View>
    );
}

function HomeTabs() {
    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#1F2937' }} edges={['bottom', 'left', 'right']}>
            <Tab.Navigator
                screenOptions={({ route }) => ({
                    headerShown: false,
                    tabBarStyle: {
                        backgroundColor: '#1F2937', // gray-800
                        borderTopColor: '#374151', // gray-700
                        elevation: 0, // Android shadow remove
                        paddingTop: 5,
                    },
                    tabBarActiveTintColor: '#3B82F6', // blue-500
                    tabBarInactiveTintColor: '#9CA3AF', // gray-400
                    tabBarIcon: ({ focused, color, size }) => {
                        let iconName: any;

                        if (route.name === 'Start Match') {
                            iconName = focused ? 'play-circle' : 'play-circle-outline';
                        } else if (route.name === 'Matches') {
                            iconName = focused ? 'time' : 'time-outline';
                        } else if (route.name === 'Settings') {
                            iconName = focused ? 'settings' : 'settings-outline';
                        }

                        return <Ionicons name={iconName} size={size} color={color} />;
                    },
                })}
            >
                <Tab.Screen name="Start Match" component={MatchSetupScreen} />
                <Tab.Screen name="Matches" component={MatchesHistoryScreen} />
                <Tab.Screen name="Settings" component={SettingsScreen} />
            </Tab.Navigator>
        </SafeAreaView>
    );
}

export default function AppNavigator() {
    return (
        <NavigationContainer>
            <Stack.Navigator
                screenOptions={{
                    headerStyle: {
                        backgroundColor: '#111827',
                    },
                    headerTintColor: '#fff',
                    headerTitleStyle: {
                        fontWeight: 'bold',
                    },
                    headerTitle: () => <LogoTitle />,
                    contentStyle: { backgroundColor: '#111827' }
                }}
            >
                <Stack.Screen
                    name="HomeTabs"
                    component={HomeTabs}
                    options={{ title: '' }}
                />
                <Stack.Screen name="Scoreboard" component={ScoreboardScreen} options={{ title: 'Score board' }} />
                <Stack.Screen name="MatchResult" component={MatchResultScreen} options={{ title: 'Result' }} />
                <Stack.Screen name="Licenses" component={LicensesScreen} options={{ headerShown: false }} />
            </Stack.Navigator>
        </NavigationContainer>
    );
}
