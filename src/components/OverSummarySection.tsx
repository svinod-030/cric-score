import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { InningsState, Over, Ball, Player } from '../types/match';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '../hooks/useAppTheme';

interface OverSummarySectionProps {
    title: string;
    innings: InningsState;
    bowlingTeamPlayers: Player[];
    defaultExpanded?: boolean;
    expanded?: boolean;
}

const OverRow = ({ overNum, bowlerName, balls, runs, wickets }: { overNum: string, bowlerName?: string, balls: Ball[], runs: number, wickets: number }) => {
    const { t } = useTranslation();
    const { isDark } = useAppTheme();
    return (
        <View className={`p-3 border-b ${isDark ? 'border-gray-700/50' : 'border-gray-150'}`}>
            <View className="flex-row justify-between items-center mb-1">
                <View className="flex-row items-center">
                    <Text className={`font-bold w-16 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{overNum}</Text>
                    {bowlerName && (
                        <Text className="text-blue-500 text-xs font-medium ml-2">{bowlerName}</Text>
                    )}
                </View>
                <View className="flex-row gap-4 w-24 justify-end">
                    <Text className={`font-bold ${isDark ? 'text-gray-300' : 'text-gray-800'}`}>{runs} {t('common.runsLabel')}</Text>
                    <Text className={`font-bold ${isDark ? 'text-red-400' : 'text-red-600'}`}>{wickets > 0 ? `${wickets} ${t('common.wktLabel')}` : '-'}</Text>
                </View>
            </View>
            <View className="flex-row flex-wrap gap-1">
                    {balls.map((ball, idx) => (
                        <View
                            key={idx}
                            className={`w-5 h-5 rounded-full items-center justify-center border ${
                                ball.isWicket 
                                    ? isDark ? 'bg-red-900/50 border-red-800' : 'bg-red-100 border-red-300' 
                                    : ball.runs >= 4 
                                        ? isDark ? 'bg-green-900/50 border-green-800' : 'bg-green-100 border-green-300' 
                                        : isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-100 border-gray-300'
                            }`}
                        >
                            <Text className={`text-[8px] font-bold ${
                                ball.isWicket 
                                    ? isDark ? 'text-red-400' : 'text-red-600' 
                                    : ball.runs >= 4 
                                        ? isDark ? 'text-green-400' : 'text-green-600' 
                                        : isDark ? 'text-gray-400' : 'text-gray-650'
                            }`}>
                                {ball.isWicket ? t('common.wicketsAbbr') : ball.extraType !== 'none' ? (ball.extraType === 'wide' ? t('common.wideAbbr') : ball.extraType === 'no-ball' ? t('common.noBallAbbr') : 'ex') : ball.runs}
                            </Text>
                        </View>
                    ))}
                </View>
        </View>
    );
};

export const OverSummarySection = ({ title, innings, bowlingTeamPlayers, defaultExpanded = false, expanded }: OverSummarySectionProps) => {
    const { t } = useTranslation();
    const { isDark } = useAppTheme();
    const [internalExpanded, setInternalExpanded] = useState(defaultExpanded);
    const isExpanded = expanded !== undefined ? expanded : internalExpanded;

    const toggleExpanded = () => setInternalExpanded(!internalExpanded);

    const calcIntervalStats = (balls: Ball[]) => {
        const totalRuns = balls.reduce((acc, b) => acc + b.runs, 0);
        const wickets = balls.filter(b => b.isWicket).length;
        return { totalRuns, wickets };
    };

    return (
        <View className={`mb-6 rounded-xl overflow-hidden border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200 shadow-sm'}`}>
            <TouchableOpacity
                activeOpacity={0.7}
                onPress={toggleExpanded}
                className={`p-3 flex-row justify-between items-center ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}
            >
                <View className="flex-row items-center">
                    <Text className={`mr-2 text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {isExpanded ? '▼' : '▶'}
                    </Text>
                    <Text className={`font-bold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>{title}</Text>
                </View>
            </TouchableOpacity>

            {isExpanded && (
                <View>
                    {/* Header */}
                    <View className={`flex-row justify-between p-2 border-b ${isDark ? 'bg-gray-900/50 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                        <Text className={`text-xs font-bold uppercase w-16 ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>{t('common.over')}</Text>
                        <Text className={`text-xs font-bold uppercase flex-1 ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>{t('common.details')}</Text>
                        <View className="flex-row gap-4 w-24 justify-end">
                            <Text className={`text-xs font-bold uppercase text-right ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>{t('common.runs')}</Text>
                            <Text className={`text-xs font-bold uppercase text-right ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>{t('common.wks')}</Text>
                        </View>
                    </View>

                    {innings.overs.map((over, idx) => {
                        const { totalRuns, wickets } = calcIntervalStats(over.balls);
                        const bowler = bowlingTeamPlayers.find(p => p.id === over.bowlerId);
                        return (
                            <OverRow
                                key={idx}
                                overNum={`${t('common.over')} ${idx + 1}`}
                                bowlerName={bowler?.name}
                                balls={over.balls}
                                runs={totalRuns}
                                wickets={wickets}
                            />
                        );
                    })}

                    {/* Current Over */}
                    {innings.currentOver.length > 0 && (
                        <OverRow
                            overNum={`${t('common.over')} ${innings.overs.length + 1}`}
                            bowlerName={bowlingTeamPlayers.find(p => p.id === innings.currentBowlerId)?.name}
                            balls={innings.currentOver}
                            runs={calcIntervalStats(innings.currentOver).totalRuns}
                            wickets={calcIntervalStats(innings.currentOver).wickets}
                        />
                    )}

                    {innings.overs.length === 0 && innings.currentOver.length === 0 && (
                        <View className="p-4 items-center">
                            <Text className={`italic ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{t('common.noOversBowled')}</Text>
                        </View>
                    )}
                </View>
            )}
        </View>
    );
};
