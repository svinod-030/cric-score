import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Series, SeriesTally } from '../types';

interface SeriesResultCardProps {
    series: Series;
    tally: SeriesTally;
    onView: () => void;
    onEnd?: () => void; // Only passed while the series is active
}

// Shown on the result screen of a match that belongs to a series.
export const SeriesResultCard = ({ series, tally, onView, onEnd }: SeriesResultCardProps) => {
    const { t } = useTranslation();

    return (
        <View className="bg-gray-800 p-4 rounded-2xl border border-gray-700 mb-4">
            <Text className="text-blue-400 text-[10px] font-black uppercase tracking-widest mb-2">
                {t('common.series')}
            </Text>

            <View className="flex-row justify-between items-center">
                <Text className="text-white font-bold flex-1" numberOfLines={1}>{series.teamA}</Text>
                <Text className="text-white text-2xl font-black mx-3">{tally.winsA} - {tally.winsB}</Text>
                <Text className="text-white font-bold flex-1 text-right" numberOfLines={1}>{series.teamB}</Text>
            </View>

            {tally.ties + tally.noResult > 0 && (
                <Text className="text-gray-400 text-xs text-center mt-1">
                    {t('common.seriesTiesNoResult', { count: tally.ties + tally.noResult })}
                </Text>
            )}

            <View className="flex-row gap-3 mt-4">
                <TouchableOpacity onPress={onView} className="flex-1 p-3 bg-gray-700 rounded-xl items-center">
                    <Text className="text-gray-200 font-bold">{t('common.viewSeries')}</Text>
                </TouchableOpacity>
                {onEnd && (
                    <TouchableOpacity
                        onPress={onEnd}
                        className="flex-1 p-3 bg-red-900/20 rounded-xl items-center border border-red-900/40"
                    >
                        <Text className="text-red-500 font-bold">{t('common.endSeries')}</Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
};
