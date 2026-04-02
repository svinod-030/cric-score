import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { InningsState, Over, Ball, Player } from '../types/match';
import { useTranslation } from 'react-i18next';

interface OverSummarySectionProps {
    title: string;
    innings: InningsState;
    bowlingTeamPlayers: Player[];
    defaultExpanded?: boolean;
    expanded?: boolean;
}

const OverRow = ({ overNum, bowlerName, balls, runs, wickets }: { overNum: string, bowlerName?: string, balls: Ball[], runs: number, wickets: number }) => {
    const { t } = useTranslation();
    return (
        <View className="p-3 border-b border-gray-700/50">
            <View className="flex-row justify-between items-center mb-1">
                <View className="flex-row items-center">
                    <Text className="text-gray-400 font-bold w-16">{overNum}</Text>
                    {bowlerName && (
                        <Text className="text-blue-400 text-xs font-medium ml-2">{bowlerName}</Text>
                    )}
                </View>
                <View className="flex-row gap-4 w-24 justify-end">
                    <Text className="text-gray-300 font-bold">{runs} {t('common.runsLabel')}</Text>
                    <Text className="text-red-400 font-bold">{wickets > 0 ? `${wickets} ${t('common.wktLabel')}` : '-'}</Text>
                </View>
            </View>
            <View className="flex-row flex-wrap gap-1">
                    {balls.map((ball, idx) => (
                        <View
                            key={idx}
                            className={`w-5 h-5 rounded-full items-center justify-center ${ball.isWicket ? 'bg-red-900/50 border border-red-800' : ball.runs >= 4 ? 'bg-green-900/50 border border-green-800' : 'bg-gray-800 border border-gray-700'
                                }`}
                        >
                            <Text className={`text-[8px] font-bold ${ball.isWicket ? 'text-red-400' : ball.runs >= 4 ? 'text-green-400' : 'text-gray-400'
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
    const [internalExpanded, setInternalExpanded] = useState(defaultExpanded);
    const isExpanded = expanded !== undefined ? expanded : internalExpanded;

    const toggleExpanded = () => setInternalExpanded(!internalExpanded);

    const calcIntervalStats = (balls: Ball[]) => {
        const totalRuns = balls.reduce((acc, b) => acc + b.runs, 0);
        const wickets = balls.filter(b => b.isWicket).length;
        return { totalRuns, wickets };
    };

    return (
        <View className="mb-6 bg-gray-800 rounded-xl overflow-hidden">
            <TouchableOpacity
                activeOpacity={0.7}
                onPress={toggleExpanded}
                className="bg-gray-700 p-3 flex-row justify-between items-center"
            >
                <View className="flex-row items-center">
                    <Text className="text-gray-400 mr-2 text-xs">
                        {isExpanded ? '▼' : '▶'}
                    </Text>
                    <Text className="text-white font-bold text-lg">{title}</Text>
                </View>
            </TouchableOpacity>

            {isExpanded && (
                <View>
                    {/* Header */}
                    <View className="flex-row justify-between bg-gray-900/50 p-2 border-b border-gray-700">
                        <Text className="text-gray-500 text-xs font-bold uppercase w-16">{t('common.over')}</Text>
                        <Text className="text-gray-500 text-xs font-bold uppercase flex-1">{t('common.details')}</Text>
                        <View className="flex-row gap-4 w-24 justify-end">
                            <Text className="text-gray-500 text-xs font-bold uppercase text-right">{t('common.runs')}</Text>
                            <Text className="text-gray-500 text-xs font-bold uppercase text-right">{t('common.wks')}</Text>
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
                            <Text className="text-gray-500 italic">{t('common.noOversBowled')}</Text>
                        </View>
                    )}
                </View>
            )}
        </View>
    );
};
