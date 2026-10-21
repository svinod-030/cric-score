import React from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { resolvePlayerTheme, resolveTeamTheme, useMatchTheme } from '../MatchThemeContext';
import { getPlayerColor, NEUTRAL_COLOR } from '../teamTheme';

interface PlayerAvatarProps {
    playerId?: string; // Match-local id (A1, B3...). Gives the team when inside a MatchThemeProvider.
    teamName?: string; // Alternative to playerId, e.g. for series awards that are keyed by name
    seed?: string; // What varies the shade between players of one team
    size?: number;
}

// Round player icon in the player's team color.
export const PlayerAvatar = ({ playerId, teamName, seed, size = 28 }: PlayerAvatarProps) => {
    const ctx = useMatchTheme();
    const theme = teamName !== undefined ? resolveTeamTheme(ctx, teamName) : resolvePlayerTheme(ctx, playerId);
    const color = theme ? getPlayerColor(theme.color, seed ?? playerId ?? teamName ?? '') : NEUTRAL_COLOR;

    return (
        <View
            testID="player-avatar"
            style={{
                width: size,
                height: size,
                borderRadius: size / 2,
                backgroundColor: color,
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            <Ionicons name="person" size={size * 0.6} color="rgba(255,255,255,0.92)" />
        </View>
    );
};
