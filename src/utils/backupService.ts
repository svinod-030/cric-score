import AsyncStorage from '@react-native-async-storage/async-storage';

const BACKUP_FOLDER_NAME = 'Cric Score Backups';
const BACKUP_FILE_NAME = 'match_data_backup.json';

export const backupToDrive = async (accessToken: string) => {
    try {
        // 1. Get the data to backup
        const matchData = await AsyncStorage.getItem('match-storage');
        if (!matchData) {
            console.log('No match data found to backup');
            return false;
        }

        // 2. Find or Create Backup Folder
        let folderId = await findBackupFolder(accessToken);
        if (!folderId) {
            console.log('Creating backup folder');
            folderId = await createBackupFolder(accessToken);
        }

        if (!folderId) {
            throw new Error('Failed to create or find backup folder');
        }

        // 3. Find existing backup file in that folder
        const existingFileId = await findExistingBackupFile(accessToken, folderId);

        // 4. Upload/Update file
        if (existingFileId) {
            await updateBackupFile(accessToken, existingFileId, matchData);
        } else {
            await createBackupFile(accessToken, folderId, matchData);
        }

        console.log('Backup successful');
        return true;
    } catch (error) {
        console.error('Backup failed:', error);
        return false;
    }
};

const findBackupFolder = async (accessToken: string) => {
    const response = await fetch(
        `https://www.googleapis.com/drive/v3/files?q=name='${BACKUP_FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
        {
            headers: { Authorization: `Bearer ${accessToken}` },
        }
    );
    const data = await response.json();
    if (!response.ok) {
        console.error('findBackupFolder error:', data);
        return null;
    }
    return data.files && data.files.length > 0 ? data.files[0].id : null;
};

const createBackupFolder = async (accessToken: string) => {
    const response = await fetch('https://www.googleapis.com/drive/v3/files', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            name: BACKUP_FOLDER_NAME,
            mimeType: 'application/vnd.google-apps.folder',
        }),
    });
    const data = await response.json();
    if (!response.ok) {
        console.error('createBackupFolder error:', data);
        return null;
    }
    return data.id;
};

const findExistingBackupFile = async (accessToken: string, folderId: string) => {
    const response = await fetch(
        `https://www.googleapis.com/drive/v3/files?q=name='${BACKUP_FILE_NAME}' and '${folderId}' in parents and trashed=false`,
        {
            headers: { Authorization: `Bearer ${accessToken}` },
        }
    );
    const data = await response.json();
    return data.files && data.files.length > 0 ? data.files[0].id : null;
};

const createBackupFile = async (accessToken: string, folderId: string, data: string) => {
    // 1. Create file with metadata
    const response = await fetch('https://www.googleapis.com/drive/v3/files', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            name: BACKUP_FILE_NAME,
            parents: [folderId],
        }),
    });

    if (!response.ok) return false;
    const file = await response.json();

    // 2. Upload the data content
    return await updateBackupFile(accessToken, file.id, data);
};

const updateBackupFile = async (accessToken: string, fileId: string, data: string) => {
    const response = await fetch(
        `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`,
        {
            method: 'PATCH',
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: data,
        }
    );
    return response.ok;
};
