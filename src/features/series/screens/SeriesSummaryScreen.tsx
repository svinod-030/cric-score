import React, { useMemo, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ViewShot from 'react-native-view-shot';
import Share from 'react-native-share';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useMatchStore } from '../../../store/useMatchStore';
import { APP_CONFIG } from '../../../utils/constants';
import { useSeriesStore } from '../useSeriesStore';
import { computeSeriesAwards, computeTally, deriveSeries, getMatchScores, getSeriesMatches } from '../seriesUtils';

const AWARD_STYLE = {
    mvp: { icon: 'star', color: '#EAB308', labelKey: 'common.playerOfSeries' },
    bestBatsman: { icon: 'medal', color: '#FCA5A5', labelKey: 'common.bestBatsman' },
    bestBowler: { icon: 'flash', color: '#93C5FD', labelKey: 'common.bestBowler' },
} as const;

export default function SeriesSummaryScreen({ navigation, route }: any) {
    const { t } = useTranslation();
    const seriesId: string = route.params?.seriesId;
    const history = useMatchStore((s) => s.history);
    const storedSeries = useSeriesStore((s) => s.series.find(x => x.id === seriesId));
    const endSeries = useSeriesStore((s) => s.endSeries);
    const deleteSeries = useSeriesStore((s) => s.deleteSeries);
    const viewShotRef = useRef<any>(null);
    const [isSharing, setIsSharing] = useState(false);

    const series = storedSeries ?? deriveSeries(seriesId, history);
    const matches = useMemo(() => (series ? getSeriesMatches(history, series) : []), [history, series]);
    const tally = series ? computeTally(history, series) : undefined;
    const awards = useMemo(() => computeSeriesAwards(matches), [matches]);
    const isActive = !!storedSeries && !storedSeries.endedAt;

    if (!series || !tally) {
        return (
            <SafeAreaView className="flex-1 bg-gray-900 items-center justify-center" edges={['bottom', 'left', 'right']}>
                <Text className="text-white mb-4">{t('common.seriesNotFound')}</Text>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text className="text-blue-500">{t('common.goBack')}</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    const handleEnd = () => {
        Alert.alert(t('common.endSeries'), t('common.endSeriesMsg'), [
            { text: t('common.cancel'), style: 'cancel' },
            { text: t('common.endSeries'), style: 'destructive', onPress: () => endSeries(series.id) },
        ]);
    };

    const handleDelete = () => {
        Alert.alert(t('common.deleteSeries'), t('common.deleteSeriesMsg'), [
            { text: t('common.cancel'), style: 'cancel' },
            {
                text: t('common.delete'),
                style: 'destructive',
                onPress: () => {
                    const result = deleteSeries(series.id);
                    if (!result.ok) {
                        Alert.alert(t('common.deleteSeries'), t('common.deleteSeriesBlocked'));
                        return;
                    }
                    navigation.goBack();
                },
            },
        ]);
    };

    const handleShare = async () => {
        try {
            setIsSharing(true);
            await new Promise(resolve => setTimeout(resolve, 300));
            const uri = await viewShotRef.current.capture();
            setIsSharing(false);

            const title = `${series.teamA} ${tally.winsA} - ${tally.winsB} ${series.teamB}`;
            await Share.open({
                title,
                message: `🏆 ${title}\n\n${t('common.shareResultPromo')}\n📲 ${t('common.downloadAppPrompt', { link: APP_CONFIG.STORE_URL_ANDROID })}`,
                url: uri,
                type: 'image/png',
            });
        } catch (error: any) {
            setIsSharing(false);
            if (error.message !== 'User did not share') {
                Alert.alert(t('common.error'), t('common.failedCaptureScoreboard'));
            }
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-900" edges={['bottom', 'left', 'right']}>
            <ScrollView className="flex-1">
                <ViewShot ref={viewShotRef} options={{ format: 'png', quality: 0.9 }} style={{ backgroundColor: '#111827' }}>
                    <View className="bg-gray-900 pb-4">
                        {/* Header */}
                        <View className="p-6 items-center border-b border-gray-800 mb-4">
                            <Text className="text-blue-400 text-[10px] font-black uppercase tracking-widest mb-2">
                                {t('common.series')} · {isActive ? t('common.seriesLive') : t('common.seriesEnded')}
                            </Text>
                            <View className="flex-row items-center justify-between w-full">
                                <Text className="text-white text-lg font-bold flex-1" numberOfLines={1}>{series.teamA}</Text>
                                <Text className="text-white text-4xl font-black mx-3">{tally.winsA} - {tally.winsB}</Text>
                                <Text className="text-white text-lg font-bold flex-1 text-right" numberOfLines={1}>{series.teamB}</Text>
                            </View>
                            {tally.ties + tally.noResult > 0 && (
                                <Text className="text-gray-400 text-xs mt-2">
                                    {t('common.seriesTiesNoResult', { count: tally.ties + tally.noResult })}
                                </Text>
                            )}
                        </View>

                        {/* Awards */}
                        {awards.length > 0 && (
                            <View className="px-4 mb-6">
                                <View className="bg-gray-800/50 rounded-2xl p-4 border border-gray-700">
                                    <Text className="text-white text-lg font-bold mb-4">
                                        <Ionicons name="trophy-outline" size={20} color="#EAB308" /> {t('common.seriesAwards')}
                                    </Text>
                                    <View className="flex-row flex-wrap justify-between" style={{ gap: 12 }}>
                                        {awards.map(award => {
                                            const style = AWARD_STYLE[award.type];
                                            return (
                                                <View
                                                    key={award.type}
                                                    className="bg-gray-900/80 p-3 rounded-xl border border-gray-800 items-center justify-center mb-3"
                                                    style={{ width: '47%' }}
                                                >
                                                    <View className="mb-2">
                                                        <Ionicons name={style.icon} size={24} color={style.color} />
                                                    </View>
                                                    <Text className="text-gray-400 text-[10px] uppercase font-bold tracking-tighter mb-1 text-center">
                                                        {t(style.labelKey)}
                                                    </Text>
                                                    <Text className="text-white font-bold text-center text-xs" numberOfLines={1}>{award.playerName}</Text>
                                                    <Text className="text-gray-500 text-[10px] mt-1 text-center">{award.stats}</Text>
                                                </View>
                                            );
                                        })}
                                    </View>
                                </View>
                            </View>
                        )}

                        {/* Matches (newest first) */}
                        <View className="px-4">
                            <Text className="text-white text-xl font-bold mb-3">{t('common.seriesMatches')}</Text>
                            {matches.map((match, index) => {
                                const scores = getMatchScores(match);
                                const result = match.matchResult;
                                return (
                                    <TouchableOpacity
                                        key={match.completedAt}
                                        className="bg-gray-800/40 p-3 rounded-xl mb-3 border border-gray-700/50"
                                        onPress={() => navigation.navigate('MatchResult', { matchData: match })}
                                    >
                                        <View className="flex-row justify-between mb-2">
                                            <Text className="text-[10px] text-gray-400 font-bold uppercase">
                                                {t('common.matchNumber', { n: matches.length - index })}
                                            </Text>
                                            <Text className="text-[10px] text-gray-500">
                                                {match.completedAt ? new Date(match.completedAt).toLocaleDateString() : ''}
                                            </Text>
                                        </View>
                                        <View className="flex-row justify-between">
                                            <Text className="text-white font-bold">{match.teamA}</Text>
                                            <Text className="text-white font-bold">{scores.teamARuns}/{scores.teamAWickets}</Text>
                                        </View>
                                        <View className="flex-row justify-between mt-1">
                                            <Text className="text-white font-bold">{match.teamB}</Text>
                                            <Text className="text-white font-bold">{scores.teamBRuns}/{scores.teamBWickets}</Text>
                                        </View>
                                        {result && (
                                            <Text className="text-yellow-500 text-xs mt-2">
                                                {result.winner === 'Draw' ? t('common.matchDrawn') : `${result.winner} ${t('common.winsExclamation')}`}
                                            </Text>
                                        )}
                                    </TouchableOpacity>
                                );
                            })}
                        </View>

                        <View className="p-4 items-center">
                            <Text className="text-gray-600 text-xs italic">{t('common.brandingFooter')}</Text>
                        </View>
                    </View>
                </ViewShot>

                <View className="p-6 pt-0">
                    <TouchableOpacity
                        className={`bg-green-600 w-full p-4 rounded-xl flex-row items-center justify-center gap-2 mb-4 ${isSharing ? 'opacity-50' : ''}`}
                        onPress={handleShare}
                        disabled={isSharing}
                    >
                        <Ionicons name="share-social" size={20} color="white" />
                        <Text className="text-white text-lg font-bold">{t('common.shareSeries')}</Text>
                    </TouchableOpacity>

                    {isActive && (
                        <TouchableOpacity
                            className="bg-gray-800 w-full p-4 rounded-xl items-center border border-gray-700 mb-4"
                            onPress={handleEnd}
                        >
                            <Text className="text-white text-lg font-bold">{t('common.endSeries')}</Text>
                        </TouchableOpacity>
                    )}

                    <TouchableOpacity
                        className="bg-red-500/10 w-full p-4 rounded-xl items-center border border-red-500/30 mb-8"
                        onPress={handleDelete}
                    >
                        <View className="flex-row items-center gap-2">
                            <Ionicons name="trash-outline" size={18} color="#EF4444" />
                            <Text className="text-red-500 text-lg font-bold">{t('common.deleteSeries')}</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
