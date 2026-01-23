import React from 'react';
import { render } from '@testing-library/react-native';
import LicensesScreen from '../LicensesScreen';

// Mock Linking
jest.mock('react-native/Libraries/Linking/Linking', () => ({
    openURL: jest.fn(),
}));

// Mock navigation
const mockNavigation = {
    navigate: jest.fn(),
    goBack: jest.fn(),
    setOptions: jest.fn(),
};

describe('LicensesScreen', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('renders without crashing', () => {
        const { getByText } = render(<LicensesScreen navigation={mockNavigation as any} />);

        expect(getByText('Open Source Licenses')).toBeTruthy();
    });

    test('displays main heading', () => {
        const { getByText } = render(<LicensesScreen navigation={mockNavigation as any} />);

        expect(getByText('Open Source Licenses')).toBeTruthy();
    });

    test('displays license  items', () => {
        const { getByText } = render(<LicensesScreen navigation={mockNavigation as any} />);

        expect(getByText('React Native')).toBeTruthy();
        expect(getByText('Expo')).toBeTruthy();
    });
});
