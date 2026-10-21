import React from 'react';
import { View, Text } from 'react-native';
import { InningsState, Player } from '../types/match';
import { useTranslation } from 'react-i18next';
import { PlayerAvatar } from '../features/teamTheme/components/PlayerAvatar';

interface PersistentScoreStripProps {
    innings: InningsState;
    oversLimit: number;
    allPlayers: Player[];
}

// A compact, always-visible summary of the live score (Total/Wickets, Overs, Batsmen).
// Rendered at the top of in-play modals (bowler/batter selection) so scorers are
// never "blinded" by a popup and can still read/update a physical scoreboard.
export const PersistentScoreStrip = ({ innings, oversLimit, allPlayers }: PersistentScoreStripProps) => {
    const { t } = useTranslation();

    const getPlayerName = (id: string) => {
        if (!id) return '-';
        const player = allPlayers.find(p => p.id === id);
        return player ? player.name : id;
    };

    const validBalls = innings.currentOver.filter(b => b.isValidBall).length;
    const strikerStats = innings.battingStats[innings.strikerId];
    const nonStrikerStats = innings.battingStats[innings.nonStrikerId];

    return (
        <View className="bg-gray-800 rounded-2xl p-4 mb-4 border border-gray-700">
            <View className="flex-row justify-between items-center mb-1">
                <Text className="text-gray-400 text-[10px] font-black uppercase tracking-widest">
                    {innings.battingTeam} {t('common.batting')}
                </Text>
                <Text className="text-gray-400 text-[10px] font-bold">
                    {t('common.overs')}: {innings.overs.length}.{validBalls} ({oversLimit})
                </Text>
            </View>
            <Text className="text-white text-3xl font-black">
                {innings.totalRuns}/{innings.totalWickets}
            </Text>
            {(innings.strikerId || innings.nonStrikerId) && (
                <View className="flex-row justify-between mt-2 pt-2 border-t border-gray-700">
                    <View className="flex-row items-center flex-shrink gap-1.5">
                        {!!innings.strikerId && <PlayerAvatar playerId={innings.strikerId} seed={getPlayerName(innings.strikerId)} size={20} />}
                        <Text className="text-gray-300 text-sm font-medium flex-shrink" numberOfLines={1}>
                            {getPlayerName(innings.strikerId)}{innings.strikerId ? '*' : ''} {strikerStats ? `${strikerStats.runs} (${strikerStats.ballsFaced})` : ''}
                        </Text>
                    </View>
                    {innings.nonStrikerId ? (
                        <View className="flex-row items-center flex-shrink gap-1.5">
                            <PlayerAvatar playerId={innings.nonStrikerId} seed={getPlayerName(innings.nonStrikerId)} size={20} />
                            <Text className="text-gray-300 text-sm font-medium flex-shrink" numberOfLines={1}>
                                {getPlayerName(innings.nonStrikerId)} {nonStrikerStats ? `${nonStrikerStats.runs} (${nonStrikerStats.ballsFaced})` : ''}
                            </Text>
                        </View>
                    ) : null}
                </View>
            )}
        </View>
    );
};
