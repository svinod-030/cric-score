import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import ProfileScreen from '../ProfileScreen';
import { useAuthStore } from '../../store/useAuthStore';
import { signInWithGoogle, signOutGoogle } from '../../utils/googleAuth';

// Mock dependencies
jest.mock('../../store/useAuthStore');
jest.mock('../../utils/googleAuth');

// Mock Alert
jest.spyOn(Alert, 'alert');

describe('ProfileScreen', () => {
    const mockNavigation = {
        navigate: jest.fn(),
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('when user is not authenticated', () => {
        beforeEach(() => {
            (useAuthStore as unknown as jest.Mock).mockReturnValue({
                user: null,
                isAuthenticated: false,
                setUser: jest.fn(),
                signOut: jest.fn(),
            });
        });

        test('renders sign-in prompt', () => {
            const { getByText } = render(<ProfileScreen navigation={mockNavigation} />);

            expect(getByText('Welcome to Cric Score')).toBeTruthy();
            expect(getByText(/Sign in with Google to sync/)).toBeTruthy();
        });

        test('displays Google sign-in button', () => {
            const { getByText } = render(<ProfileScreen navigation={mockNavigation} />);

            expect(getByText('Sign in with Google')).toBeTruthy();
        });

        test('handles successful Google sign-in', async () => {
            const mockSetUser = jest.fn();
            (useAuthStore as unknown as jest.Mock).mockReturnValue({
                user: null,
                isAuthenticated: false,
                setUser: mockSetUser,
                signOut: jest.fn(),
            });

            const mockResult = {
                user: {
                    id: '123',
                    email: 'test@example.com',
                    name: 'Test User',
                    picture: 'https://example.com/photo.jpg',
                },
                accessToken: 'mock-token',
            };

            (signInWithGoogle as jest.Mock).mockResolvedValue(mockResult);

            const { getByText } = render(<ProfileScreen navigation={mockNavigation} />);

            fireEvent.press(getByText('Sign in with Google'));

            await waitFor(() => {
                expect(signInWithGoogle).toHaveBeenCalled();
                expect(mockSetUser).toHaveBeenCalledWith(mockResult.user, mockResult.accessToken);
                expect(Alert.alert).toHaveBeenCalledWith('Success', 'Signed in successfully!');
            });
        });

        test('handles Google sign-in failure', async () => {
            (signInWithGoogle as jest.Mock).mockRejectedValue(new Error('Authentication failed'));

            const { getByText } = render(<ProfileScreen navigation={mockNavigation} />);

            fireEvent.press(getByText('Sign in with Google'));

            await waitFor(() => {
                expect(Alert.alert).toHaveBeenCalledWith('Error', 'Authentication failed');
            });
        });

        test('handles Google sign-in with no result', async () => {
            (signInWithGoogle as jest.Mock).mockResolvedValue(null);

            const { getByText } = render(<ProfileScreen navigation={mockNavigation} />);

            fireEvent.press(getByText('Sign in with Google'));

            await waitFor(() => {
                expect(signInWithGoogle).toHaveBeenCalled();
            });

            // Should not call setUser or show success alert
            const mockSetUser = (useAuthStore as unknown as jest.Mock).mock.results[0].value.setUser;
            expect(mockSetUser).not.toHaveBeenCalled();
        });
    });

    describe('when user is authenticated', () => {
        const mockUser = {
            id: '123',
            email: 'test@example.com',
            name: 'Test User',
            picture: 'https://example.com/photo.jpg',
        };

        beforeEach(() => {
            (useAuthStore as unknown as jest.Mock).mockReturnValue({
                user: mockUser,
                isAuthenticated: true,
                setUser: jest.fn(),
                signOut: jest.fn(),
            });
        });

        test('renders user profile information', () => {
            const { getByText } = render(<ProfileScreen navigation={mockNavigation} />);

            expect(getByText(mockUser.name)).toBeTruthy();
            expect(getByText(mockUser.email)).toBeTruthy();
        });

        test('displays signed in status', () => {
            const { getByText } = render(<ProfileScreen navigation={mockNavigation} />);

            expect(getByText('Signed in with Google')).toBeTruthy();
            expect(getByText('Account')).toBeTruthy();
        });

        test('displays sign out button', () => {
            const { getByText } = render(<ProfileScreen navigation={mockNavigation} />);

            expect(getByText('Sign Out')).toBeTruthy();
        });

        test('shows confirmation alert on sign out button press', () => {
            const { getByText } = render(<ProfileScreen navigation={mockNavigation} />);

            fireEvent.press(getByText('Sign Out'));

            expect(Alert.alert).toHaveBeenCalledWith(
                'Sign Out',
                'Are you sure you want to sign out?',
                expect.arrayContaining([
                    expect.objectContaining({ text: 'Cancel' }),
                    expect.objectContaining({ text: 'Sign Out' }),
                ])
            );
        });

        test('handles successful sign out', async () => {
            const mockSignOut = jest.fn();
            (useAuthStore as unknown as jest.Mock).mockReturnValue({
                user: mockUser,
                isAuthenticated: true,
                setUser: jest.fn(),
                signOut: mockSignOut,
            });

            (signOutGoogle as jest.Mock).mockResolvedValue(undefined);

            const { getByText } = render(<ProfileScreen navigation={mockNavigation} />);

            fireEvent.press(getByText('Sign Out'));

            // Get the alert configuration and trigger the sign out action
            const alertCall = (Alert.alert as jest.Mock).mock.calls[0];
            const signOutButton = alertCall[2].find((btn: any) => btn.text === 'Sign Out');

            await signOutButton.onPress();

            await waitFor(() => {
                expect(signOutGoogle).toHaveBeenCalled();
                expect(mockSignOut).toHaveBeenCalled();
                expect(Alert.alert).toHaveBeenCalledWith(
                    'Signed Out',
                    'You have been signed out successfully.'
                );
            });
        });

        test('renders user without profile picture', () => {
            const userWithoutPicture = { ...mockUser, picture: undefined };
            (useAuthStore as unknown as jest.Mock).mockReturnValue({
                user: userWithoutPicture,
                isAuthenticated: true,
                setUser: jest.fn(),
                signOut: jest.fn(),
            });

            const { getByText } = render(<ProfileScreen navigation={mockNavigation} />);

            // Should still render user info even without picture
            expect(getByText(mockUser.name)).toBeTruthy();
            expect(getByText(mockUser.email)).toBeTruthy();
        });
    });
});
