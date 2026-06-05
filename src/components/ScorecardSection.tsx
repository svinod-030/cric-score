import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { InningsState, Player } from '../types/match';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '../hooks/useAppTheme';

// Helper to calc extras
const calculateExtras = (innings: InningsState) => {
    let wide = 0, noBall = 0, bye = 0, legBye = 0;
    const allBalls = [...innings.overs.flatMap(o => o.balls), ...innings.currentOver];

    allBalls.forEach(ball => {
        switch (ball.extraType) {
            case 'wide': wide += ball.runs; break;
            case 'no-ball': noBall += ball.runs; break;
            case 'bye': bye += ball.runs; break;
            case 'leg-bye': legBye += ball.runs; break;
        }
    });

    return { wide, noBall, bye, legBye, total: wide + noBall + bye + legBye };
};

export const ScorecardSection = ({
    title,
    innings,
    battingTeamPlayers,
    bowlingTeamPlayers,
    isCollapsible = false,
    defaultExpanded = true,
    expanded
}: {
    title: string,
    innings: InningsState,
    battingTeamPlayers: Player[],
    bowlingTeamPlayers: Player[],
    isCollapsible?: boolean,
    defaultExpanded?: boolean,
    expanded?: boolean
}) => {
    const { t } = useTranslation();
    const { isDark } = useAppTheme();
    const [internalExpanded, setInternalExpanded] = React.useState(defaultExpanded);
    const isExpanded = expanded !== undefined ? expanded : internalExpanded;
    const validBalls = innings.currentOver.filter(b => b.isValidBall).length;
    const totalOvers = `${innings.overs.length}.${validBalls}`;

    const toggleExpanded = () => {
        if (isCollapsible) {
            setInternalExpanded(!internalExpanded);
        }
    };

    return (
        <View className={`mb-6 rounded-xl overflow-hidden border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200 shadow-sm'}`}>
            <TouchableOpacity
                activeOpacity={isCollapsible ? 0.7 : 1}
                onPress={toggleExpanded}
                className={`p-3 flex-row justify-between items-center ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}
            >
                <View className="flex-row items-center">
                    {isCollapsible && (
                        <Text className={`mr-2 text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            {isExpanded ? '▼' : '▶'}
                        </Text>
                    )}
                    <Text className={`font-bold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>{title}</Text>
                </View>
                <Text className={`font-bold ${isDark ? 'text-gray-300' : 'text-gray-750'}`}>{innings.totalRuns}/{innings.totalWickets} ({totalOvers} {t('common.overs')})</Text>
            </TouchableOpacity>

            {(!isCollapsible || isExpanded) && (
                <View>
                    {/* Batting Header */}
                    <View className={`flex-row p-2 border-b ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                        <Text className={`flex-[3] text-xs uppercase font-bold ${isDark ? 'text-gray-400' : 'text-gray-550'}`}>{t('common.batter')}</Text>
                        <Text className={`flex-1 text-xs uppercase font-bold text-center ${isDark ? 'text-gray-400' : 'text-gray-550'}`}>{t('common.r')}</Text>
                        <Text className={`flex-1 text-xs uppercase font-bold text-center ${isDark ? 'text-gray-400' : 'text-gray-550'}`}>{t('common.b')}</Text>
                        <Text className={`flex-1 text-xs uppercase font-bold text-center ${isDark ? 'text-gray-400' : 'text-gray-550'}`}>{t('common.fours')}</Text>
                        <Text className={`flex-1 text-xs uppercase font-bold text-center ${isDark ? 'text-gray-400' : 'text-gray-550'}`}>{t('common.sixes')}</Text>
                        <Text className={`flex-1 text-xs uppercase font-bold text-center ${isDark ? 'text-gray-400' : 'text-gray-550'}`}>{t('common.sr')}</Text>
                    </View>

                    {battingTeamPlayers
                        .filter(player => !!innings.battingStats[player.id])
                        .sort((a, b) => (innings.battingStats[a.id]?.battingOrder || 0) - (innings.battingStats[b.id]?.battingOrder || 0))
                        .map(player => {
                        const stats = innings.battingStats[player.id];
                        if (!stats) return null;

                        const sr = stats.ballsFaced > 0 ? ((stats.runs / stats.ballsFaced) * 100).toFixed(0) : "0";
                        return (
                            <View key={player.id} className={`flex-row p-3 border-b ${isDark ? 'border-gray-700/50' : 'border-gray-150'}`}>
                                <View className="flex-[3] pr-2">
                                    <Text className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{player.name}</Text>
                                    {(stats.isOut || stats.isRetired) ? (
                                        <Text className={`text-[10px] leading-tight mt-0.5 ${isDark ? 'text-gray-550' : 'text-gray-500'}`}>
                                            {stats.dismissal === 'bowled' && `${t('common.bowledAbbr')} ${bowlingTeamPlayers.find(p => p.id === stats.bowlerId)?.name || t('common.bowler')}`}
                                            {stats.dismissal === 'caught' && `${t('common.caughtAbbr')} ${bowlingTeamPlayers.find(p => p.id === stats.fielderId)?.name || t('common.fielder')} ${t('common.bowledAbbr')} ${bowlingTeamPlayers.find(p => p.id === stats.bowlerId)?.name || t('common.bowler')}`}
                                            {stats.dismissal === 'lbw' && `${t('common.lbw')} ${t('common.bowledAbbr')} ${bowlingTeamPlayers.find(p => p.id === stats.bowlerId)?.name || t('common.bowler')}`}
                                            {stats.dismissal === 'run-out' && `${t('common.runOut')} (${bowlingTeamPlayers.find(p => p.id === stats.fielderId)?.name || t('common.fielder')})`}
                                            {stats.dismissal === 'stumped' && `${t('common.stumpedAbbr')} ${bowlingTeamPlayers.find(p => p.id === stats.fielderId)?.name || t('common.fielder')} ${t('common.bowledAbbr')} ${bowlingTeamPlayers.find(p => p.id === stats.bowlerId)?.name || t('common.bowler')}`}
                                            {stats.dismissal === 'retired-hurt' && t('common.retiredHurt')}
                                            {stats.dismissal === 'other' && t('common.wicket')}
                                            {(!stats.dismissal || stats.dismissal === 'none') && t('common.wicket')}
                                        </Text>
                                    ) : (
                                        <Text className="text-blue-500 text-[10px] font-bold mt-0.5">{t('common.notOut')}</Text>
                                    )}
                                </View>
                                <Text className={`flex-1 font-bold text-center ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.runs}</Text>
                                <Text className={`flex-1 text-center ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{stats.ballsFaced}</Text>
                                <Text className={`flex-1 text-center ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{stats.fours}</Text>
                                <Text className={`flex-1 text-center ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{stats.sixes}</Text>
                                <Text className={`flex-1 text-center ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{sr}</Text>
                            </View>
                        );
                    })}

                    {/* Extras Row */}
                    {(() => {
                        const extras = calculateExtras(innings);
                        return (
                            <View className={`flex-row justify-between p-3 border-b ${isDark ? 'border-gray-700 bg-gray-600/20' : 'border-gray-200 bg-gray-50'}`}>
                                <Text className={`font-bold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('common.extras')}</Text>
                                <Text className={isDark ? 'text-white' : 'text-gray-900'}>
                                    {extras.total} ({t('common.wideAbbr')} {extras.wide}, {t('common.noBallAbbr')} {extras.noBall}, {t('common.byeAbbr')} {extras.bye}, {t('common.legByeAbbr')} {extras.legBye})
                                </Text>
                            </View>
                        );
                    })()}

                    {/* Total Row */}
                    <View className={`flex-row justify-between p-3 border-b ${isDark ? 'border-gray-700 bg-gray-900/40' : 'border-gray-200 bg-gray-100'}`}>
                        <Text className={`font-black text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('common.total')}</Text>
                        <Text className={`font-black text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {innings.totalRuns}/{innings.totalWickets} <Text className={`text-base font-normal ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>({totalOvers} {t('common.overs')})</Text>
                        </Text>
                    </View>

                    {/* Bowling Header */}
                    <View className={`flex-row p-2 mt-4 ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                        <Text className={`flex-[3] text-xs uppercase font-bold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('common.bowler')}</Text>
                        <Text className={`flex-1 text-xs uppercase font-bold text-center ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('common.o')}</Text>
                        <Text className={`flex-1 text-xs uppercase font-bold text-center ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('common.m')}</Text>
                        <Text className={`flex-1 text-xs uppercase font-bold text-center ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('common.r')}</Text>
                        <Text className={`flex-1 text-xs uppercase font-bold text-center ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('common.wicketsAbbr')}</Text>
                        <Text className={`flex-1 text-xs uppercase font-bold text-center ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('common.eco')}</Text>
                    </View>

                    {bowlingTeamPlayers.map(player => {
                        const stats = innings.bowlingStats[player.id];
                        if (!stats) return null;

                        const economy = stats.overs > 0
                            ? (stats.runsConceded / (stats.overs + (stats.balls % 6) / 6)).toFixed(1)
                            : "0.0";

                        const oversDisplay = `${stats.overs}.${stats.balls % 6}`;

                        return (
                            <View key={player.id} className={`flex-row p-3 border-b ${isDark ? 'border-gray-700/50' : 'border-gray-150'}`}>
                                <Text className={`flex-[3] font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{player.name}</Text>
                                <Text className={`flex-1 text-center ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{oversDisplay}</Text>
                                <Text className={`flex-1 text-center ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{stats.maidens}</Text>
                                <Text className={`flex-1 text-center ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{stats.runsConceded}</Text>
                                <Text className={`flex-1 font-bold text-center ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.wickets}</Text>
                                <Text className={`flex-1 text-center ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{economy}</Text>
                            </View>
                        );
                    })}
                </View>
            )}
        </View>
    );
};
