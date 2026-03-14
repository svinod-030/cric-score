const fs = require('fs');
const path = require('path');

const packageJsonPath = path.resolve(__dirname, '../package.json');
const appJsonPath = path.resolve(__dirname, '../app.json');
const constantsPath = path.resolve(__dirname, '../src/utils/constants.ts');
const buildGradlePath = path.resolve(__dirname, '../android/app/build.gradle');

const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
const version = packageJson.version;

console.log(`Syncing version to ${version}...`);

let versionCode = null;

// Update app.json
if (fs.existsSync(appJsonPath)) {
    const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));
    
    // Auto-bump versionCode
    if (appJson.expo.android && typeof appJson.expo.android.versionCode === 'number') {
        appJson.expo.android.versionCode += 1;
        versionCode = appJson.expo.android.versionCode;
        console.log(`Bumping versionCode from ${versionCode - 1} to ${versionCode} in app.json`);
    } else if (appJson.expo.android) {
        appJson.expo.android.versionCode = 1;
        versionCode = 1;
    }

    appJson.expo.version = version;
    fs.writeFileSync(appJsonPath, JSON.stringify(appJson, null, 2) + '\n');
    console.log(`Updated app.json: version=${version}, versionCode=${versionCode}`);
}

// Update src/utils/constants.ts
if (fs.existsSync(constantsPath)) {
    let constantsContent = fs.readFileSync(constantsPath, 'utf8');
    constantsContent = constantsContent.replace(
        /APP_VERSION:\s*['"][^'"]*['"]/,
        `APP_VERSION: '${version}'`
    );
    fs.writeFileSync(constantsPath, constantsContent);
    console.log(`Updated src/utils/constants.ts to version ${version}`);
}

// Update android/app/build.gradle
if (fs.existsSync(buildGradlePath)) {
    let gradleContent = fs.readFileSync(buildGradlePath, 'utf8');
    
    // Sync versionName
    gradleContent = gradleContent.replace(
        /versionName\s+["'][^"']*["']/,
        `versionName "${version}"`
    );
    
    // Sync versionCode
    if (versionCode !== null) {
        gradleContent = gradleContent.replace(
            /versionCode\s+\d+/,
            `versionCode ${versionCode}`
        );
    }
    
    fs.writeFileSync(buildGradlePath, gradleContent);
    console.log(`Updated android/app/build.gradle: versionName=${version}, versionCode=${versionCode}`);
}

console.log('Advanced version sync complete!');
