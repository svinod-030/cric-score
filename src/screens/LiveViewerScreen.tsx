import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { matchSyncService } from '../services/matchSyncService';
import { MatchState } from '../types/match';
import { ScorecardSection } from '../components/ScorecardSection';
import { OverSummarySection } from '../components/OverSummarySection';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';

export default function LiveViewerScreen({ route, navigation }: any) {
    const { matchId } = route.params;
    const { t } = useTranslation();
    const [match, setMatch] = useState<MatchState | null>(null);
    const [error, setError] = useState('');

    useEffect(() => {
        navigation.setOptions({
            title: t('common.liveTitle', { matchId })
        });

        const unsubscribe = matchSyncService.subscribeToMatch(
            matchId,
            (updatedMatch) => {
                setMatch(updatedMatch);
            },
            (err) => {
                setError(t('common.lostConnection'));
            }
        );

        return () => unsubscribe();
    }, [matchId, navigation]);

    if (error) {
        return (
            <SafeAreaView className="flex-1 bg-gray-900 justify-center items-center">
                <Ionicons name="alert-circle" size={64} color="#ef4444" />
                <Text className="text-white text-xl mt-4">{error}</Text>
            </SafeAreaView>
        );
    }

    if (!match) {
        return (
            <SafeAreaView className="flex-1 bg-gray-900 justify-center items-center">
                <ActivityIndicator size="large" color="#3b82f6" />
                <Text className="text-gray-400 mt-4">{t('common.connectingToLiveMatch')}</Text>
            </SafeAreaView>
        );
    }

    const innings = match.currentInnings === 1 ? match.innings1 : match.innings2;
    const currentOverValidBalls = innings.currentOver.filter(b => b.isValidBall).length;

    // Helper functions
    const getBatterStats = (id: string) => innings.battingStats[id] || { runs: 0, ballsFaced: 0, fours: 0, sixes: 0 };
    const getBowlerStats = (id: string | null) => id ? innings.bowlingStats[id] || { overs: 0, runsConceded: 0, wickets: 0, balls: 0 } : null;

    const getPlayerName = (id: string | null) => {
        if (!id) return '-';
        const player = [...match.teamAPlayers, ...match.teamBPlayers].find(p => p.id === id);
        return player ? player.name : id;
    };

    const strikerStats = getBatterStats(innings.strikerId);
    const nonStrikerStats = getBatterStats(innings.nonStrikerId);
    const currentBowlerStats = getBowlerStats(innings.currentBowlerId);
    const bowlerOversDisplay = currentBowlerStats
        ? `${currentBowlerStats.overs}.${currentBowlerStats.balls % 6}`
        : "0.0";

    return (
        <SafeAreaView className="flex-1 bg-gray-900" edges={['bottom', 'left', 'right']}>
            <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 16 }}>
                <View className="mb-6 items-center">
                    <View className="flex-row items-center justify-center bg-red-600 px-3 py-1 rounded-full mb-4">
                        <View className="w-2 h-2 rounded-full bg-white mr-2 animate-pulse" />
                        <Text className="text-white text-xs font-bold tracking-widest uppercase">{t('common.liveBadge')}</Text>
                    </View>
                    <Text className="text-gray-400 font-medium mb-1">{innings.battingTeam} {t('common.batting')}</Text>
                    <Text className="text-6xl font-black text-white">
                        {innings.totalRuns}/{innings.totalWickets}
                    </Text>
                    <Text className="text-xl text-gray-400 mt-2">
                        {t('common.overs')}: {innings.overs.length}.{currentOverValidBalls} ({match.overs})
                    </Text>

                    {match.currentInnings === 2 && (
                        <View className="mt-4 bg-gray-800 px-4 py-2 rounded-lg">
                            <Text className="text-yellow-500 font-bold text-lg text-center">
                                {t('common.target')}: {match.innings1.totalRuns + 1}
                            </Text>
                            <Text className="text-gray-300 text-sm text-center mt-1">
                                {t('common.needRunsInBalls', {
                                    runs: match.innings1.totalRuns + 1 - innings.totalRuns,
                                    balls: (match.overs * 6) - (innings.overs.length * 6 + currentOverValidBalls)
                                })}
                            </Text>
                        </View>
                    )}
                </View>

                {/* Player Stats Bar */}
                <View className={`flex-row ${innings.isLastManStanding ? 'justify-center' : 'justify-between'} bg-gray-800 p-4 rounded-xl mb-4 shadow-lg border border-gray-700`}>
                    <View className={innings.isLastManStanding ? 'items-center' : ''}>
                        <Text className="text-white font-bold text-lg max-w-[150px]">{getPlayerName(innings.strikerId)}*</Text>
                        <Text className="text-blue-400 font-bold mt-1">
                            {strikerStats.runs} <Text className="text-gray-400 text-sm font-normal">({strikerStats.ballsFaced})</Text>
                        </Text>
                    </View>
                    {!innings.isLastManStanding && (
                        <View className="items-end">
                            <Text className="text-white font-bold text-lg max-w-[150px] text-right">{getPlayerName(innings.nonStrikerId)}</Text>
                            <Text className="text-blue-400 font-bold mt-1">
                                {nonStrikerStats.runs} <Text className="text-gray-400 text-sm font-normal">({nonStrikerStats.ballsFaced})</Text>
                            </Text>
                        </View>
                    )}
                </View>

                {/* Current Bowler Bar */}
                <View className="flex-row justify-between items-center bg-gray-800 p-4 rounded-xl mb-6 shadow-lg border border-gray-700">
                    <View>
                        <Text className="text-gray-500 text-xs uppercase font-black tracking-wider mb-1">{t('common.bowler')}</Text>
                        <Text className="text-white font-bold text-lg">{getPlayerName(innings.currentBowlerId)}</Text>
                    </View>
                    <View className="items-end">
                        <Text className="text-white font-black text-xl">
                            {currentBowlerStats ? `${currentBowlerStats.wickets}-${currentBowlerStats.runsConceded}` : "0-0"}
                        </Text>
                        <Text className="text-gray-400 text-sm font-medium">
                            {bowlerOversDisplay} {t('common.overs')}
                        </Text>
                    </View>
                </View>

                <View className="mb-8">
                    <Text className="text-gray-400 mb-2 text-sm uppercase font-bold tracking-wider">{t('common.thisOver')}</Text>
                    <View className="flex-row gap-2 min-h-[32px] flex-wrap">
                        {innings.currentOver.length > 0 ? (
                            innings.currentOver.map((ball, idx) => (
                                <View
                                    key={idx}
                                    className={`px-3 py-1.5 rounded-full items-center justify-center shadow-lg ${ball.isWicket ? 'bg-red-600' : ball.extraType !== 'none' ? 'bg-yellow-600' : ball.runs >= 4 ? 'bg-green-600' : 'bg-gray-700'}`}
                                >
                                    <View className="flex-row items-center">
                                        <Text className="text-white font-black text-xs">
                                            {ball.isWicket ? 'W' : ball.extraType !== 'none' ? ball.extraType === 'wide' ? 'WD' : ball.extraType === 'no-ball' ? 'NB' : ball.extraType === 'bye' ? 'B' : 'LB' : ball.runs}
                                        </Text>
                                        {(ball.extraType === 'bye' || ball.extraType === 'leg-bye' || (ball.isWicket && ball.runs > 0) || (ball.extraType === 'no-ball' && ball.runs > match.runsForNoBall) || (ball.extraType === 'wide' && ball.runs > match.runsForWide)) && (
                                            <Text className="text-white font-bold text-[10px] ml-0.5">+{ball.extraType === 'no-ball' ? ball.runs - match.runsForNoBall : ball.extraType === 'wide' ? ball.runs - match.runsForWide : ball.runs}</Text>
                                        )}
                                    </View>
                                </View>
                            ))
                        ) : (
                            <Text className="text-gray-600 text-sm italic">-</Text>
                        )}
                    </View>
                </View>

                {/* Scorecards */}
                <Text className="text-white text-2xl font-black mb-4 px-2 tracking-wide uppercase">{t('common.scorecard')}</Text>

                {match.currentInnings === 2 && (
                    <View className="mb-4">
                        <ScorecardSection
                            title={`${t('common.stInnings')}: ${match.innings1.battingTeam}`}
                            innings={match.innings1}
                            battingTeamPlayers={match.innings1.battingTeamKey === 'teamA' ? match.teamAPlayers : match.teamBPlayers}
                            bowlingTeamPlayers={match.innings1.battingTeamKey === 'teamA' ? match.teamBPlayers : match.teamAPlayers}
                            isCollapsible={true}
                            defaultExpanded={false}
                        />
                        <OverSummarySection
                            title={t('common.overSummaryTitle', { innings: t('common.stInnings') })}
                            innings={match.innings1}
                            defaultExpanded={false}
                        />
                    </View>
                )}

                <ScorecardSection
                    title={`${match.currentInnings === 2 ? t('common.ndInnings') : t('common.stInnings')}: ${innings.battingTeam}`}
                    innings={innings}
                    battingTeamPlayers={innings.battingTeamKey === 'teamA' ? match.teamAPlayers : match.teamBPlayers}
                    bowlingTeamPlayers={innings.battingTeamKey === 'teamA' ? match.teamAPlayers : match.teamBPlayers}
                    isCollapsible={true}
                    defaultExpanded={true}
                />

                <OverSummarySection
                    title={t('common.overSummaryTitle', { innings: match.currentInnings === 2 ? t('common.ndInnings') : t('common.stInnings') })}
                    innings={innings}
                    defaultExpanded={false}
                />
            </ScrollView>
        </SafeAreaView>
    );
}
