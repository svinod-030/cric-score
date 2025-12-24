# Getting SHA-1 Fingerprint for Google OAuth

## For Expo Development (Expo Go)

When using **Expo Go** for development, you don't need to provide a SHA-1 fingerprint. Instead:

1. Use the **Web Client ID** in your Google Cloud Console
2. The redirect URI should be: `https://auth.expo.io/@YOUR_EXPO_USERNAME/cric-score`

## For Production Build (EAS Build)

If you're building a standalone APK/AAB with EAS Build:

### Option 1: Let EAS Generate the Keystore
```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Build for Android
eas build --platform android

# Get the SHA-1 fingerprint
eas credentials
```

### Option 2: Use Your Own Keystore

If you already have a keystore, get the SHA-1:

```bash
keytool -list -v -keystore /path/to/your/keystore.jks -alias your-key-alias
```

## For Local Development Build

If you're using `npx expo run:android` (development build):

```bash
# The debug keystore is usually at:
# macOS/Linux: ~/.android/debug.keystore
# Windows: C:\Users\YOUR_USERNAME\.android\debug.keystore

# Get SHA-1 from debug keystore:
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
```

If the debug keystore doesn't exist, it will be created automatically when you run:
```bash
npx expo run:android
```

## Current Recommendation

Since you're using Expo, the **easiest approach** is:

1. **For Development**: Use Expo Go with Web Client ID (no SHA-1 needed)
2. **For Production**: Use EAS Build which handles keystore management

### Quick Setup for Expo Go:

1. In Google Cloud Console, create a **Web application** OAuth client
2. Set redirect URI to: `https://auth.expo.io/@YOUR_EXPO_USERNAME/cric-score`
3. Use that Client ID in your `GOOGLE_CONFIG.expoClientId`

You can find your Expo username by running:
```bash
npx expo whoami
```
