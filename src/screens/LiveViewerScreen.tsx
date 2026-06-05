import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { matchSyncService } from '../services/matchSyncService';
import { MatchState } from '../types/match';
import { ScorecardSection } from '../components/ScorecardSection';
import { OverSummarySection } from '../components/OverSummarySection';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../hooks/useAppTheme';

export default function LiveViewerScreen({ route, navigation }: any) {
    const { matchId } = route.params;
    const { t } = useTranslation();
    const { isDark } = useAppTheme();
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
            <SafeAreaView className={`flex-1 justify-center items-center ${isDark ? 'bg-gray-900' : 'bg-gray-100'}`}>
                <Ionicons name="alert-circle" size={64} color="#ef4444" />
                <Text className={`text-xl mt-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>{error}</Text>
            </SafeAreaView>
        );
    }

    if (!match) {
        return (
            <SafeAreaView className={`flex-1 justify-center items-center ${isDark ? 'bg-gray-900' : 'bg-gray-100'}`}>
                <ActivityIndicator size="large" color="#3b82f6" />
                <Text className={`mt-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('common.connectingToLiveMatch')}</Text>
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
        <SafeAreaView className={`flex-1 ${isDark ? 'bg-gray-900' : 'bg-gray-100'}`} edges={['bottom', 'left', 'right']}>
            <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 16 }}>
                <View className="mb-6 items-center">
                    {match.matchResult ? (
                        <View className="items-center w-full mb-4">
                            <View className={`flex-row items-center justify-center px-3 py-1 rounded-full mb-4 ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                                <Text className={`text-xs font-bold tracking-widest uppercase ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('common.completed')}</Text>
                            </View>
                            <View className={`border p-4 rounded-2xl w-full items-center ${isDark ? 'bg-yellow-600/20 border-yellow-600/50' : 'bg-yellow-50 border-yellow-200'}`}>
                                <Text className="text-yellow-600 font-black text-xl text-center">
                                    {match.matchResult.winner === 'Draw' 
                                        ? t('common.matchDrawn') 
                                        : `${match.matchResult.winner} ${t('common.winsExclamation')}`}
                                </Text>
                                <Text className={`font-medium mt-1 text-center ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                    {match.matchResult.resultType === 'runs'
                                        ? t('common.wonByRuns', { count: match.matchResult.margin })
                                        : match.matchResult.resultType === 'wickets'
                                            ? t('common.wonByWickets', { count: match.matchResult.margin })
                                            : match.matchResult.resultType === 'tied'
                                                ? t('common.scoresTied')
                                                : match.matchResult.reason}
                                </Text>
                            </View>
                        </View>
                    ) : (
                        <View className="flex-row items-center justify-center bg-red-600 px-3 py-1 rounded-full mb-4">
                            <View className="w-2 h-2 rounded-full bg-white mr-2" />
                            <Text className="text-white text-xs font-bold tracking-widest uppercase">{t('common.liveBadge')}</Text>
                        </View>
                    )}
                    <Text className={`font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{innings.battingTeam} {t('common.batting')}</Text>
                    <Text className={`text-6xl font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {innings.totalRuns}/{innings.totalWickets}
                    </Text>
                    <Text className={`text-xl mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {t('common.overs')}: {innings.overs.length}.{currentOverValidBalls} ({match.overs})
                    </Text>

                    {match.currentInnings === 2 && (
                        <View className={`mt-4 px-4 py-2 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white border border-gray-200'}`}>
                            <Text className="text-yellow-600 font-bold text-lg text-center">
                                {t('common.target')}: {match.innings1.totalRuns + 1}
                            </Text>
                            <Text className={`text-sm text-center mt-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                {t('common.needRunsInBalls', {
                                    runs: match.innings1.totalRuns + 1 - innings.totalRuns,
                                    balls: (match.overs * 6) - (innings.overs.length * 6 + currentOverValidBalls)
                                })}
                            </Text>
                        </View>
                    )}
                </View>

                {/* Player Stats Bar */}
                <View className={`flex-row ${innings.isLastManStanding ? 'justify-center' : 'justify-between'} p-4 rounded-xl mb-4 shadow-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                    <View className={innings.isLastManStanding ? 'items-center' : ''}>
                        <Text className={`font-bold text-lg max-w-[150px] ${isDark ? 'text-white' : 'text-gray-900'}`}>{getPlayerName(innings.strikerId)}*</Text>
                        <Text className="text-blue-500 font-bold mt-1">
                            {strikerStats.runs} <Text className={`text-sm font-normal ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>({strikerStats.ballsFaced})</Text>
                        </Text>
                    </View>
                    {!innings.isLastManStanding && (
                        <View className="items-end">
                            <Text className={`font-bold text-lg max-w-[150px] text-right ${isDark ? 'text-white' : 'text-gray-900'}`}>{getPlayerName(innings.nonStrikerId)}</Text>
                            <Text className="text-blue-500 font-bold mt-1">
                                {nonStrikerStats.runs} <Text className={`text-sm font-normal ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>({nonStrikerStats.ballsFaced})</Text>
                            </Text>
                        </View>
                    )}
                </View>

                {/* Current Bowler Bar */}
                <View className={`flex-row justify-between items-center p-4 rounded-xl mb-6 shadow-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                    <View>
                        <Text className={`text-xs uppercase font-black tracking-wider mb-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{t('common.bowler')}</Text>
                        <Text className={`font-bold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>{getPlayerName(innings.currentBowlerId)}</Text>
                    </View>
                    <View className="items-end">
                        <Text className={`font-black text-xl ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {currentBowlerStats ? `${currentBowlerStats.wickets}-${currentBowlerStats.runsConceded}` : "0-0"}
                        </Text>
                        <Text className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            {bowlerOversDisplay} {t('common.overs')}
                        </Text>
                    </View>
                </View>

                <View className="mb-8">
                    <Text className={`mb-2 text-sm uppercase font-bold tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('common.thisOver')}</Text>
                    <View className="flex-row gap-2 min-h-[32px] flex-wrap">
                        {innings.currentOver.length > 0 ? (
                            innings.currentOver.map((ball, idx) => (
                                <View
                                    key={idx}
                                    className={`px-3 py-1.5 rounded-full items-center justify-center shadow-lg ${ball.isWicket ? 'bg-red-600' : ball.extraType !== 'none' ? 'bg-yellow-600' : ball.runs >= 4 ? 'bg-green-600' : isDark ? 'bg-gray-700' : 'bg-gray-300'}`}
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
                            <Text className={`text-sm italic ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>-</Text>
                        )}
                    </View>
                </View>

                {/* Scorecards */}
                <Text className={`text-2xl font-black mb-4 px-2 tracking-wide uppercase ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('common.scorecard')}</Text>

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
                            bowlingTeamPlayers={match.innings1.battingTeamKey === 'teamA' ? match.teamBPlayers : match.teamAPlayers}
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
                    bowlingTeamPlayers={innings.battingTeamKey === 'teamA' ? match.teamBPlayers : match.teamAPlayers}
                    defaultExpanded={false}
                />
            </ScrollView>
        </SafeAreaView>
    );
}
