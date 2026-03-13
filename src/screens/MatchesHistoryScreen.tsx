import { View, Text, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMatchStore } from '../store/useMatchStore';
import { useAuthStore } from '../store/useAuthStore';
import { restoreFromDrive } from '../utils/backupService';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { LiveMatchCard } from '../components/LiveMatchCard';
import { useTranslation } from 'react-i18next';

export default function MatchesHistoryScreen() {
    const { t } = useTranslation();
    const { state, history, restoreMatches } = useMatchStore();
    const { isAuthenticated } = useAuthStore();
    const [isRestoring, setIsRestoring] = useState(false);
    const navigation = useNavigation<any>();

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

    return (
        <SafeAreaView className="flex-1 bg-gray-900" edges={['left', 'right']}>
            <ScrollView className="p-4">
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

                {history.length === 0 ? (
                    <Text className="text-gray-500 text-center py-10">{t('common.noCompletedMatches')}</Text>
                ) : (
                    history.map((match, index) => {
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

                        return (
                            <TouchableOpacity
                                key={index}
                                className="bg-gray-800/40 p-3 rounded-xl mb-3 border border-gray-700/50"
                                onPress={() => navigation.navigate('MatchResult', { matchData: match })}
                            >
                                <View className="flex-row items-center justify-between">
                                    {/* Team A */}
                                    <View className={`flex-1 items-center py-2 px-1 rounded-xl ${isTeamAWinner ? 'bg-blue-500/10' : ''}`}>
                                        <Text className={`text-white font-bold text-sm mb-1 text-center ${isTeamAWinner ? 'text-yellow-500' : ''}`} numberOfLines={1}>{match.teamA}</Text>
                                        <View className="flex-row items-baseline">
                                            <Text className="text-white text-2xl font-black">{teamAScore}</Text>
                                            <Text className="text-gray-500 text-xl font-bold ml-0.5">/{teamAWickets}</Text>
                                        </View>
                                        {isTeamAWinner && <Ionicons name="trophy" size={12} color="#EAB308" style={{ marginTop: 2 }} />}
                                    </View>

                                    {/* Info Middle */}
                                    <View className="px-2 items-center">
                                        <Text className="text-gray-600 font-black italic text-base mb-1">VS</Text>
                                        <View className="bg-gray-700/50 px-2 py-0.5 rounded">
                                            <Text className="text-[10px] text-gray-400 font-bold uppercase">
                                                {match.completedAt ? new Date(match.completedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : t('common.completed')}
                                            </Text>
                                        </View>
                                    </View>

                                    {/* Team B */}
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
                    })
                )}

                <View className="h-20" />
            </ScrollView>
        </SafeAreaView>
    );
}
