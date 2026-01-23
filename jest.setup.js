// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
    __esModule: true,
    default: {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn(),
    },
}));

// Mock Expo modules
jest.mock('expo-asset', () => ({
    Asset: {
        fromModule: jest.fn(() => ({ uri: 'mocked-asset' })),
        loadAsync: jest.fn(),
    },
}));

jest.mock('expo-font', () => ({
    loadAsync: jest.fn(),
    isLoaded: jest.fn(() => true),
}));

// Mock @expo/vector-icons
jest.mock('@expo/vector-icons', () => ({
    Ionicons: 'Ionicons',
    MaterialIcons: 'MaterialIcons',
    FontAwesome: 'FontAwesome',
    AntDesign: 'AntDesign',
    Entypo: 'Entypo',
}));

// Mock react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => {
    const SafeAreaView = Object.assign(jest.fn(({ children }) => children), { displayName: 'SafeAreaView' });
    const SafeAreaProvider = Object.assign(jest.fn(({ children }) => children), { displayName: 'SafeAreaProvider' });
    const useSafeAreaInsets = () => ({ top: 0, right: 0, bottom: 0, left: 0 });

    return {
        __esModule: true,
        default: {
            SafeAreaView,
            SafeAreaProvider,
            useSafeAreaInsets,
        },
        SafeAreaView,
        SafeAreaProvider,
        useSafeAreaInsets,
    };
});

// Mock @react-native-google-signin/google-signin
jest.mock('@react-native-google-signin/google-signin', () => ({
    GoogleSignin: {
        configure: jest.fn(),
        hasPlayServices: jest.fn(() => Promise.resolve(true)),
        signIn: jest.fn(),
        signInSilently: jest.fn(),
        signOut: jest.fn(),
        getTokens: jest.fn(() => Promise.resolve({ accessToken: 'mock-token' })),
        getCurrentUser: jest.fn(),
    },
    statusCodes: {
        SIGN_IN_CANCELLED: 'SIGN_IN_CANCELLED',
        IN_PROGRESS: 'IN_PROGRESS',
        PLAY_SERVICES_NOT_AVAILABLE: 'PLAY_SERVICES_NOT_AVAILABLE',
    },
}));

// Mock react-native-css-interop to avoid runtime crashes
jest.mock('react-native-css-interop', () => ({
    cssInterop: jest.fn(),
    remapProps: jest.fn(),
}));

// Suppress console errors and warnings during tests
global.console = {
    ...console,
    error: jest.fn(),
    warn: jest.fn(),
};
