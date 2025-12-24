# Google Play Store Deployment Guide

## Prerequisites

Before deploying, ensure you have:
- ✅ Google Play Developer Account ($25 one-time fee)
- ✅ Expo account (free)
- ✅ App tested and working
- ✅ All features complete

---

## Step 1: Install EAS CLI

```bash
npm install -g eas-cli
eas login
```

---

## Step 2: Configure EAS Build

### Initialize EAS
```bash
cd /Users/vinodsigadana/code/cric-score
eas build:configure
```

This creates `eas.json` with build profiles.

### Update app.json

Add required fields for Play Store:

```json
{
  "expo": {
    "name": "Cric Score",
    "slug": "cric-score",
    "version": "1.0.0",
    "android": {
      "package": "com.vinodsigadana.cricscore",
      "versionCode": 1,
      "permissions": [],
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      }
    }
  }
}
```

---

## Step 3: Create Production Build

### Build AAB (Android App Bundle)
```bash
eas build --platform android --profile production
```

This will:
1. Create a keystore (or use existing)
2. Build the app
3. Upload to Expo servers
4. Provide download link

**Important**: Save your keystore credentials! You'll need them for future updates.

### Download the AAB
Once build completes, download the `.aab` file from the provided link.

---

## Step 4: Prepare Store Assets

### Required Assets

#### 1. App Icon
- ✅ Already have: `assets/icon.png` (1024x1024)

#### 2. Feature Graphic
- **Size**: 1024 x 500 px
- **Format**: PNG or JPG
- **Content**: Promotional banner for your app

#### 3. Screenshots (Required)
- **Minimum**: 2 screenshots
- **Recommended**: 4-8 screenshots
- **Size**: 
  - Phone: 16:9 or 9:16 aspect ratio
  - Min: 320px
  - Max: 3840px

#### 4. Privacy Policy (Required)
- Must be hosted online (URL)
- Can use Google Sites, GitHub Pages, or your own website

---

## Step 5: Create Play Store Listing

### Go to Play Console
1. Visit [Google Play Console](https://play.google.com/console)
2. Click "Create app"
3. Fill in basic details:
   - **App name**: Cric Score
   - **Default language**: English (United States)
   - **App or game**: App
   - **Free or paid**: Free

### App Content

#### Store Listing
- **Short description** (80 chars max):
  ```
  Score cricket matches on the fly with detailed stats and match history
  ```

- **Full description** (4000 chars max):
  ```
  Cric Score is your ultimate cricket scoring companion. Whether you're playing 
  with friends or organizing a local tournament, keep track of every run, wicket, 
  and over with ease.

  KEY FEATURES:
  • Real-time scoring for cricket matches
  • Detailed player statistics (runs, balls, strike rate)
  • Bowling figures and economy rates
  • Match history with full scorecards
  • Customizable match rules (overs, extras, etc.)
  • Beautiful, intuitive interface
  • No ads, completely free

  Perfect for:
  - Backyard cricket
  - Local tournaments
  - Practice matches
  - Friendly games

  Download now and never lose track of your cricket stats again!
  ```

#### App Category
- **Category**: Sports
- **Tags**: Cricket, Sports, Scoring

#### Contact Details
- **Email**: cricscore.support@gmail.com
- **Privacy Policy**: [Your URL]

### Content Rating
Complete the questionnaire (select "No" for violence, mature content, etc.)

### Target Audience
- **Age group**: Everyone

---

## Step 6: Upload AAB

1. Go to **Production** → **Create new release**
2. Upload the `.aab` file you downloaded from EAS
3. Add release notes:
   ```
   Initial release of Cric Score
   - Cricket match scoring
   - Player statistics
   - Match history
   - Google Sign-In
   ```

---

## Step 7: Review & Publish

1. Complete all required sections (marked with red exclamation)
2. Review app content
3. Click **Send for review**

**Review time**: Usually 1-7 days

---

## Step 8: Get SHA-1 for Google OAuth

After first build, get your production SHA-1:

```bash
eas credentials
```

Select Android → Production → Keystore → View

Copy the SHA-1 fingerprint and add it to Google Cloud Console:
1. Go to Google Cloud Console
2. Create Android OAuth client
3. Add SHA-1 fingerprint
4. Copy Client ID to `GOOGLE_CONFIG.androidClientId`

---

## Future Updates

To release updates:

1. **Increment version** in `app.json`:
   ```json
   {
     "version": "1.0.1",
     "android": {
       "versionCode": 2
     }
   }
   ```

2. **Build new version**:
   ```bash
   eas build --platform android --profile production
   ```

3. **Upload to Play Console** → Production → Create new release

---

## Troubleshooting

### Build Fails
- Check `eas.json` configuration
- Ensure all dependencies are compatible
- Review build logs in Expo dashboard

### App Rejected
- Common reasons:
  - Missing privacy policy
  - Incomplete store listing
  - Content rating issues
- Fix issues and resubmit

### OAuth Not Working
- Verify SHA-1 fingerprint in Google Cloud Console
- Check package name matches `com.vinodsigadana.cricscore`
- Ensure Android OAuth client is created

---

## Useful Commands

```bash
# Check build status
eas build:list

# View credentials
eas credentials

# Submit to Play Store (alternative)
eas submit --platform android

# Check Expo account
eas whoami
```

---

## Next Steps After Approval

1. ✅ Monitor reviews and ratings
2. ✅ Respond to user feedback
3. ✅ Plan feature updates
4. ✅ Consider iOS deployment

Good luck with your launch! 🚀
