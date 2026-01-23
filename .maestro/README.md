# Maestro E2E Tests

This directory contains Maestro E2E test flows for the cricket scoring app.

## Prerequisites

Install Maestro CLI:
```bash
curl -Ls "https://get.maestro.mobile.dev" | bash
```

## Running Tests

### Android
Start your Android emulator or connect a device, then run:
```bash
# Run all tests
maestro test .maestro

# Run specific test
maestro test .maestro/smoke_test.yaml
maestro test .maestro/match_flow.yaml
```

### iOS
Start your iOS simulator, then run:
```bash
maestro test .maestro
```

## Test Flows

- **smoke_test.yaml**: Basic smoke test to verify app launches
- **match_flow.yaml**: Complete match flow including setup and scoring

## Notes

- Make sure your app is built and deployed to the emulator/simulator before running tests
- Use `npm run android` or `npm run ios` to start the development build
- Maestro automatically handles waiting for UI elements to appear
