import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Series, SeriesTally } from '../types';

interface SeriesBannerProps {
    series: Series;
    tally: SeriesTally;
    onEnd: () => void;
    onView?: () => void;
}

// Shows the running score of the active series on the setup screen.
export const SeriesBanner = ({ series, tally, onEnd, onView }: SeriesBannerProps) => {
    const { t } = useTranslation();

    return (
        <View className="mb-6 bg-blue-600/10 p-4 rounded-2xl border border-blue-500/30">
            <View className="flex-row justify-between items-center mb-2">
                <Text className="text-blue-400 text-[10px] font-black uppercase tracking-widest">{t('common.series')}</Text>
                <Text className="text-gray-400 text-xs font-bold">{t('common.matchNumber', { n: tally.played + 1 })}</Text>
            </View>

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

            <Text className="text-gray-400 text-xs mt-3">{t('common.teamsLockedInSeries')}</Text>

            <View className="flex-row gap-3 mt-3">
                {onView && tally.played > 0 && (
                    <TouchableOpacity onPress={onView} className="flex-1 p-3 bg-gray-700 rounded-xl items-center">
                        <Text className="text-gray-200 font-bold">{t('common.viewSeries')}</Text>
                    </TouchableOpacity>
                )}
                <TouchableOpacity
                    onPress={onEnd}
                    className="flex-1 p-3 bg-red-900/20 rounded-xl items-center border border-red-900/40"
                >
                    <Text className="text-red-500 font-bold">{t('common.endSeries')}</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};
