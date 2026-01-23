import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert, Linking, Platform } from 'react-native';
import SettingsScreen from '../SettingsScreen';
import { useAuthStore } from '../../store/useAuthStore';
import { backupToDrive } from '../../utils/backupService';

// Mock dependencies
jest.mock('../../store/useAuthStore');
jest.mock('../../utils/backupService');
jest.mock('@react-navigation/native', () => ({
    useNavigation: () => ({
        navigate: jest.fn(),
    }),
}));

// Mock Alert
jest.spyOn(Alert, 'alert');

// Mock Linking
jest.spyOn(Linking, 'openURL').mockImplementation(() => Promise.resolve(true));

describe('SettingsScreen', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.useFakeTimers();

        // Default auth state
        (useAuthStore as unknown as jest.Mock).mockReturnValue({
            isAuthenticated: false,
        });
    });

    afterEach(() => {
        jest.runOnlyPendingTimers();
        jest.useRealTimers();
    });

    test('renders without crashing', () => {
        const { getByText } = render(<SettingsScreen />);

        expect(getByText('Settings')).toBeTruthy();
    });

    test('displays all setting sections', () => {
        const { getByText } = render(<SettingsScreen />);

        expect(getByText(/general/i)).toBeTruthy();
        expect(getByText(/about/i)).toBeTruthy();
    });

    test('displays all setting items', () => {
        const { getByText } = render(<SettingsScreen />);

        expect(getByText('Rate App')).toBeTruthy();
        expect(getByText('Backup')).toBeTruthy();
        expect(getByText('Open Source Licenses')).toBeTruthy();
        expect(getByText('Contact Us')).toBeTruthy();
    });

    test('displays app version', () => {
        const { getByText } = render(<SettingsScreen />);

        expect(getByText('Cric Score')).toBeTruthy();
        expect(getByText(/Version/)).toBeTruthy();
    });

    describe('Rate App functionality', () => {
        test('opens Android store URL on Android', () => {
            Platform.OS = 'android';
            const { getByText } = render(<SettingsScreen />);

            fireEvent.press(getByText('Rate App'));

            expect(Linking.openURL).toHaveBeenCalledWith(
                expect.stringContaining('market://details?id=')
            );
        });

        test('opens iOS store URL on iOS', () => {
            Platform.OS = 'ios';
            const { getByText } = render(<SettingsScreen />);

            fireEvent.press(getByText('Rate App'));

            expect(Linking.openURL).toHaveBeenCalledWith(
                expect.stringContaining('itms-apps://')
            );
        });
    });

    describe('Backup functionality', () => {
        test('shows alert when not authenticated', () => {
            (useAuthStore as unknown as jest.Mock).mockReturnValue({
                isAuthenticated: false,
            });

            const { getByText } = render(<SettingsScreen />);

            fireEvent.press(getByText('Backup'));

            expect(Alert.alert).toHaveBeenCalledWith(
                'Sign In Required',
                expect.stringContaining('Please sign in with Google')
            );
        });

        test('performs backup when authenticated and successful', async () => {
            (useAuthStore as unknown as jest.Mock).mockReturnValue({
                isAuthenticated: true,
            });
            (backupToDrive as jest.Mock).mockResolvedValue(true);

            const { getByText } = render(<SettingsScreen />);

            fireEvent.press(getByText('Backup'));

            await waitFor(() => {
                expect(backupToDrive).toHaveBeenCalled();
            });

            await waitFor(() => {
                expect(Alert.alert).toHaveBeenCalledWith(
                    'Backup Success',
                    expect.stringContaining('successfully backed up')
                );
            });
        });

        test('shows error alert when backup fails', async () => {
            (useAuthStore as unknown as jest.Mock).mockReturnValue({
                isAuthenticated: true,
            });
            (backupToDrive as jest.Mock).mockResolvedValue(false);

            const { getByText } = render(<SettingsScreen />);

            fireEvent.press(getByText('Backup'));

            await waitFor(() => {
                expect(backupToDrive).toHaveBeenCalled();
            });

            await waitFor(() => {
                expect(Alert.alert).toHaveBeenCalledWith(
                    'Backup Failed',
                    expect.stringContaining('error backing up')
                );
            });
        });

        test('shows backing up state during backup', async () => {
            (useAuthStore as unknown as jest.Mock).mockReturnValue({
                isAuthenticated: true,
            });
            (backupToDrive as jest.Mock).mockImplementation(() =>
                new Promise(resolve => setTimeout(() => resolve(true), 100))
            );

            const { getByText, queryByText } = render(<SettingsScreen />);

            fireEvent.press(getByText('Backup'));

            // Should show "Backing up..." during the process
            await waitFor(() => {
                expect(queryByText('Backing up...')).toBeTruthy();
            });
        });
    });

    describe('Contact Us functionality', () => {
        test('opens email client with support email', () => {
            const { getByText } = render(<SettingsScreen />);

            fireEvent.press(getByText('Contact Us'));

            expect(Linking.openURL).toHaveBeenCalledWith(
                expect.stringContaining('mailto:')
            );
            expect(Linking.openURL).toHaveBeenCalledWith(
                expect.stringContaining('CricScore Support')
            );
        });
    });

    describe('Licenses navigation', () => {
        test('navigates to Licenses screen', () => {
            const mockNavigate = jest.fn();
            jest.spyOn(require('@react-navigation/native'), 'useNavigation').mockReturnValue({
                navigate: mockNavigate,
            });

            const { getByText } = render(<SettingsScreen />);

            fireEvent.press(getByText('Open Source Licenses'));

            expect(mockNavigate).toHaveBeenCalledWith('Licenses');
        });
    });
});
