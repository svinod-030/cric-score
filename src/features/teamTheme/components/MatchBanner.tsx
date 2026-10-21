import React from 'react';
import { View, Text, ImageBackground } from 'react-native';
import { getMatchTheme } from '../teamTheme';
import { TeamLogo } from './TeamLogo';

interface MatchBannerProps {
    teamA: string;
    teamB: string;
    center?: React.ReactNode; // Score, "VS", status...
}

// "A vs B" header over a cricket-ground picture, with each team's logo and name.
export const MatchBanner = ({ teamA, teamB, center }: MatchBannerProps) => {
    const theme = getMatchTheme(teamA, teamB);

    return (
        <ImageBackground
            testID="match-banner"
            source={require('../../../../assets/ground-bg.jpg')}
            resizeMode="cover"
            style={{ width: '100%' }}
        >
            <View className="bg-black/45 px-4 py-6">
                <View className="flex-row items-center justify-between">
                    <View className="items-center" style={{ width: '32%' }}>
                        <TeamLogo theme={theme.teamA} size={56} />
                        <Text className="text-white font-bold text-sm text-center mt-2" numberOfLines={2}>{teamA}</Text>
                    </View>

                    <View className="items-center flex-1 px-2">
                        {center ?? <Text className="text-white text-2xl font-black italic">VS</Text>}
                    </View>

                    <View className="items-center" style={{ width: '32%' }}>
                        <TeamLogo theme={theme.teamB} size={56} />
                        <Text className="text-white font-bold text-sm text-center mt-2" numberOfLines={2}>{teamB}</Text>
                    </View>
                </View>
            </View>
        </ImageBackground>
    );
};
