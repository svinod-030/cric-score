import React from 'react';
import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { MatchState } from '../../../types/match';
import { useSeriesStore } from '../useSeriesStore';
import { computeTally } from '../seriesUtils';

interface SeriesTallyPillProps {
    seriesId?: string;
    history: MatchState[];
}

// Small read-only series score for the live scoreboard. Renders nothing for individual matches.
export const SeriesTallyPill = ({ seriesId, history }: SeriesTallyPillProps) => {
    const { t } = useTranslation();
    const series = useSeriesStore((s) => s.series.find(x => x.id === seriesId));

    if (!seriesId || !series) return null;

    const tally = computeTally(history, series);

    return (
        <View className="bg-blue-600/10 border border-blue-500/30 px-3 py-1 rounded-full mb-3 flex-row items-center gap-2">
            <Text className="text-blue-400 text-[10px] font-black uppercase tracking-widest">{t('common.series')}</Text>
            <Text className="text-gray-200 text-xs font-bold" numberOfLines={1}>
                {series.teamA} {tally.winsA} - {tally.winsB} {series.teamB}
            </Text>
            <Text className="text-gray-400 text-xs font-bold">· {t('common.matchNumber', { n: tally.played + 1 })}</Text>
        </View>
    );
};
