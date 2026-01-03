App Access Instructions for Google Play Review

Access Type:
[X] All or some functionality is restricted

Instructions for Reviewers:

1. Authentication Method:
   - The app uses Google Sign-In for authentication.
   - Credentials: You can use ANY valid Google Account to sign in. The app does not require pre-registration of accounts on a backend.
   - Note: If a specific test account is mandated by your internal policy, please feel free to use it; it will work seamlessly.

2. Required Permissions:
   - Upon signing in, the app will request permission to access Google Drive (https://www.googleapis.com/auth/drive.appdata).
   - Action Required: Please GRANT/ALLOW this permission.
   - Reason: This is strictly required for the app's Backup & Restore feature, which saves match data to a hidden folder in the user's Google Drive. Without this, the app cannot function fully.

3. Navigation Steps to Test Restricted Features:

   A. Starting a Match (Core Functionality)
   1. Launch the app and Sign In.
   2. On the Home Screen, tap "New Match".
   3. Enter Team Names (e.g., Team A vs Team B) and Player Names.
   4. Complete the Toss and tap "Start Match".
   5. You will land on the Scoring Screen.

   B. Testing Backup (Cloud Storage)
   1. Complete a match (or end it early).
   2. The app automatically attempts to backup the data to Google Drive.
   3. You can also manually verify this by going to Settings (if available) or checking the logs if in debug mode.

   C. Testing Restore
   1. Go to the Matches tab (bottom navigation).
   2. Tap the "Restore" button (top right or menu).
   3. The app will list backup files found in the signed-in account's Drive App Folder.
   4. Select a file to restore it.

Support Contact:
If you encounter any issues accessing the app, please contact: scricscore3@gmail.com
