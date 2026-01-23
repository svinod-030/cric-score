import React from 'react';
import { render } from '@testing-library/react-native';
import AppNavigator from '../AppNavigator';
import { Text } from 'react-native';

// Mock navigation components
jest.mock('@react-navigation/native', () => ({
    NavigationContainer: ({ children }: any) => children,
    createNavigationContainerRef: () => ({ current: null }),
}));

jest.mock('@react-navigation/native-stack', () => ({
    createNativeStackNavigator: () => ({
        Navigator: ({ children }: any) => { const { Text } = require('react-native'); return <Text>AppNavigator</Text>; },
        Screen: () => null,
    }),
}));

jest.mock('@react-navigation/bottom-tabs', () => ({
    createBottomTabNavigator: () => ({
        Navigator: ({ children }: any) => children,
        Screen: () => null,
    }),
}));

// Mock screens inline to avoid hoisting issues
jest.mock('../../screens/MatchSetupScreen', () => {
    const { Text } = require('react-native');
    return () => <Text>MatchSetupScreen</Text>;
});
jest.mock('../../screens/ScoreboardScreen', () => {
    const { Text } = require('react-native');
    return () => <Text>ScoreboardScreen</Text>;
});
jest.mock('../../screens/MatchResultScreen', () => {
    const { Text } = require('react-native');
    return () => <Text>MatchResultScreen</Text>;
});
jest.mock('../../screens/MatchesHistoryScreen', () => {
    const { Text } = require('react-native');
    return () => <Text>MatchesHistoryScreen</Text>;
});
jest.mock('../../screens/ProfileScreen', () => {
    const { Text } = require('react-native');
    return () => <Text>ProfileScreen</Text>;
});
jest.mock('../../screens/SettingsScreen', () => {
    const { Text } = require('react-native');
    return () => <Text>SettingsScreen</Text>;
});
jest.mock('../../screens/LicensesScreen', () => {
    const { Text } = require('react-native');
    return () => <Text>LicensesScreen</Text>;
});

describe('AppNavigator', () => {
    test('renders without crashing', () => {
        const { toJSON } = render(<AppNavigator />);
        expect(toJSON()).toBeTruthy();
    });
});
