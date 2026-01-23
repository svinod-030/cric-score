import AsyncStorage from '@react-native-async-storage/async-storage';
import { backupToDrive, restoreFromDrive } from '../backupService';
import { useAuthStore } from '../../store/useAuthStore';

// Mock dependencies
jest.mock('@react-native-async-storage/async-storage');
jest.mock('../googleAuth');
jest.mock('../../store/useAuthStore');

// Mock fetch globally
global.fetch = jest.fn();

describe('backupService', () => {
    beforeEach(() => {
        jest.clearAllMocks();

        // Setup default auth store mock
        (useAuthStore.getState as jest.Mock) = jest.fn(() => ({
            accessToken: 'mock-access-token',
            user: { id: '123', email: 'test@example.com', name: 'Test User' },
            setUser: jest.fn(),
        }));
    });

    describe('backupToDrive', () => {
        const mockMatchData = JSON.stringify({
            matches: [{ id: '1', teamA: 'Team A', teamB: 'Team B' }],
        });

        test('should successfully backup match data to Drive', async () => {
            // Mock AsyncStorage to return match data
            (AsyncStorage.getItem as jest.Mock).mockResolvedValue(mockMatchData);

            // Mock API responses
            (global.fetch as jest.Mock)
                // Find folder request
                .mockResolvedValueOnce({
                    ok: true,
                    json: async () => ({ files: [{ id: 'folder-123' }] }),
                    clone: () => ({ json: async () => ({ files: [{ id: 'folder-123' }] }) }),
                })
                // Find file request
                .mockResolvedValueOnce({
                    ok: true,
                    json: async () => ({ files: [{ id: 'file-456' }] }),
                    clone: () => ({ json: async () => ({ files: [{ id: 'file-456' }] }) }),
                })
                // Update file request
                .mockResolvedValueOnce({
                    ok: true,
                    clone: () => ({ json: async () => ({}), text: async () => '' }),
                });

            const result = await backupToDrive();

            expect(result).toBe(true);
            expect(AsyncStorage.getItem).toHaveBeenCalledWith('match-storage');
            expect(global.fetch).toHaveBeenCalledTimes(3);
        });

        test('should create folder if it does not exist', async () => {
            (AsyncStorage.getItem as jest.Mock).mockResolvedValue(mockMatchData);

            (global.fetch as jest.Mock)
                // Find folder request (not found)
                .mockResolvedValueOnce({
                    ok: true,
                    json: async () => ({ files: [] }),
                    clone: () => ({ json: async () => ({ files: [] }) }),
                })
                // Create folder request
                .mockResolvedValueOnce({
                    ok: true,
                    json: async () => ({ id: 'new-folder-123' }),
                    clone: () => ({ json: async () => ({ id: 'new-folder-123' }) }),
                })
                // Find file request
                .mockResolvedValueOnce({
                    ok: true,
                    json: async () => ({ files: [] }),
                    clone: () => ({ json: async () => ({ files: [] }) }),
                })
                // Create file metadata request
                .mockResolvedValueOnce({
                    ok: true,
                    json: async () => ({ id: 'new-file-456' }),
                    clone: () => ({ json: async () => ({ id: 'new-file-456' }) }),
                })
                // Update file content request
                .mockResolvedValueOnce({
                    ok: true,
                    clone: () => ({ json: async () => ({}), text: async () => '' }),
                });

            const result = await backupToDrive();

            expect(result).toBe(true);
            expect(global.fetch).toHaveBeenCalledTimes(5);
        });

        test('should return false when no match data exists', async () => {
            (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

            const result = await backupToDrive();

            expect(result).toBe(false);
            expect(global.fetch).not.toHaveBeenCalled();
        });

        test('should handle API errors gracefully', async () => {
            (AsyncStorage.getItem as jest.Mock).mockResolvedValue(mockMatchData);

            (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

            const result = await backupToDrive();

            expect(result).toBe(false);
        });

        test('should handle failed folder creation', async () => {
            (AsyncStorage.getItem as jest.Mock).mockResolvedValue(mockMatchData);

            (global.fetch as jest.Mock)
                // Find folder request (not found)
                .mockResolvedValueOnce({
                    ok: true,
                    json: async () => ({ files: [] }),
                    clone: () => ({ json: async () => ({ files: [] }) }),
                })
                // Create folder request (fails)
                .mockResolvedValueOnce({
                    ok: false,
                    status: 403,
                    clone: () => ({ json: async () => ({ error: 'Permission denied' }), text: async () => 'Permission denied' }),
                });

            const result = await backupToDrive();

            expect(result).toBe(false);
        });
    });

    describe('restoreFromDrive', () => {
        test('should successfully restore match data from Drive', async () => {
            const mockRestoredData = JSON.stringify({
                matches: [{ id: '2', teamA: 'India', teamB: 'Australia' }],
            });

            (global.fetch as jest.Mock)
                // Find folder request
                .mockResolvedValueOnce({
                    ok: true,
                    json: async () => ({ files: [{ id: 'folder-123' }] }),
                    clone: () => ({ json: async () => ({ files: [{ id: 'folder-123' }] }) }),
                })
                // Find file request
                .mockResolvedValueOnce({
                    ok: true,
                    json: async () => ({ files: [{ id: 'file-456' }] }),
                    clone: () => ({ json: async () => ({ files: [{ id: 'file-456' }] }) }),
                })
                // Download file request
                .mockResolvedValueOnce({
                    ok: true,
                    text: async () => mockRestoredData,
                    clone: () => ({ text: async () => mockRestoredData }),
                });

            const result = await restoreFromDrive();

            expect(result).toBe(mockRestoredData);
            expect(global.fetch).toHaveBeenCalledTimes(3);
        });

        test('should return null when backup folder does not exist', async () => {
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: async () => ({ files: [] }),
                clone: () => ({ json: async () => ({ files: [] }) }),
            });

            const result = await restoreFromDrive();

            expect(result).toBeNull();
        });

        test('should return null when backup file does not exist', async () => {
            (global.fetch as jest.Mock)
                // Find folder request
                .mockResolvedValueOnce({
                    ok: true,
                    json: async () => ({ files: [{ id: 'folder-123' }] }),
                    clone: () => ({ json: async () => ({ files: [{ id: 'folder-123' }] }) }),
                })
                // Find file request (not found)
                .mockResolvedValueOnce({
                    ok: true,
                    json: async () => ({ files: [] }),
                    clone: () => ({ json: async () => ({ files: [] }) }),
                });

            const result = await restoreFromDrive();

            expect(result).toBeNull();
        });

        test('should handle download errors gracefully', async () => {
            (global.fetch as jest.Mock)
                // Find folder request
                .mockResolvedValueOnce({
                    ok: true,
                    json: async () => ({ files: [{ id: 'folder-123' }] }),
                    clone: () => ({ json: async () => ({ files: [{ id: 'folder-123' }] }) }),
                })
                // Find file request
                .mockResolvedValueOnce({
                    ok: true,
                    json: async () => ({ files: [{ id: 'file-456' }] }),
                    clone: () => ({ json: async () => ({ files: [{ id: 'file-456' }] }) }),
                })
                // Download file request (fails)
                .mockResolvedValueOnce({
                    ok: false,
                    status: 500,
                    clone: () => ({ text: async () => 'Server error' }),
                });

            const result = await restoreFromDrive();

            expect(result).toBeNull();
        });

        test('should handle network errors gracefully', async () => {
            (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

            const result = await restoreFromDrive();

            expect(result).toBeNull();
        });
    });
});
