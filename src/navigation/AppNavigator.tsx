import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MatchSetupScreen from '../screens/MatchSetupScreen';
import ScoreboardScreen from '../screens/ScoreboardScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
    return (
        <NavigationContainer>
            <Stack.Navigator
                screenOptions={{
                    headerShown: false,
                    contentStyle: { backgroundColor: '#111827' }
                }}
            >
                <Stack.Screen name="MatchSetup" component={MatchSetupScreen} />
                <Stack.Screen name="Scoreboard" component={ScoreboardScreen} />
            </Stack.Navigator>
        </NavigationContainer>
    );
}
