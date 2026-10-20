import { View, Text, TouchableOpacity, FlatList, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMatchStore } from '../store/useMatchStore';
import { useAuthStore } from '../store/useAuthStore';
import { restoreFromDrive } from '../utils/backupService';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import { LiveMatchCard } from '../components/LiveMatchCard';
import { useTranslation } from 'react-i18next';
import { useSeriesStore } from '../features/series/useSeriesStore';
import { computeTally, deriveSeries, groupHistory } from '../features/series/seriesUtils';
import { HistoryGroup } from '../features/series/types';
import { restoreSeriesFromBackup } from '../features/series/seriesBackup';

export default function MatchesHistoryScreen() {
    const { t } = useTranslation();
    const { history, restoreMatches, deleteMatch } = useMatchStore();
    const { isAuthenticated } = useAuthStore();
    const [isRestoring, setIsRestoring] = useState(false);
    const navigation = useNavigation<any>();
    const allSeries = useSeriesStore((s) => s.series);
    const deleteSeries = useSeriesStore((s) => s.deleteSeries);

    // History is a list of series; an individual match is a series of one.
    const groups = useMemo(() => groupHistory(history || []), [history]);

    const confirmDeleteSeries = (seriesId: string) => {
        Alert.alert(t('common.deleteSeries'), t('common.deleteSeriesMsg'), [
            { text: t('common.cancel'), style: 'cancel' },
            {
                text: t('common.delete'),
                style: 'destructive',
                onPress: () => {
                    if (!deleteSeries(seriesId).ok) {
                        Alert.alert(t('common.deleteSeries'), t('common.deleteSeriesBlocked'));
                    }
                },
            },
        ]);
    };

    const handleRestore = async () => {
        if (!isAuthenticated) return;

        Alert.alert(
            t('common.restoreMatches'),
            t('common.restoreMatchesMsg'),
            [
                { text: t('common.cancel'), style: "cancel" },
                {
                    text: t('common.restore'),
                    onPress: async () => {
                        setIsRestoring(true);
                        try {
                            const backupData = await restoreFromDrive();
                            if (backupData) {
                                restoreMatches(backupData);
                                restoreSeriesFromBackup(backupData);
                                Alert.alert(t('common.success'), t('common.matchesRestored'));
                            } else {
                                Alert.alert(t('common.notFound'), t('common.noBackupFound'));
                            }
                        } catch (error) {
                            Alert.alert(t('common.error'), t('common.failedRestore'));
                        } finally {
                            setIsRestoring(false);
                        }
                    }
                }
            ]
        );
    };


    const renderHeader = () => (
        <>
            <View className="flex-row justify-between items-center mb-6">
                <Text className="text-white text-3xl font-bold">{t('common.matches')}</Text>
                {isAuthenticated && (
                    <TouchableOpacity
                        onPress={handleRestore}
                        disabled={isRestoring}
                        className={`flex-row items-center px-4 py-2 rounded-xl border border-blue-500/30 ${isRestoring ? 'bg-gray-800' : 'bg-blue-600/10'}`}
                    >
                        {isRestoring ? (
                            <ActivityIndicator size="small" color="#3B82F6" className="mr-2" />
                        ) : (
                            <Ionicons name="cloud-download" size={18} color="#3B82F6" className="mr-2" />
                        )}
                        <Text className="text-blue-500 font-bold">{t('common.restore')}</Text>
                    </TouchableOpacity>
                )}
            </View>

            <LiveMatchCard
                variant="gray"
                showInningsBadge={true}
                containerStyle="mb-6"
            />

            <Text className="text-white text-xl font-bold mb-4">{t('common.history')}</Text>
        </>
    );

    const renderEmpty = () => (
        <Text className="text-gray-500 text-center py-10">{t('common.noCompletedMatches')}</Text>
    );

    const renderMatchRow = (match: any) => {
        const matchSeries = match.seriesId ? allSeries.find(x => x.id === match.seriesId) : undefined;
        const isTeamAWinner = match.matchResult?.winner === match.teamA;
        const isTeamBWinner = match.matchResult?.winner === match.teamB;

        const getTeamInnings = (teamName: string) => {
            if (match.innings1?.battingTeam === teamName) return match.innings1;
            if (match.innings2?.battingTeam === teamName) return match.innings2;
            if (match.innings1?.battingTeamKey === (teamName === match.teamA ? 'teamA' : 'teamB')) return match.innings1;
            if (match.innings2?.battingTeamKey === (teamName === match.teamA ? 'teamA' : 'teamB')) return match.innings2;
            return null;
        };

        const teamAInnings = getTeamInnings(match.teamA);
        const teamBInnings = getTeamInnings(match.teamB);

        const teamAScore = teamAInnings?.totalRuns || 0;
        const teamAWickets = teamAInnings?.totalWickets || 0;
        const teamBScore = teamBInnings?.totalRuns || 0;
        const teamBWickets = teamBInnings?.totalWickets || 0;

        const handleDelete = () => {
            // A match that belongs to a series can only be deleted together with the series
            if (match.seriesId) {
                confirmDeleteSeries(match.seriesId);
                return;
            }
            if (!match.completedAt) return;
            Alert.alert(
                t('common.deleteMatch'),
                t('common.deleteMatchMsg'),
                [
                    { text: t('common.cancel'), style: "cancel" },
                    {
                        text: t('common.delete'),
                        style: "destructive",
                        onPress: () => deleteMatch(match.completedAt!)
                    }
                ]
            );
        };

        return (
            <TouchableOpacity
                className="bg-gray-800/40 p-3 rounded-xl mb-3 border border-gray-700/50"
                onPress={() => navigation.navigate('MatchResult', { matchData: match })}
            >
                <View className="flex-row justify-between items-start mb-2">
                    <View className="flex-row items-center gap-2">
                        <View className="bg-gray-700/50 px-2 py-0.5 rounded">
                            <Text className="text-[10px] text-gray-400 font-bold uppercase">
                                {match.completedAt ? new Date(match.completedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : t('common.completed')}
                            </Text>
                        </View>
                        {match.seriesId && (
                            <View className="bg-blue-600/10 border border-blue-500/30 px-2 py-0.5 rounded">
                                <Text className="text-[10px] text-blue-400 font-bold uppercase">
                                    {t('common.series')}{matchSeries && !matchSeries.endedAt ? ` · ${t('common.seriesLive')}` : ''}
                                </Text>
                            </View>
                        )}
                    </View>
                    <TouchableOpacity
                        onPress={handleDelete}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <Ionicons name="trash-outline" size={16} color="#EF4444" />
                    </TouchableOpacity>
                </View>

                <View className="flex-row items-center justify-between">
                    <View className={`flex-1 items-center py-2 px-1 rounded-xl ${isTeamAWinner ? 'bg-blue-500/10' : ''}`}>
                        <Text className={`text-white font-bold text-sm mb-1 text-center ${isTeamAWinner ? 'text-yellow-500' : ''}`} numberOfLines={1}>{match.teamA}</Text>
                        <View className="flex-row items-baseline">
                            <Text className="text-white text-2xl font-black">{teamAScore}</Text>
                            <Text className="text-gray-500 text-xl font-bold ml-0.5">/{teamAWickets}</Text>
                        </View>
                        {isTeamAWinner && <Ionicons name="trophy" size={12} color="#EAB308" style={{ marginTop: 2 }} />}
                    </View>

                    <View className="px-2 items-center">
                        <Text className="text-gray-600 font-black italic text-base">VS</Text>
                    </View>

                    <View className={`flex-1 items-center py-2 px-1 rounded-xl ${isTeamBWinner ? 'bg-blue-500/10' : ''}`}>
                        <Text className={`text-white font-bold text-sm mb-1 text-center ${isTeamBWinner ? 'text-yellow-500' : ''}`} numberOfLines={1}>{match.teamB}</Text>
                        <View className="flex-row items-baseline">
                            <Text className="text-white text-2xl font-black">{teamBScore}</Text>
                            <Text className="text-gray-500 text-xl font-bold ml-0.5">/{teamBWickets}</Text>
                        </View>
                        {isTeamBWinner && <Ionicons name="trophy" size={12} color="#EAB308" style={{ marginTop: 2 }} />}
                    </View>
                </View>

                <View className="mt-3 pt-2 border-t border-gray-700/30">
                    <Text className="text-gray-400 text-center font-bold text-xs" numberOfLines={1}>
                        {match.matchResult?.winner === 'Draw'
                            ? t('common.matchDrawn')
                            : `${match.matchResult?.winner} ${match.matchResult?.resultType === 'runs'
                                ? t('common.wonByRuns', { count: match.matchResult.margin }).toLowerCase()
                                : match.matchResult?.resultType === 'wickets'
                                    ? t('common.wonByWickets', { count: match.matchResult.margin }).toLowerCase()
                                    : match.matchResult?.reason || ''
                            }`}
                    </Text>
                </View>
            </TouchableOpacity>
        );
    };

    const renderSeriesCard = (group: HistoryGroup) => {
        const seriesId = group.seriesId!;
        const series = allSeries.find(x => x.id === seriesId) ?? deriveSeries(seriesId, history);
        if (!series) return renderMatchRow(group.matches[0]);

        const tally = computeTally(history, series);
        const isLive = !series.endedAt;
        const latest = group.matches[0];

        return (
            <TouchableOpacity
                className="bg-blue-600/10 p-3 rounded-xl mb-3 border border-blue-500/30"
                onPress={() => navigation.navigate('SeriesSummary', { seriesId })}
            >
                <View className="flex-row justify-between items-start mb-2">
                    <View className="flex-row items-center gap-2">
                        <View className="bg-blue-600/20 px-2 py-0.5 rounded">
                            <Text className="text-[10px] text-blue-300 font-bold uppercase">
                                {t('common.seriesMatchCount', { count: group.matches.length })}
                            </Text>
                        </View>
                        {isLive && (
                            <View className="bg-green-600/20 px-2 py-0.5 rounded">
                                <Text className="text-[10px] text-green-400 font-bold uppercase">{t('common.seriesLive')}</Text>
                            </View>
                        )}
                    </View>
                    <TouchableOpacity
                        onPress={() => confirmDeleteSeries(seriesId)}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <Ionicons name="trash-outline" size={16} color="#EF4444" />
                    </TouchableOpacity>
                </View>

                <View className="flex-row items-center justify-between">
                    <View className="flex-1 items-center py-2 px-1">
                        <Text className={`font-bold text-sm mb-1 text-center ${tally.winsA > tally.winsB ? 'text-yellow-500' : 'text-white'}`} numberOfLines={1}>{series.teamA}</Text>
                        <Text className="text-white text-3xl font-black">{tally.winsA}</Text>
                        {tally.winsA > tally.winsB && <Ionicons name="trophy" size={12} color="#EAB308" style={{ marginTop: 2 }} />}
                    </View>
                    <View className="px-2 items-center">
                        <Text className="text-gray-600 font-black italic text-base">VS</Text>
                    </View>
                    <View className="flex-1 items-center py-2 px-1">
                        <Text className={`font-bold text-sm mb-1 text-center ${tally.winsB > tally.winsA ? 'text-yellow-500' : 'text-white'}`} numberOfLines={1}>{series.teamB}</Text>
                        <Text className="text-white text-3xl font-black">{tally.winsB}</Text>
                        {tally.winsB > tally.winsA && <Ionicons name="trophy" size={12} color="#EAB308" style={{ marginTop: 2 }} />}
                    </View>
                </View>

                <View className="mt-3 pt-2 border-t border-gray-700/30">
                    <Text className="text-gray-400 text-center font-bold text-xs">
                        {latest.completedAt ? new Date(latest.completedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : ''}
                        {tally.ties + tally.noResult > 0 ? ` · ${t('common.seriesTiesNoResult', { count: tally.ties + tally.noResult })}` : ''}
                    </Text>
                </View>
            </TouchableOpacity>
        );
    };

    const renderItem = ({ item: group }: { item: HistoryGroup }) =>
        group.seriesId && group.matches.length > 1 ? renderSeriesCard(group) : renderMatchRow(group.matches[0]);

    return (
        <SafeAreaView className="flex-1 bg-gray-900" edges={['left', 'right']}>
            <FlatList
                data={groups}
                keyExtractor={(item) => item.key}
                renderItem={renderItem}
                ListHeaderComponent={renderHeader}
                ListEmptyComponent={renderEmpty}
                contentContainerStyle={{ padding: 16, paddingBottom: 80 }}
                showsVerticalScrollIndicator={false}
                initialNumToRender={10}
                maxToRenderPerBatch={10}
                windowSize={5}
            />
        </SafeAreaView>
    );
}
