import { renderHook, act } from '@testing-library/react-native';
import { useAuthStore } from '../useAuthStore';

describe('useAuthStore', () => {
    beforeEach(() => {
        // Reset the store before each test
        const { result } = renderHook(() => useAuthStore());
        act(() => {
            result.current.signOut();
        });
    });

    test('initializes with default state', () => {
        const { result } = renderHook(() => useAuthStore());

        expect(result.current.user).toBeNull();
        expect(result.current.accessToken).toBeNull();
        expect(result.current.isAuthenticated).toBe(false);
        expect(result.current.isLoading).toBe(false);
    });

    test('setUser updates user and authentication status', () => {
        const { result } = renderHook(() => useAuthStore());

        const mockUser = {
            id: '123',
            email: 'test@example.com',
            name: 'Test User',
            picture: 'https://example.com/photo.jpg',
        };
        const mockToken = 'mock-access-token';

        act(() => {
            result.current.setUser(mockUser, mockToken);
        });

        expect(result.current.user).toEqual(mockUser);
        expect(result.current.accessToken).toBe(mockToken);
        expect(result.current.isAuthenticated).toBe(true);
    });

    test('setUser with null user sets isAuthenticated to false', () => {
        const { result } = renderHook(() => useAuthStore());

        // First set a user
        const mockUser = {
            id: '123',
            email: 'test@example.com',
            name: 'Test User',
        };

        act(() => {
            result.current.setUser(mockUser, 'token');
        });

        // Then clear the user
        act(() => {
            result.current.setUser(null, null);
        });

        expect(result.current.user).toBeNull();
        expect(result.current.accessToken).toBeNull();
        expect(result.current.isAuthenticated).toBe(false);
    });

    test('signOut clears user data', () => {
        const { result } = renderHook(() => useAuthStore());

        // Set a user first
        const mockUser = {
            id: '123',
            email: 'test@example.com',
            name: 'Test User',
        };

        act(() => {
            result.current.setUser(mockUser, 'token');
        });

        // Then sign out
        act(() => {
            result.current.signOut();
        });

        expect(result.current.user).toBeNull();
        expect(result.current.accessToken).toBeNull();
        expect(result.current.isAuthenticated).toBe(false);
    });

    test('handles user without picture', () => {
        const { result } = renderHook(() => useAuthStore());

        const mockUser = {
            id: '123',
            email: 'test@example.com',
            name: 'Test User',
            // No picture property
        };

        act(() => {
            result.current.setUser(mockUser, 'token');
        });

        expect(result.current.user).toEqual(mockUser);
        expect(result.current.user?.picture).toBeUndefined();
    });
});
