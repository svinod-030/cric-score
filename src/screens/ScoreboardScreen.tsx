import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMatchStore } from '../store/useMatchStore';
import { useAuthStore } from '../store/useAuthStore';
import { backupToDrive } from '../utils/backupService';
import { ExtraType } from '../types/match';
import { BowlerSelectionModal } from '../components/BowlerSelectionModal';
import { ScorecardSection } from '../components/ScorecardSection';

export default function ScoreboardScreen({ navigation }: any) {
    const { state, recordBall, resetMatch, setBowler } = useMatchStore();
    const innings = state.currentInnings === 1 ? state.innings1 : state.innings2;
    const currentOverValidBalls = innings.currentOver.filter(b => b.isValidBall).length;

    // Derived Rosters
    const bowlingTeamPlayers = innings.battingTeam === state.teamA ? state.teamBPlayers : state.teamAPlayers;

    const [isBowlerModalVisible, setBowlerModalVisible] = useState(false);

    useEffect(() => {
        const handleMatchEnd = async () => {
            if (!state.isPlaying && state.matchResult) {
                // If authenticated, backup immediately
                const { isAuthenticated, accessToken } = useAuthStore.getState();
                if (isAuthenticated && accessToken) {
                    console.log('Match completed, triggering auto-backup...');
                    backupToDrive(accessToken); // Fire and forget in background
                }
                navigation.replace('MatchResult');
            }
        };

        handleMatchEnd();
    }, [state.isPlaying, state.matchResult]);

    // Check for missing bowler
    useEffect(() => {
        if (state.isPlaying && !innings.currentBowlerId) {
            setBowlerModalVisible(true);
        } else {
            setBowlerModalVisible(false);
        }
    }, [state.isPlaying, innings.currentBowlerId]);

    const handleScore = (runs: number) => {
        recordBall(runs, 'none', false);
    };

    const handleExtra = (type: ExtraType) => {
        recordBall(0, type, false);
    };

    const handleWicket = () => {
        recordBall(0, 'none', true);
    };

    // Stats Helpers
    const getBatterStats = (id: string) => innings.battingStats[id] || { runs: 0, ballsFaced: 0, fours: 0, sixes: 0 };
    const getBowlerStats = (id: string | null) => id ? innings.bowlingStats[id] || { overs: 0, runsConceded: 0, wickets: 0, balls: 0 } : null;

    const getPlayerName = (id: string) => {
        const player = [...state.teamAPlayers, ...state.teamBPlayers].find(p => p.id === id);
        return player ? player.name : id;
    };

    const strikerStats = getBatterStats(innings.strikerId);
    const nonStrikerStats = getBatterStats(innings.nonStrikerId);
    const currentBowlerStats = getBowlerStats(innings.currentBowlerId);
    // Calculate partial overs for display (e.g. 1.2)
    const bowlerOversDisplay = currentBowlerStats
        ? `${currentBowlerStats.overs}.${currentBowlerStats.balls % 6}`
        : "0.0";


    return (
        <SafeAreaView className="flex-1 bg-gray-900" edges={['bottom', 'left', 'right']}>
            {/* Header / Score */}
            <View className="p-6 pb-2 border-b border-gray-800">
                <Text className="text-gray-400 text-center font-medium mb-1">
                    {innings.battingTeam} Batting
                </Text>
                <View className="items-center mb-6">
                    <Text className="text-6xl font-black text-white">
                        {innings.totalRuns}/{innings.totalWickets}
                    </Text>
                    <Text className="text-xl text-gray-400 mt-2">
                        Overs: {innings.overs.length}.{currentOverValidBalls} ({state.overs})
                    </Text>

                    {state.currentInnings === 2 && (
                        <View className="mt-4 bg-gray-800 px-4 py-2 rounded-lg">
                            <Text className="text-yellow-500 font-bold text-lg text-center">
                                Target: {state.innings1.totalRuns + 1}
                            </Text>
                            <Text className="text-gray-300 text-sm text-center mt-1">
                                Need {state.innings1.totalRuns + 1 - innings.totalRuns} runs in {(state.overs * 6) - (innings.overs.length * 6 + currentOverValidBalls)} balls
                            </Text>
                        </View>
                    )}
                </View>

                {/* Player Stats Bar */}
                <View className="flex-row justify-between bg-gray-800 p-3 rounded-xl mb-4">
                    <View>
                        <Text className="text-white font-bold text-lg">
                            {getPlayerName(innings.strikerId)}*
                        </Text>
                        <Text className="text-gray-400">
                            {strikerStats.runs} ({strikerStats.ballsFaced})
                        </Text>
                    </View>
                    <View className="items-end">
                        <Text className="text-white font-bold text-lg">
                            {getPlayerName(innings.nonStrikerId)}
                        </Text>
                        <Text className="text-gray-400">
                            {nonStrikerStats.runs} ({nonStrikerStats.ballsFaced})
                        </Text>
                    </View>
                </View>

                {/* Current Bowler Bar */}
                <View className="flex-row justify-between items-center bg-gray-800 p-3 rounded-xl mb-4">
                    <View>
                        <Text className="text-gray-400 text-xs uppercase font-bold">Bowler</Text>
                        <Text className="text-white font-bold text-lg">
                            {innings.currentBowlerId ? getPlayerName(innings.currentBowlerId) : "Select Bowler"}
                        </Text>
                    </View>
                    <View className="items-end">
                        <Text className="text-white font-bold">
                            {currentBowlerStats ? `${currentBowlerStats.wickets}-${currentBowlerStats.runsConceded}` : "0-0"}
                        </Text>
                        <Text className="text-gray-400 text-xs">
                            {bowlerOversDisplay} Overs
                        </Text>
                    </View>
                </View>


                <View className="mb-4">
                    <Text className="text-gray-400 mb-2 text-sm">This Over:</Text>
                    <View className="flex-row gap-2 min-h-[32px]">
                        {innings.currentOver.length > 0 ? (
                            innings.currentOver.map((ball, idx) => (
                                <View
                                    key={idx}
                                    className={`w-8 h-8 rounded-full items-center justify-center ${ball.isWicket ? 'bg-red-600' : ball.extraType !== 'none' ? 'bg-yellow-600' : ball.runs >= 4 ? 'bg-green-600' : 'bg-gray-700'}`}
                                >
                                    <Text className="text-white font-bold text-xs">
                                        {ball.isWicket ? 'W' : ball.extraType !== 'none' ? ball.extraType === 'wide' ? 'WD' : 'NB' : ball.runs}
                                    </Text>
                                </View>
                            ))
                        ) : (
                            <Text className="text-gray-600 text-sm italic">-</Text>
                        )}
                    </View>
                </View>
            </View>

            <ScrollView className="flex-1 p-4">
                <View className="flex-col gap-4">
                    {/* Runs Grid */}
                    <View className="flex-row gap-4 justify-between">
                        {[0, 1, 2, 3].map(run => (
                            <TouchableOpacity
                                key={run}
                                onPress={() => handleScore(run)}
                                className="flex-1 aspect-square bg-gray-800 rounded-2xl items-center justify-center border border-gray-700 active:bg-gray-700"
                            >
                                <Text className="text-white text-3xl font-bold">{run}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <View className="flex-row gap-4 justify-between">
                        {[4, 6].map(run => (
                            <TouchableOpacity
                                key={run}
                                onPress={() => handleScore(run)}
                                className="flex-1 aspect-video bg-gray-800 rounded-2xl items-center justify-center border border-gray-700 active:bg-gray-700"
                            >
                                <Text className="text-white text-3xl font-bold">{run}</Text>
                            </TouchableOpacity>
                        ))}
                        <TouchableOpacity
                            onPress={handleWicket}
                            className="flex-1 aspect-video bg-red-900/50 rounded-2xl items-center justify-center border border-red-700 active:bg-red-800/50"
                        >
                            <Text className="text-red-500 text-2xl font-bold">Wicket</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Extras */}
                    <Text className="text-gray-400 mt-4 mb-2">Extras</Text>
                    <View className="flex-row gap-4">
                        <TouchableOpacity
                            onPress={() => handleExtra('wide')}
                            className="flex-1 h-14 bg-gray-800 rounded-xl items-center justify-center border border-gray-700"
                        >
                            <Text className="text-yellow-500 font-bold text-lg">Wide</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => handleExtra('no-ball')}
                            className="flex-1 h-14 bg-gray-800 rounded-xl items-center justify-center border border-gray-700"
                        >
                            <Text className="text-yellow-500 font-bold text-lg">No Ball</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Full Scorecard Section */}
                    <View className="mt-10 mb-20">
                        <Text className="text-white text-2xl font-bold mb-4 px-2">Scorecard</Text>

                        {state.currentInnings === 2 && (
                            <View className="mb-8">
                                <ScorecardSection
                                    title={`Innings 1: ${state.innings1.battingTeam}`}
                                    innings={state.innings1}
                                    battingTeamPlayers={state.innings1.battingTeam === state.teamA ? state.teamAPlayers : state.teamBPlayers}
                                    bowlingTeamPlayers={state.innings1.battingTeam === state.teamA ? state.teamBPlayers : state.teamAPlayers}
                                />
                            </View>
                        )}

                        <ScorecardSection
                            title={`${state.currentInnings === 2 ? 'Innings 2' : 'Innings 1'}: ${innings.battingTeam}`}
                            innings={innings}
                            battingTeamPlayers={innings.battingTeam === state.teamA ? state.teamAPlayers : state.teamBPlayers}
                            bowlingTeamPlayers={innings.battingTeam === state.teamA ? state.teamBPlayers : state.teamAPlayers}
                        />
                    </View>

                </View>
            </ScrollView>

            <BowlerSelectionModal
                visible={isBowlerModalVisible}
                players={bowlingTeamPlayers}
                onSelect={setBowler}
            />
        </SafeAreaView>
    );
}
