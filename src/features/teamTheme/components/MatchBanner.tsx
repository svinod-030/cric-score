import React from 'react';
import { View, Text, ImageBackground, StyleSheet } from 'react-native';
import { getMatchTheme } from '../teamTheme';
import { TeamLogo } from './TeamLogo';

// Same as the screens' background, so the picture melts into the page instead of ending in a hard edge.
export const PAGE_BACKGROUND = '#111827';

const FADE_HEIGHT = 110;
const FADE_STEPS = 32;

// Keeps names readable over the brighter parts of the picture
const NAME_SHADOW = { textShadowColor: 'rgba(0,0,0,0.65)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4 };

const hexToRgb = (hex: string) => {
    const value = parseInt(hex.slice(1), 16);
    return `${(value >> 16) & 255}, ${(value >> 8) & 255}, ${value & 255}`;
};

const smoothstep = (t: number) => t * t * (3 - 2 * t);

// There is no gradient library in the app, so the fade is a stack of overlapping layers, each one
// running from its own top edge down to the bottom of the banner. Layers add up, so the picture is
// covered by 0% at the top of the fade and 100% at the bottom, along a smoothstep curve. They overlap
// instead of sitting side by side, so rounding to whole pixels can never leave a gap (a visible line).
const FadeToPage = ({ color }: { color: string }) => {
    const rgb = hexToRgb(color);
    const step = FADE_HEIGHT / FADE_STEPS;

    return (
        <View
            testID="banner-fade"
            pointerEvents="none"
            style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: FADE_HEIGHT }}
        >
            {Array.from({ length: FADE_STEPS }, (_, i) => {
                const covered = smoothstep((i + 1) / FADE_STEPS); // total opacity wanted from this layer's top
                const before = smoothstep(i / FADE_STEPS); // total opacity of the layers above it
                const alpha = before >= 1 ? 1 : 1 - (1 - covered) / (1 - before);
                return (
                    <View
                        key={i}
                        style={{ position: 'absolute', left: 0, right: 0, bottom: 0, top: i * step, backgroundColor: `rgba(${rgb}, ${alpha.toFixed(4)})` }}
                    />
                );
            })}
        </View>
    );
};

interface MatchBannerProps {
    teamA: string;
    teamB: string;
    center?: React.ReactNode; // Score, "VS", status...
    children?: React.ReactNode; // Extra content shown over the picture, below the teams (e.g. the result)
    fadeColor?: string; // Colour the picture fades into at the bottom
}

// "A vs B" header over a cricket-ground picture, with each team's logo and name.
export const MatchBanner = ({ teamA, teamB, center, children, fadeColor = PAGE_BACKGROUND }: MatchBannerProps) => {
    const theme = getMatchTheme(teamA, teamB);

    return (
        <View testID="match-banner">
            <ImageBackground
                source={require('../../../../assets/ground-bg.jpg')}
                resizeMode="cover"
                style={{ width: '100%' }}
            >
                {/* Light tint so white text stays readable on the bright picture */}
                <View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.2)' }]} />
                <FadeToPage color={fadeColor} />

                <View className="px-4 pt-6 pb-8">
                    <View className="flex-row items-center justify-between">
                        <View className="items-center" style={{ width: '32%' }}>
                            <TeamLogo theme={theme.teamA} size={56} />
                            <Text className="text-white font-bold text-sm text-center mt-2" style={NAME_SHADOW} numberOfLines={2}>{teamA}</Text>
                        </View>

                        <View className="items-center flex-1 px-2">
                            {center ?? <Text className="text-white text-2xl font-black italic">VS</Text>}
                        </View>

                        <View className="items-center" style={{ width: '32%' }}>
                            <TeamLogo theme={theme.teamB} size={56} />
                            <Text className="text-white font-bold text-sm text-center mt-2" style={NAME_SHADOW} numberOfLines={2}>{teamB}</Text>
                        </View>
                    </View>

                    {children ? <View className="items-center mt-6 px-2 pb-6">{children}</View> : null}
                </View>
            </ImageBackground>
        </View>
    );
};
