import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';
import { useAuthStore } from '../store/useAuthStore';
import { backupToDrive } from './backupService';

const BACKUP_TASK_NAME = 'background-daily-backup';

// Define the task
TaskManager.defineTask(BACKUP_TASK_NAME, async () => {
    try {
        const { isAuthenticated, accessToken } = useAuthStore.getState();

        if (isAuthenticated && accessToken) {
            console.log('[Background Task] Starting backup...');
            const success = await backupToDrive(accessToken);
            return success ? BackgroundFetch.BackgroundFetchResult.NewData : BackgroundFetch.BackgroundFetchResult.NoData;
        }

        console.log('[Background Task] User not authenticated, skipping backup');
        return BackgroundFetch.BackgroundFetchResult.NoData;
    } catch (error) {
        console.error('[Background Task] Error:', error);
        return BackgroundFetch.BackgroundFetchResult.Failed;
    }
});

// Register the task
export const registerBackupTask = async () => {
    try {
        await BackgroundFetch.registerTaskAsync(BACKUP_TASK_NAME, {
            minimumInterval: 60 * 60 * 24, // 24 hours in seconds
            stopOnTerminate: false, // Continue even if app is terminated
            startOnBoot: true, // Start after device reboot
        });
        console.log('[Background Task] Registered successfully');
    } catch (err) {
        console.log('[Background Task] Registration failed:', err);
    }
};
