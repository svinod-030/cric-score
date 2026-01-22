import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { InningsState, Over, Ball } from '../types/match';

interface OverSummarySectionProps {
    title: string;
    innings: InningsState;
    defaultExpanded?: boolean;
}

const OverRow = ({ overNum, balls, runs, wickets }: { overNum: string, balls: Ball[], runs: number, wickets: number }) => {
    return (
        <View className="flex-row justify-between items-center p-3 border-b border-gray-700/50">
            <View className="flex-row items-center flex-1">
                <Text className="text-gray-400 font-bold w-16">{overNum}</Text>
                <View className="flex-row flex-wrap gap-1 flex-1">
                    {balls.map((ball, idx) => (
                        <View
                            key={idx}
                            className={`w-5 h-5 rounded-full items-center justify-center ${ball.isWicket ? 'bg-red-900/50 border border-red-800' : ball.runs >= 4 ? 'bg-green-900/50 border border-green-800' : 'bg-gray-800 border border-gray-700'
                                }`}
                        >
                            <Text className={`text-[8px] font-bold ${ball.isWicket ? 'text-red-400' : ball.runs >= 4 ? 'text-green-400' : 'text-gray-400'
                                }`}>
                                {ball.isWicket ? 'W' : ball.extraType !== 'none' ? (ball.extraType === 'wide' ? 'wd' : ball.extraType === 'no-ball' ? 'nb' : 'ex') : ball.runs}
                            </Text>
                        </View>
                    ))}
                </View>
            </View>
            <View className="flex-row gap-4 w-24 justify-end">
                <Text className="text-gray-300 font-bold">{runs} runs</Text>
                <Text className="text-red-400 font-bold">{wickets > 0 ? `${wickets} wkt` : '-'}</Text>
            </View>
        </View>
    );
};

export const OverSummarySection = ({ title, innings, defaultExpanded = false }: OverSummarySectionProps) => {
    const [isExpanded, setIsExpanded] = useState(defaultExpanded);

    const toggleExpanded = () => setIsExpanded(!isExpanded);

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
                        <Text className="text-gray-500 text-xs font-bold uppercase w-16">Over</Text>
                        <Text className="text-gray-500 text-xs font-bold uppercase flex-1">Details</Text>
                        <View className="flex-row gap-4 w-24 justify-end">
                            <Text className="text-gray-500 text-xs font-bold uppercase text-right">Runs</Text>
                            <Text className="text-gray-500 text-xs font-bold uppercase text-right">Wks</Text>
                        </View>
                    </View>

                    {innings.overs.map((over, idx) => {
                        const { totalRuns, wickets } = calcIntervalStats(over.balls);
                        return (
                            <OverRow
                                key={idx}
                                overNum={`Over ${idx + 1}`}
                                balls={over.balls}
                                runs={totalRuns}
                                wickets={wickets}
                            />
                        );
                    })}

                    {/* Current Over */}
                    {innings.currentOver.length > 0 && (
                        <OverRow
                            overNum={`Over ${innings.overs.length + 1}`}
                            balls={innings.currentOver}
                            runs={calcIntervalStats(innings.currentOver).totalRuns}
                            wickets={calcIntervalStats(innings.currentOver).wickets}
                        />
                    )}

                    {innings.overs.length === 0 && innings.currentOver.length === 0 && (
                        <View className="p-4 items-center">
                            <Text className="text-gray-500 italic">No overs bowled yet</Text>
                        </View>
                    )}
                </View>
            )}
        </View>
    );
};
