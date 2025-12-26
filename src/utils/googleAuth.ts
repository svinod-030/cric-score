import React, { useEffect } from 'react';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import { GOOGLE_CONFIG } from './constants';
import { Platform } from 'react-native';

WebBrowser.maybeCompleteAuthSession();

export const useGoogleAuth = () => {
    const [request, response, promptAsync] = Google.useAuthRequest({
        clientId: GOOGLE_CONFIG.webClientId,
        androidClientId: GOOGLE_CONFIG.androidClientId,
        iosClientId: GOOGLE_CONFIG.iosClientId,
        redirectUri: AuthSession.makeRedirectUri({
            scheme: 'cric-score',
            path: 'oauth2redirect',
        }),
        scopes: ['openid', 'profile', 'email', 'https://www.googleapis.com/auth/drive.file'],
    });

    useEffect(() => {
        if (request) {
            console.log('--- Google Auth Request ---');
            console.log('Platform:', Platform.OS);
            console.log('Redirect URI:', request.redirectUri);
            console.log('Client ID:', request.clientId);
        }
    }, [request]);

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
