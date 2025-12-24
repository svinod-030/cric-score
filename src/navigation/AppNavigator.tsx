import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MatchSetupScreen from '../screens/MatchSetupScreen';
import ScoreboardScreen from '../screens/ScoreboardScreen';
import MatchResultScreen from '../screens/MatchResultScreen';

import { Image, Text, View } from 'react-native';

const Stack = createNativeStackNavigator();

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
                    name="MatchSetup"
                    component={MatchSetupScreen}
                    options={{ title: '' }}
                />
                <Stack.Screen name="Scoreboard" component={ScoreboardScreen} options={{ title: 'Score board' }} />
                <Stack.Screen name="MatchResult" component={MatchResultScreen} options={{ title: 'Result' }} />
            </Stack.Navigator>
        </NavigationContainer>
    );
}
