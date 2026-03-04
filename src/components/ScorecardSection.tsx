import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { InningsState, Player } from '../types/match';
import { useTranslation } from 'react-i18next';

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
        <View className="mb-6 bg-gray-800 rounded-xl overflow-hidden">
            <TouchableOpacity
                activeOpacity={isCollapsible ? 0.7 : 1}
                onPress={toggleExpanded}
                className="bg-gray-700 p-3 flex-row justify-between items-center"
            >
                <View className="flex-row items-center">
                    {isCollapsible && (
                        <Text className="text-gray-400 mr-2 text-xs">
                            {isExpanded ? '▼' : '▶'}
                        </Text>
                    )}
                    <Text className="text-white font-bold text-lg">{title}</Text>
                </View>
                <Text className="text-gray-300 font-bold">{innings.totalRuns}/{innings.totalWickets} ({totalOvers} {t('common.overs')})</Text>
            </TouchableOpacity>

            {(!isCollapsible || isExpanded) && (
                <View>
                    {/* Batting Header */}
                    <View className="flex-row bg-gray-800 p-2 border-b border-gray-700">
                        <Text className="flex-[3] text-gray-400 text-xs uppercase font-bold">{t('common.batter')}</Text>
                        <Text className="flex-1 text-gray-400 text-xs uppercase font-bold text-center">{t('common.r')}</Text>
                        <Text className="flex-1 text-gray-400 text-xs uppercase font-bold text-center">{t('common.b')}</Text>
                        <Text className="flex-1 text-gray-400 text-xs uppercase font-bold text-center">{t('common.fours')}</Text>
                        <Text className="flex-1 text-gray-400 text-xs uppercase font-bold text-center">{t('common.sixes')}</Text>
                        <Text className="flex-1 text-gray-400 text-xs uppercase font-bold text-center">{t('common.sr')}</Text>
                    </View>

                    {battingTeamPlayers.map(player => {
                        const stats = innings.battingStats[player.id];
                        if (!stats && !innings.battingStats[player.id]) return null;
                        if (!stats) return null;

                        const sr = stats.ballsFaced > 0 ? ((stats.runs / stats.ballsFaced) * 100).toFixed(0) : "0";
                        return (
                            <View key={player.id} className="flex-row p-3 border-b border-gray-700/50">
                                <View className="flex-[3] pr-2">
                                    <Text className="text-white font-medium">{player.name}</Text>
                                    {(stats.isOut || stats.isRetired) ? (
                                        <Text className="text-gray-500 text-[10px] leading-tight mt-0.5">
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
                                        <Text className="text-blue-400 text-[10px] font-bold mt-0.5">{t('common.notOut')}</Text>
                                    )}
                                </View>
                                <Text className="flex-1 text-white font-bold text-center">{stats.runs}</Text>
                                <Text className="flex-1 text-gray-400 text-center">{stats.ballsFaced}</Text>
                                <Text className="flex-1 text-gray-400 text-center">{stats.fours}</Text>
                                <Text className="flex-1 text-gray-400 text-center">{stats.sixes}</Text>
                                <Text className="flex-1 text-gray-400 text-center">{sr}</Text>
                            </View>
                        );
                    })}

                    {/* Extras Row */}
                    {(() => {
                        const extras = calculateExtras(innings);
                        return (
                            <View className="flex-row justify-between p-3 border-b border-gray-700 bg-gray-600/20">
                                <Text className="text-gray-300 font-bold">{t('common.extras')}</Text>
                                <Text className="text-white">
                                    {extras.total} ({t('common.wideAbbr')} {extras.wide}, {t('common.noBallAbbr')} {extras.noBall}, {t('common.byeAbbr')} {extras.bye}, {t('common.legByeAbbr')} {extras.legBye})
                                </Text>
                            </View>
                        );
                    })()}

                    {/* Total Row */}
                    <View className="flex-row justify-between p-3 border-b border-gray-700 bg-gray-900/40">
                        <Text className="text-white font-black text-lg">{t('common.total')}</Text>
                        <Text className="text-white font-black text-lg">
                            {innings.totalRuns}/{innings.totalWickets} <Text className="text-base text-gray-400 font-normal">({totalOvers} {t('common.overs')})</Text>
                        </Text>
                    </View>

                    {/* Bowling Header */}
                    <View className="flex-row bg-gray-700 p-2 mt-4">
                        <Text className="flex-[3] text-gray-300 text-xs uppercase font-bold">{t('common.bowler')}</Text>
                        <Text className="flex-1 text-gray-300 text-xs uppercase font-bold text-center">{t('common.o')}</Text>
                        <Text className="flex-1 text-gray-300 text-xs uppercase font-bold text-center">{t('common.m')}</Text>
                        <Text className="flex-1 text-gray-300 text-xs uppercase font-bold text-center">{t('common.r')}</Text>
                        <Text className="flex-1 text-gray-300 text-xs uppercase font-bold text-center">{t('common.wicketsAbbr')}</Text>
                        <Text className="flex-1 text-gray-300 text-xs uppercase font-bold text-center">{t('common.eco')}</Text>
                    </View>

                    {bowlingTeamPlayers.map(player => {
                        const stats = innings.bowlingStats[player.id];
                        if (!stats) return null;

                        const economy = stats.overs > 0
                            ? (stats.runsConceded / (stats.overs + (stats.balls % 6) / 6)).toFixed(1)
                            : "0.0";

                        const oversDisplay = `${stats.overs}.${stats.balls % 6}`;

                        return (
                            <View key={player.id} className="flex-row p-3 border-b border-gray-700/50">
                                <Text className="flex-[3] text-white font-medium">{player.name}</Text>
                                <Text className="flex-1 text-gray-400 text-center">{oversDisplay}</Text>
                                <Text className="flex-1 text-gray-400 text-center">{stats.maidens}</Text>
                                <Text className="flex-1 text-gray-400 text-center">{stats.runsConceded}</Text>
                                <Text className="flex-1 text-white font-bold text-center">{stats.wickets}</Text>
                                <Text className="flex-1 text-gray-400 text-center">{economy}</Text>
                            </View>
                        );
                    })}
                </View>
            )}
        </View>
    );
};
