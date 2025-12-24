# Google Sign-In Setup Instructions

## ⚠️ Important: OAuth Configuration Required

To enable Google Sign-In, you need to configure OAuth credentials in Google Cloud Console.

## Steps:

### 1. Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Google+ API** (or **Google Identity Services**)

### 2. Create OAuth 2.0 Credentials

#### For Expo Development
1. Go to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **OAuth client ID**
3. Select **Web application**
4. Add authorized redirect URI:
   ```
   https://auth.expo.io/@YOUR_EXPO_USERNAME/cric-score
   ```
5. Copy the **Client ID** → This is your `expoClientId`

#### For Android
1. Create another OAuth client ID
2. Select **Android**
3. Package name: `com.vinodsigadana.cricscore`
4. Get SHA-1 certificate fingerprint:
   ```bash
   cd android && ./gradlew signingReport
   ```
5. Copy the **Client ID** → This is your `androidClientId`

#### For iOS
1. Create another OAuth client ID
2. Select **iOS**
3. Bundle ID: `com.vinodsigadana.cricscore`
4. Copy the **Client ID** → This is your `iosClientId`

### 3. Update Configuration

Edit `src/utils/googleAuth.ts` and replace the placeholder values:

```typescript
export const GOOGLE_CONFIG = {
    expoClientId: 'YOUR_ACTUAL_EXPO_CLIENT_ID.apps.googleusercontent.com',
    iosClientId: 'YOUR_ACTUAL_IOS_CLIENT_ID.apps.googleusercontent.com',
    androidClientId: 'YOUR_ACTUAL_ANDROID_CLIENT_ID.apps.googleusercontent.com',
    webClientId: 'YOUR_ACTUAL_WEB_CLIENT_ID.apps.googleusercontent.com',
};
```

### 4. Test the Integration

1. Restart the Expo dev server:
   ```bash
   npx expo start -c
   ```
2. Click the profile icon in the header
3. Click "Sign in with Google"
4. Complete the OAuth flow

## Notes:
- For Expo Go testing, use the `expoClientId`
- For production builds, you'll need all platform-specific client IDs
- The redirect URI must match exactly what's configured in Google Cloud Console

## Current Status:
✅ Code implementation complete
⚠️ OAuth credentials need to be configured
