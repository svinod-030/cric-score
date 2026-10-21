import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { resolvePlayerTheme, resolveTeamTheme, useMatchTheme } from '../MatchThemeContext';
import { getPlayerColor, NEUTRAL_COLOR } from '../teamTheme';
import { getAvatarLabel } from '../avatarLabel';

interface PlayerAvatarProps {
    playerId?: string; // Match-local id (A1, B3...). Gives the team when inside a MatchThemeProvider.
    teamName?: string; // Alternative to playerId, e.g. for series awards that are keyed by name
    seed?: string; // The player's name: varies the shade between players and gives the badge text
    size?: number;
}

// Round player badge in the team color, with a soft gloss and ring. It shows the jersey number
// for default names (SRH11 -> 11) or the initials of a real name, and a person icon when it has no name.
export const PlayerAvatar = ({ playerId, teamName, seed, size = 28 }: PlayerAvatarProps) => {
    const ctx = useMatchTheme();
    const theme = teamName !== undefined ? resolveTeamTheme(ctx, teamName) : resolvePlayerTheme(ctx, playerId);
    const color = theme ? getPlayerColor(theme.color, seed ?? playerId ?? teamName ?? '') : NEUTRAL_COLOR;
    const label = getAvatarLabel(seed);

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
                overflow: 'hidden',
                borderWidth: Math.max(1, size / 18),
                borderColor: 'rgba(255,255,255,0.35)',
            }}
        >
            {/* Lighter top half gives the badge a subtle gradient */}
            <View
                pointerEvents="none"
                style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '50%', backgroundColor: 'rgba(255,255,255,0.18)' }}
            />
            {label ? (
                <Text
                    testID="player-avatar-label"
                    allowFontScaling={false}
                    style={{
                        color: '#FFFFFF',
                        fontWeight: '800',
                        fontSize: size * (label.length > 2 ? 0.34 : 0.4),
                        letterSpacing: 0.2,
                        includeFontPadding: false,
                        textShadowColor: 'rgba(0,0,0,0.25)',
                        textShadowOffset: { width: 0, height: 1 },
                        textShadowRadius: 1.5,
                    }}
                >
                    {label}
                </Text>
            ) : (
                <Ionicons name="person" size={size * 0.6} color="rgba(255,255,255,0.92)" />
            )}
        </View>
    );
};
