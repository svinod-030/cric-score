import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { GOOGLE_CONFIG } from './constants';

// Configure Google Sign-in
GoogleSignin.configure({
    webClientId: GOOGLE_CONFIG.webClientId,
    offlineAccess: true,
    scopes: ['https://www.googleapis.com/auth/drive.file'],
});

export const signInWithGoogle = async () => {
    try {
        await GoogleSignin.hasPlayServices();
        const userInfo = await GoogleSignin.signIn();

        // Extract what we need for our store
        if (userInfo.data?.user) {
            const { user } = userInfo.data;
            const tokens = await GoogleSignin.getTokens();

            return {
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name || '',
                    picture: user.photo || undefined,
                },
                accessToken: tokens.accessToken
            };
        }
        return null;
    } catch (error: any) {
        if (error.code === statusCodes.SIGN_IN_CANCELLED) {
            console.log('User cancelled the login flow');
        } else if (error.code === statusCodes.IN_PROGRESS) {
            console.log('Sign in is in progress already');
        } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
            console.log('Play services not available or outdated');
        } else {
            console.error('Some other error happened:', error);
        }
        throw error;
    }
};

export const signOutGoogle = async () => {
    try {
        await GoogleSignin.signOut();
    } catch (error) {
        console.error('Error signing out:', error);
    }
};

export const getCurrentUser = async () => {
    try {
        const userInfo = await GoogleSignin.getCurrentUser();
        return userInfo;
    } catch (error) {
        console.error('Error getting current user:', error);
        return null;
    }
};
