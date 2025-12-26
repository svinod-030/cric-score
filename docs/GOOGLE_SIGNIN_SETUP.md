# Google Sign-In Setup (Direct Redirect / No Proxy)

To avoid using Expo's `auth.expo.io` redirect service, you must use platform-specific Client IDs (Android/iOS) and your app's custom URL scheme.

## 1. Configure Custom Scheme
Ensure `app.json` has the scheme configured:
```json
{
  "expo": {
    "scheme": "cric-score",
    ...
  }
}
```

## 2. Google Cloud Console Setup

### A. For Android
1. Go to [Google Cloud Console](https://console.cloud.google.com/) > **Credentials**.
2. **Create Credentials** > **OAuth client ID** > **Android**.
3. **Package name**: `com.vinodsigadana.cricscore` (from `app.json`).
4. **SHA-1 certificate fingerprint**:
   - For debug:
     ```bash
     cd android && ./gradlew signingReport
     # OR if you don't have the android folder yet:
     keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
     ```
   - Copy the **Client ID** to `androidClientId` in `src/utils/constants.ts`.

### B. For iOS
1. **Create Credentials** > **OAuth client ID** > **iOS**.
2. **Bundle ID**: `com.vinodsigadana.cricscore`.
3. Copy the **Client ID** to `iosClientId` in `src/utils/constants.ts`.

## 3. Update Configuration
Update `src/utils/constants.ts` with your new IDs. Note that you don't need an `expoClientId` or a Redirect URI in the Google Console for these platform types—Google identifies the app by the package name/bundle ID and SHA-1.

## 4. Why no Redirect URI?
When using the "Android" or "iOS" client type in Google Console, Google uses the package name and certificate fingerprint (Android) or Bundle ID (iOS) to verify the request. The app then handles the redirect via its custom scheme (`cric-score://`).

## 5. Development Test
Since you are using Expo Go, you should still use the `expoClientId` (Web application type) if you want to test in the simulator easily, but for a "No Proxy" setup on a real device, building a **Development Client** is recommended.

```bash
npx expo run:android
```
