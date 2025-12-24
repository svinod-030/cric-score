import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { GOOGLE_CONFIG } from './constants';

WebBrowser.maybeCompleteAuthSession();

export const useGoogleAuth = () => {
    const [request, response, promptAsync] = Google.useAuthRequest({
        clientId: GOOGLE_CONFIG.expoClientId,
        iosClientId: GOOGLE_CONFIG.iosClientId,
        androidClientId: GOOGLE_CONFIG.androidClientId,
        webClientId: GOOGLE_CONFIG.webClientId,
    });

    return { request, response, promptAsync };
};

export const getUserInfo = async (accessToken: string) => {
    try {
        const response = await fetch('https://www.googleapis.com/userinfo/v2/me', {
            headers: { Authorization: `Bearer ${accessToken}` },
        });
        const user = await response.json();
        return {
            id: user.id,
            email: user.email,
            name: user.name,
            picture: user.picture,
        };
    } catch (error) {
        console.error('Error fetching user info:', error);
        return null;
    }
};
