const fs = require('fs');
const path = require('path');

const packageJsonPath = path.resolve(__dirname, '../package.json');
const appJsonPath = path.resolve(__dirname, '../app.json');
const constantsPath = path.resolve(__dirname, '../src/utils/constants.ts');

const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
const version = packageJson.version;

console.log(`Syncing version to ${version}...`);

// Update app.json
if (fs.existsSync(appJsonPath)) {
    const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));
    appJson.expo.version = version;
    fs.writeFileSync(appJsonPath, JSON.stringify(appJson, null, 2) + '\n');
    console.log(`Updated app.json to version ${version}`);
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

console.log('Version sync complete!');
