import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { signInWithGoogle, signOutGoogle, getFreshAccessToken, getCurrentUser } from '../googleAuth';

// Mock the GoogleSignin module
jest.mock('@react-native-google-signin/google-signin', () => ({
    GoogleSignin: {
        configure: jest.fn(),
        hasPlayServices: jest.fn(),
        signIn: jest.fn(),
        signInSilently: jest.fn(),
        signOut: jest.fn(),
        getTokens: jest.fn(),
        getCurrentUser: jest.fn(),
    },
    statusCodes: {
        SIGN_IN_CANCELLED: 'SIGN_IN_CANCELLED',
        IN_PROGRESS: 'IN_PROGRESS',
        PLAY_SERVICES_NOT_AVAILABLE: 'PLAY_SERVICES_NOT_AVAILABLE',
    },
}));

describe('googleAuth', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getFreshAccessToken', () => {
        test('should return access token when available', async () => {
            const mockAccessToken = 'mock-access-token-123';
            (GoogleSignin.getTokens as jest.Mock).mockResolvedValue({
                accessToken: mockAccessToken,
            });

            const token = await getFreshAccessToken();

            expect(token).toBe(mockAccessToken);
            expect(GoogleSignin.getTokens).toHaveBeenCalledTimes(1);
        });

        test('should sign in silently when no access token found', async () => {
            const mockAccessToken = 'refreshed-access-token-456';

            // First call returns no token
            (GoogleSignin.getTokens as jest.Mock).mockResolvedValueOnce({
                accessToken: null,
            });

            // Mock silent sign-in
            (GoogleSignin.signInSilently as jest.Mock).mockResolvedValue({
                data: {
                    user: { id: '123', email: 'test@example.com', name: 'Test User' },
                },
            });

            // Second call after silent sign-in returns new token
            (GoogleSignin.getTokens as jest.Mock).mockResolvedValueOnce({
                accessToken: mockAccessToken,
            });

            const token = await getFreshAccessToken();

            expect(token).toBe(mockAccessToken);
            expect(GoogleSignin.signInSilently).toHaveBeenCalledTimes(1);
            expect(GoogleSignin.getTokens).toHaveBeenCalledTimes(2);
        });

        test('should handle errors and return null', async () => {
            (GoogleSignin.getTokens as jest.Mock).mockRejectedValue(new Error('Token error'));
            (GoogleSignin.signInSilently as jest.Mock).mockRejectedValue(new Error('Silent sign-in failed'));

            const token = await getFreshAccessToken();

            expect(token).toBeNull();
        });

        test('should retry with silent sign-in on error', async () => {
            const mockAccessToken = 'new-access-token-789';

            // First getTokens call fails
            (GoogleSignin.getTokens as jest.Mock).mockRejectedValueOnce(new Error('Token expired'));

            // Silent sign-in succeeds
            (GoogleSignin.signInSilently as jest.Mock).mockResolvedValue({
                data: {
                    user: { id: '123', email: 'test@example.com' },
                },
            });

            // Second getTokens call returns new token
            (GoogleSignin.getTokens as jest.Mock).mockResolvedValueOnce({
                accessToken: mockAccessToken,
            });

            const token = await getFreshAccessToken();

            expect(token).toBe(mockAccessToken);
        });
    });

    describe('signInWithGoogle', () => {
        const mockUser = {
            id: 'user-123',
            email: 'test@example.com',
            name: 'Test User',
            photo: 'https://example.com/photo.jpg',
        };

        const mockAccessToken = 'access-token-abc';

        test('should successfully sign in and return user data', async () => {
            (GoogleSignin.hasPlayServices as jest.Mock).mockResolvedValue(true);
            (GoogleSignin.signIn as jest.Mock).mockResolvedValue({
                data: { user: mockUser },
            });
            (GoogleSignin.getTokens as jest.Mock).mockResolvedValue({
                accessToken: mockAccessToken,
            });

            const result = await signInWithGoogle();

            expect(result).toEqual({
                user: {
                    id: mockUser.id,
                    email: mockUser.email,
                    name: mockUser.name,
                    picture: mockUser.photo,
                },
                accessToken: mockAccessToken,
            });
            expect(GoogleSignin.hasPlayServices).toHaveBeenCalled();
            expect(GoogleSignin.signIn).toHaveBeenCalled();
        });

        test('should handle user with no name gracefully', async () => {
            const userWithoutName = { ...mockUser, name: null };

            (GoogleSignin.hasPlayServices as jest.Mock).mockResolvedValue(true);
            (GoogleSignin.signIn as jest.Mock).mockResolvedValue({
                data: { user: userWithoutName },
            });
            (GoogleSignin.getTokens as jest.Mock).mockResolvedValue({
                accessToken: mockAccessToken,
            });

            const result = await signInWithGoogle();

            expect(result?.user.name).toBe('');
        });

        test('should return null when no user data returned', async () => {
            (GoogleSignin.hasPlayServices as jest.Mock).mockResolvedValue(true);
            (GoogleSignin.signIn as jest.Mock).mockResolvedValue({
                data: null,
            });

            const result = await signInWithGoogle();

            expect(result).toBeNull();
        });

        test('should handle sign-in cancellation', async () => {
            (GoogleSignin.hasPlayServices as jest.Mock).mockResolvedValue(true);
            (GoogleSignin.signIn as jest.Mock).mockRejectedValue({
                code: statusCodes.SIGN_IN_CANCELLED,
            });

            await expect(signInWithGoogle()).rejects.toMatchObject({
                code: statusCodes.SIGN_IN_CANCELLED,
            });
        });

        test('should handle sign-in in progress error', async () => {
            (GoogleSignin.hasPlayServices as jest.Mock).mockResolvedValue(true);
            (GoogleSignin.signIn as jest.Mock).mockRejectedValue({
                code: statusCodes.IN_PROGRESS,
            });

            await expect(signInWithGoogle()).rejects.toMatchObject({
                code: statusCodes.IN_PROGRESS,
            });
        });

        test('should handle Play Services not available', async () => {
            (GoogleSignin.hasPlayServices as jest.Mock).mockResolvedValue(true);
            (GoogleSignin.signIn as jest.Mock).mockRejectedValue({
                code: statusCodes.PLAY_SERVICES_NOT_AVAILABLE,
            });

            await expect(signInWithGoogle()).rejects.toMatchObject({
                code: statusCodes.PLAY_SERVICES_NOT_AVAILABLE,
            });
        });

        test('should handle generic errors', async () => {
            (GoogleSignin.hasPlayServices as jest.Mock).mockResolvedValue(true);
            (GoogleSignin.signIn as jest.Mock).mockRejectedValue(new Error('Unknown error'));

            await expect(signInWithGoogle()).rejects.toThrow('Unknown error');
        });
    });

    describe('signOutGoogle', () => {
        test('should successfully sign out', async () => {
            (GoogleSignin.signOut as jest.Mock).mockResolvedValue(undefined);

            await signOutGoogle();

            expect(GoogleSignin.signOut).toHaveBeenCalledTimes(1);
        });

        test('should handle sign-out errors gracefully', async () => {
            (GoogleSignin.signOut as jest.Mock).mockRejectedValue(new Error('Sign out failed'));

            // Should not throw
            await expect(signOutGoogle()).resolves.toBeUndefined();
        });
    });

    describe('getCurrentUser', () => {
        test('should return current user info', async () => {
            const mockUserInfo = {
                user: {
                    id: 'user-123',
                    email: 'test@example.com',
                    name: 'Test User',
                },
            };

            (GoogleSignin.getCurrentUser as jest.Mock).mockResolvedValue(mockUserInfo);

            const result = await getCurrentUser();

            expect(result).toEqual(mockUserInfo);
            expect(GoogleSignin.getCurrentUser).toHaveBeenCalledTimes(1);
        });

        test('should return null when no user is signed in', async () => {
            (GoogleSignin.getCurrentUser as jest.Mock).mockResolvedValue(null);

            const result = await getCurrentUser();

            expect(result).toBeNull();
        });

        test('should handle errors and return null', async () => {
            (GoogleSignin.getCurrentUser as jest.Mock).mockRejectedValue(new Error('Failed to get user'));

            const result = await getCurrentUser();

            expect(result).toBeNull();
        });
    });
});
