// Mock Firebase
jest.mock('firebase/app', () => ({
    initializeApp: jest.fn(() => ({})),
}));

jest.mock('firebase/auth', () => ({
    getAuth: jest.fn(),
    initializeAuth: jest.fn(() => ({})),
    getReactNativePersistence: jest.fn(() => ({})),
    GoogleAuthProvider: {
        credential: jest.fn(),
    },
    signInWithCredential: jest.fn(() => Promise.resolve({ user: { uid: 'mock-uid' } })),
    onAuthStateChanged: jest.fn(),
}));

jest.mock('firebase/firestore', () => ({
    getFirestore: jest.fn(),
    initializeFirestore: jest.fn(() => ({})),
    collection: jest.fn(),
    doc: jest.fn(),
    setDoc: jest.fn(),
    updateDoc: jest.fn(),
    onSnapshot: jest.fn(() => jest.fn()), // Returns unsubscribe mock
    getDoc: jest.fn(),
}));

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
    useColorScheme: jest.fn(() => ({
        colorScheme: 'light',
        setColorScheme: jest.fn(),
        toggleColorScheme: jest.fn(),
    })),
}));

// Mock nativewind
jest.mock('nativewind', () => ({
    useColorScheme: jest.fn(() => ({
        colorScheme: 'light',
        setColorScheme: jest.fn(),
        toggleColorScheme: jest.fn(),
    })),
}));

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => require('react-native-reanimated/mock'));

// Mock react-native-worklets
global._WORKLET_RUNTIME = { set: jest.fn(), get: jest.fn() };
jest.mock('react-native-worklets', () => ({
    Worklets: {
        createContext: jest.fn(),
    },
    createSerializable: jest.fn(v => v),
    isWorklet: jest.fn(() => false),
}));

// Mock react-i18next
const mockEn = require('./src/i18n/locales/en.json');
jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key, options) => {
            const parts = key.split('.');
            let val = mockEn;
            for (const part of parts) {
                if (val && val[part]) {
                    val = val[part];
                } else {
                    return key;
                }
            }
            if (typeof val === 'string' && options) {
                Object.keys(options).forEach(opt => {
                    val = val.replace(new RegExp(`{{${opt}}}`, 'g'), options[opt]);
                });
            }
            return val;
        },
        i18n: {
            changeLanguage: jest.fn(() => Promise.resolve()),
            language: 'en',
        },
    }),
    initReactI18next: {
        type: '3rdParty',
        init: jest.fn(),
    },
}));

// Mock react-native-share
jest.mock('react-native-share', () => ({
    default: {
        open: jest.fn(() => Promise.resolve({ success: true, message: 'Mocked share' })),
        shareSingle: jest.fn(() => Promise.resolve({ success: true, message: 'Mocked share single' })),
    },
}));

// Suppress console errors and warnings during tests
global.console = {
    ...console,
    error: jest.fn(),
    warn: jest.fn(),
};
