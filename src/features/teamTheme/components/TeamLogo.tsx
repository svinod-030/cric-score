import React from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { resolveTeamTheme, useMatchTheme } from '../MatchThemeContext';
import { TeamTheme } from '../teamTheme';

interface TeamLogoProps {
    teamName?: string;
    theme?: TeamTheme; // Use when the pair of themes is already known (e.g. a banner or list row)
    size?: number;
}

// Round team badge: the team's color with its logo icon.
export const TeamLogo = ({ teamName, theme, size = 40 }: TeamLogoProps) => {
    const ctx = useMatchTheme();
    const resolved = theme ?? resolveTeamTheme(ctx, teamName);

    return (
        <View
            testID="team-logo"
            style={{
                width: size,
                height: size,
                borderRadius: size / 2,
                backgroundColor: resolved.color,
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: Math.max(1.5, size / 20),
                borderColor: 'rgba(255,255,255,0.85)',
            }}
        >
            <Ionicons name={resolved.logo} size={size * 0.52} color="#FFFFFF" />
        </View>
    );
};
