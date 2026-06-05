import React from 'react';
import { View, Text, FlatList } from 'react-native';
import { Ball } from '../types/match';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '../hooks/useAppTheme';

interface OverHistoryProps {
    overs: { balls: Ball[], bowlerId: string }[];
    runsForNoBall: number;
    runsForWide: number;
}

export const OverHistory = ({ overs, runsForNoBall, runsForWide }: OverHistoryProps) => {
    const { t } = useTranslation();
    const { isDark } = useAppTheme();
    if (overs.length === 0) return null;

    return (
        <View className="mb-4">
            <Text className={`mb-2 text-sm font-bold ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('common.previousOvers')}</Text>
            <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingRight: 20 }}
                data={overs.slice().reverse()}
                keyExtractor={(_, index) => `over-${index}`}
                renderItem={({ item: over, index }) => {
                    const overNumber = overs.length - index;
                    return (
                        <View className={`mr-3 p-2 rounded-xl min-w-[160px] border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-100 border-gray-300'}`}>
                            <Text className={`text-xs mb-2 font-bold uppercase tracking-wider ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{t('common.over')} {overNumber}</Text>
                            <View className="flex-row flex-wrap gap-1.5">
                                {over.balls.map((ball, idx) => (
                                    <View
                                        key={idx}
                                        className={`w-7 h-7 rounded-full items-center justify-center border border-white/10 ${ball.isWicket ? 'bg-red-600' : ball.extraType !== 'none' ? 'bg-yellow-600' : ball.runs >= 4 ? 'bg-green-600' : isDark ? 'bg-gray-700' : 'bg-gray-400'}`}
                                    >
                                        <View className="flex-row items-center">
                                            <Text className="text-white font-bold text-[10px]">
                                                {ball.isWicket ? 'W' : ball.extraType !== 'none' ? ball.extraType === 'wide' ? 'WD' : ball.extraType === 'no-ball' ? 'NB' : ball.extraType === 'bye' ? 'B' : 'LB' : ball.runs}
                                            </Text>
                                            {(ball.extraType === 'bye' || ball.extraType === 'leg-bye' || (ball.isWicket && ball.runs > 0) || (ball.extraType === 'no-ball' && ball.runs > runsForNoBall) || (ball.extraType === 'wide' && ball.runs > runsForWide)) && (
                                                <Text className="text-white font-bold text-[8px] ml-0.5">+{ball.extraType === 'no-ball' ? ball.runs - runsForNoBall : ball.extraType === 'wide' ? ball.runs - runsForWide : ball.runs}</Text>
                                            )}
                                        </View>
                                    </View>
                                ))}
                            </View>
                        </View>
                    );
                }}
            />
        </View>
    );
};
