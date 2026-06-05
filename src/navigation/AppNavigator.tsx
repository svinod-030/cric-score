import React from 'react';
import { NavigationContainer, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MatchSetupScreen from '../screens/MatchSetupScreen';
import ScoreboardScreen from '../screens/ScoreboardScreen';
import MatchResultScreen from '../screens/MatchResultScreen';
import JoinLiveMatchScreen from '../screens/JoinLiveMatchScreen';
import LiveViewerScreen from '../screens/LiveViewerScreen';

import { Image, Text, View, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../store/useAuthStore';

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import MatchesHistoryScreen from '../screens/MatchesHistoryScreen';
import SettingsScreen from '../screens/SettingsScreen';
import LicensesScreen from '../screens/LicensesScreen';
import ProfileScreen from '../screens/ProfileScreen';

import LanguageSelectionModal from '../components/LanguageSelectionModal';
import { useSettingsStore } from '../store/useSettingsStore';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from 'nativewind';
import { useAppTheme } from '../hooks/useAppTheme';


const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const LogoTitle = React.memo(() => {
    const { isDark } = useAppTheme();
    return (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Image
                style={{ width: 40, height: 40, borderRadius: 20 }}
                source={require('../../assets/icon.png')}
                resizeMode="contain"
            />
            <Text style={{ color: isDark ? '#fff' : '#111827', fontWeight: 'bold', fontSize: 20 }}>Cric Score</Text>
        </View>
    );
});

const HeaderActions = React.memo(() => {
    const navigation = useNavigation<any>();
    const { user, isAuthenticated } = useAuthStore();
    const { setShowLanguageModal } = useSettingsStore();

    return (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 15, paddingRight: 10 }}>
            <TouchableOpacity onPress={() => setShowLanguageModal(true)} style={{ justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ color: '#A855F7', fontWeight: 'bold', fontSize: 16 }}>ಅ/A</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
                {isAuthenticated && user?.picture ? (
                    <Image
                        source={{ uri: user.picture }}
                        style={{ width: 32, height: 32, borderRadius: 16, borderWidth: 1.5, borderColor: '#3B82F6' }}
                    />
                ) : (
                    <Ionicons name="person-circle-outline" size={32} color="#9CA3AF" />
                )}
            </TouchableOpacity>
        </View>
    );
});

function HomeTabs() {
    const { t } = useTranslation();
    const { isDark } = useAppTheme();

    const tabBarBg = isDark ? '#1F2937' : '#F9FAFB';
    const tabBarBorder = isDark ? '#374151' : '#E5E7EB';
    const tabBarActive = '#3B82F6';
    const tabBarInactive = isDark ? '#9CA3AF' : '#6B7280';
    const headerBg = isDark ? '#111827' : '#FFFFFF';

    return (
        <SafeAreaView style={{ flex: 1 }} edges={['left', 'right']}>
            <View style={{ flex: 1, backgroundColor: tabBarBg }}>
                <Tab.Navigator
                    screenOptions={({ route }) => ({
                        headerShown: false,
                        tabBarStyle: {
                            backgroundColor: tabBarBg,
                            borderTopColor: tabBarBorder,
                            elevation: 0,
                            paddingTop: 5,
                        },
                        tabBarActiveTintColor: tabBarActive,
                        tabBarInactiveTintColor: tabBarInactive,
                        tabBarIcon: ({ focused, color, size }) => {
                            let iconName: any;

                            if (route.name === t('common.startMatch')) {
                                iconName = focused ? 'play-circle' : 'play-circle-outline';
                            } else if (route.name === t('common.liveTab')) {
                                iconName = focused ? 'radio' : 'radio-outline';
                            } else if (route.name === t('common.matches')) {
                                iconName = focused ? 'time' : 'time-outline';
                            } else if (route.name === t('common.settings')) {
                                iconName = focused ? 'settings' : 'settings-outline';
                            }

                            return <Ionicons name={iconName} size={size} color={color} />;
                        },
                    })}
                >
                    <Tab.Screen name={t('common.startMatch')} component={MatchSetupScreen} />
                    <Tab.Screen name={t('common.liveTab')} component={JoinLiveMatchScreen} />
                    <Tab.Screen name={t('common.matches')} component={MatchesHistoryScreen} />
                    <Tab.Screen name={t('common.settings')} component={SettingsScreen} />
                </Tab.Navigator>
            </View>
        </SafeAreaView>
    );
}

export default function AppNavigator() {
    const { t } = useTranslation();
    const { language, theme } = useSettingsStore();
    const { setColorScheme } = useColorScheme();
    const { isDark } = useAppTheme();

    const headerBg = isDark ? '#111827' : '#FFFFFF';
    const headerTint = isDark ? '#FFFFFF' : '#111827';

    React.useEffect(() => {
        if (language) {
            import('../i18n').then(i18n => {
                i18n.default.changeLanguage(language);
            });
        }
    }, [language]);

    React.useEffect(() => {
        if (theme === 'system') {
            setColorScheme('system');
        } else {
            setColorScheme(theme);
        }
    }, [theme]);

    const DEFAULT_STACK_OPTIONS = {
        headerStyle: {
            backgroundColor: headerBg,
        },
        headerTintColor: headerTint,
        headerTitleStyle: {
            fontWeight: 'bold' as const,
        },
        headerTitle: (props: any) => <LogoTitle {...props} />,
        headerRight: (props: any) => <HeaderActions {...props} />,
        contentStyle: { backgroundColor: headerBg }
    };

    const navTheme = isDark ? DarkTheme : {
        ...DefaultTheme,
        colors: {
            ...DefaultTheme.colors,
            background: '#F9FAFB',
            card: '#FFFFFF',
            text: '#111827',
            border: '#E5E7EB',
        },
    };

    return (
        <>
            <NavigationContainer theme={navTheme}>
                <Stack.Navigator
                    screenOptions={DEFAULT_STACK_OPTIONS}
                >
                    <Stack.Screen
                        name="HomeTabs"
                        component={HomeTabs}
                        options={{ title: '' }}
                    />
                    <Stack.Screen name="Scoreboard" component={ScoreboardScreen} options={{ title: t('common.scoreBoard') }} />
                    <Stack.Screen name="MatchResult" component={MatchResultScreen} options={{ title: t('common.matchResult') }} />
                    <Stack.Screen name="LiveViewer" component={LiveViewerScreen} options={{ title: t('common.liveMatch') || 'Live Match' }} />
                    <Stack.Screen name="Licenses" component={LicensesScreen} options={{ headerShown: false }} />
                    <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: t('common.profile') }} />
                </Stack.Navigator>
            </NavigationContainer>
            <LanguageSelectionModal />
        </>
    );
}
