import { checkVersion } from '../versionCheckService';
import VersionCheck from 'react-native-version-check-expo';

jest.mock('react-native-version-check-expo', () => ({
    getCurrentVersion: jest.fn(),
    getLatestVersion: jest.fn(),
    needUpdate: jest.fn(),
}));

jest.mock('../constants', () => ({
    APP_CONFIG: {
        ANDROID_PACKAGE_NAME: 'com.test',
        IOS_APP_ID: '123',
        STORE_URL_ANDROID: 'https://play.google.com',
        STORE_URL_IOS: 'https://apple.com',
        APP_VERSION: '1.0.0',
    }
}));

describe('versionCheckService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('returns true when an update is available', async () => {
        (VersionCheck.getCurrentVersion as jest.Mock).mockReturnValue('1.0.0');
        (VersionCheck.getLatestVersion as jest.Mock).mockResolvedValue('1.1.0');
        (VersionCheck.needUpdate as jest.Mock).mockResolvedValue({ isNeeded: true });

        const result = await checkVersion();

        expect(result.isUpdateAvailable).toBe(true);
        expect(result.latestVersion).toBe('1.1.0');
        expect(result.currentVersion).toBe('1.0.0');
    });

    it('returns false when no update is available', async () => {
        (VersionCheck.getCurrentVersion as jest.Mock).mockReturnValue('1.1.0');
        (VersionCheck.getLatestVersion as jest.Mock).mockResolvedValue('1.1.0');
        (VersionCheck.needUpdate as jest.Mock).mockResolvedValue({ isNeeded: false });

        const result = await checkVersion();

        expect(result.isUpdateAvailable).toBe(false);
    });

    it('handles errors gracefully', async () => {
        (VersionCheck.getCurrentVersion as jest.Mock).mockReturnValue('1.0.0');
        (VersionCheck.getLatestVersion as jest.Mock).mockRejectedValue(new Error('Network error'));

        const result = await checkVersion();

        expect(result.isUpdateAvailable).toBe(false);
    });
});
