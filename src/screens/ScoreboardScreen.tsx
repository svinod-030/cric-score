import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMatchStore } from '../store/useMatchStore';
import { useAuthStore } from '../store/useAuthStore';
import { backupToDrive } from '../utils/backupService';
import { ExtraType } from '../types/match';
import { BowlerSelectionModal } from '../components/BowlerSelectionModal';
import { BatterSelectionModal } from '../components/BatterSelectionModal';
import { ScorecardSection } from '../components/ScorecardSection';
import { RunSelectionModal } from '../components/RunSelectionModal';
import { WicketTypeSelectionModal } from '../components/WicketTypeSelectionModal';
import { FielderSelectionModal } from '../components/FielderSelectionModal';
import { Ionicons } from '@expo/vector-icons';
import { WicketType } from '../types/match';

export default function ScoreboardScreen({ navigation }: any) {
    const { state, recordBall, resetMatch, setBowler, setStriker, setNonStriker, undoBall, swapBatsmen, retirePlayer, startSecondInnings } = useMatchStore();
    const innings = state.currentInnings === 1 ? state.innings1 : state.innings2;
    const currentOverValidBalls = innings.currentOver.filter(b => b.isValidBall).length;

    // Derived Rosters
    const bowlingTeamPlayers = innings.battingTeamKey === 'teamA' ? state.teamBPlayers : state.teamAPlayers;

    const [isBowlerModalVisible, setBowlerModalVisible] = useState(false);
    const [runModalVisible, setRunModalVisible] = useState(false);
    const [wicketModalVisible, setWicketModalVisible] = useState(false);
    const [fielderModalVisible, setFielderModalVisible] = useState(false);
    const [runModalConfig, setRunModalConfig] = useState<{ title: string; type: ExtraType | 'wicket'; runs: number; options?: number[] }>({ title: '', type: 'none', runs: 0 });

    const [isBatterModalVisible, setBatterModalVisible] = useState(false);
    const [batterSelectionType, setBatterSelectionType] = useState<'striker' | 'nonStriker' | null>(null);

    // Pending Wicket State
    const [pendingWicket, setPendingWicket] = useState<{ type: WicketType; fielderId?: string; runs?: number }>({ type: 'none' });

    useEffect(() => {
        const handleMatchEnd = async () => {
            if (!state.isPlaying && state.matchResult) {
                // If authenticated, backup immediately
                const { isAuthenticated } = useAuthStore.getState();
                if (isAuthenticated) {
                    console.log('Match completed, triggering auto-backup...');
                    backupToDrive(); // Fire and forget in background
                }
                navigation.replace('MatchResult');
            }
        };

        handleMatchEnd();
    }, [state.isPlaying, state.matchResult]);

    // Check for missing bowler
    useEffect(() => {
        if (state.isPlaying && !state.isInningsBreak && !innings.currentBowlerId) {
            setBowlerModalVisible(true);
        } else {
            setBowlerModalVisible(false);
        }
    }, [state.isPlaying, state.isInningsBreak, innings.currentBowlerId]);

    // Check for missing batsmen
    useEffect(() => {
        if (state.isPlaying && !state.isInningsBreak) {
            if (!innings.strikerId) {
                setBatterSelectionType('striker');
                setBatterSelectionVisible(true);
            } else if (!innings.nonStrikerId) {
                setBatterSelectionType('nonStriker');
                setBatterSelectionVisible(true);
            } else {
                setBatterSelectionVisible(false);
                setBatterSelectionType(null);
            }
        }
    }, [state.isPlaying, state.isInningsBreak, innings.strikerId, innings.nonStrikerId]);

    const [isBatterSelectionVisible, setBatterSelectionVisible] = useState(false);

    const handleBatterSelect = (playerId: string) => {
        if (batterSelectionType === 'striker') {
            setStriker(playerId);
        } else {
            setNonStriker(playerId);
        }
    };

    const handleScore = (runs: number) => {
        recordBall(runs, 'none', false);
    };

    const handleExtra = (type: ExtraType) => {
        if (type === 'bye' || type === 'leg-bye') {
            setRunModalConfig({ title: `Select ${type === 'bye' ? 'Byes' : 'Leg Byes'}`, type, runs: 0 });
            setRunModalVisible(true);
        } else {
            recordBall(0, type, false);
        }
    };

    const handleWicket = () => {
        setWicketModalVisible(true);
    };

    const handleWicketSelect = (type: WicketType) => {
        setWicketModalVisible(false);
        setPendingWicket({ type });

        if (['caught', 'run-out', 'stumped'].includes(type)) {
            setFielderModalVisible(true);
        } else {
            recordBall(0, 'none', true, type);
        }
    };

    const handleFielderSelect = (fielderId: string) => {
        setFielderModalVisible(false);
        const nextPending = { ...pendingWicket, fielderId };
        setPendingWicket(nextPending);

        if (nextPending.type === 'run-out') {
            setRunModalConfig({
                title: 'Select runs (for Run-Out)',
                type: 'wicket',
                runs: 0,
                options: [0, 1, 2, 3]
            });
            setRunModalVisible(true);
        } else {
            recordBall(0, 'none', true, nextPending.type, fielderId);
        }
    };

    const handleRunSelection = (runs: number) => {
        setRunModalVisible(false);
        if (runModalConfig.type === 'wicket') {
            recordBall(runs, 'none', true, pendingWicket.type, pendingWicket.fielderId);
        } else {
            recordBall(runs, runModalConfig.type as ExtraType, false);
        }
    };

    // Stats Helpers
    const getBatterStats = (id: string) => innings.battingStats[id] || { runs: 0, ballsFaced: 0, fours: 0, sixes: 0 };
    const getBowlerStats = (id: string | null) => id ? innings.bowlingStats[id] || { overs: 0, runsConceded: 0, wickets: 0, balls: 0 } : null;

    const getPlayerName = (id: string) => {
        if (!id) return "Select Player";
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
                    <View className="flex-row gap-2 min-h-[32px] flex-wrap">
                        {innings.currentOver.length > 0 ? (
                            innings.currentOver.map((ball, idx) => (
                                <View
                                    key={idx}
                                    className={`px-2 h-8 rounded-full items-center justify-center border border-white/10 ${ball.isWicket ? 'bg-red-600' : ball.extraType !== 'none' ? 'bg-yellow-600' : ball.runs >= 4 ? 'bg-green-600' : 'bg-gray-700'}`}
                                >
                                    <View className="flex-row items-center">
                                        <Text className="text-white font-bold text-xs">
                                            {ball.isWicket ? 'W' : ball.extraType !== 'none' ? ball.extraType === 'wide' ? 'WD' : ball.extraType === 'no-ball' ? 'NB' : ball.extraType === 'bye' ? 'B' : 'LB' : ball.runs}
                                        </Text>
                                        {(ball.extraType === 'bye' || ball.extraType === 'leg-bye' || (ball.isWicket && ball.runs > 0)) && (
                                            <Text className="text-white font-bold text-[10px] ml-0.5">+{ball.runs}</Text>
                                        )}
                                    </View>
                                </View>
                            ))
                        ) : (
                            <Text className="text-gray-600 text-sm italic">-</Text>
                        )}
                    </View>
                </View>

                {/* Quick Controls */}
                <View className="flex-row gap-2 mt-2">
                    <TouchableOpacity
                        onPress={undoBall}
                        className="flex-1 bg-red-900/30 py-2 rounded-lg flex-row items-center justify-center border border-red-800/50"
                    >
                        <Ionicons name="arrow-undo" size={16} color="#ef4444" />
                        <Text className="text-red-500 font-bold ml-2">Undo</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={swapBatsmen}
                        className="flex-1 bg-blue-900/30 py-2 rounded-lg flex-row items-center justify-center border border-blue-800/50"
                    >
                        <Ionicons name="swap-horizontal" size={16} color="#3b82f6" />
                        <Text className="text-blue-500 font-bold ml-2">Swap</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => retirePlayer(innings.strikerId)}
                        className="flex-1 bg-orange-900/30 py-2 rounded-lg flex-row items-center justify-center border border-orange-800/50"
                    >
                        <Ionicons name="exit-outline" size={16} color="#f97316" />
                        <Text className="text-orange-500 font-bold ml-2">Retire</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {state.isInningsBreak ? (
                <ScrollView className="flex-1 p-6">
                    <View className="items-center mb-8 bg-gray-800 p-8 rounded-3xl border border-blue-900/30">
                        <Ionicons name="trophy" size={64} color="#fbbf24" className="mb-4" />
                        <Text className="text-white text-3xl font-black text-center">Innings Over!</Text>
                        <Text className="text-gray-400 text-lg mt-2">{state.innings1.battingTeam} finished their innings</Text>
                        <View className="mt-6 flex-row items-baseline">
                            <Text className="text-5xl font-bold text-white">{state.innings1.totalRuns}</Text>
                            <Text className="text-2xl text-gray-500 font-medium ml-2">/ {state.innings1.totalWickets}</Text>
                        </View>
                    </View>

                    <ScorecardSection
                        title={`1st Innings: ${state.innings1.battingTeam}`}
                        innings={state.innings1}
                        battingTeamPlayers={state.innings1.battingTeamKey === 'teamA' ? state.teamAPlayers : state.teamBPlayers}
                        bowlingTeamPlayers={state.innings1.battingTeamKey === 'teamA' ? state.teamBPlayers : state.teamAPlayers}
                    />

                    <TouchableOpacity
                        onPress={startSecondInnings}
                        className="mt-10 mb-20 bg-blue-600 p-5 rounded-2xl items-center shadow-lg shadow-blue-500/30 active:bg-blue-700"
                    >
                        <Text className="text-white text-xl font-black">START 2ND INNINGS</Text>
                        <Text className="text-blue-200 text-sm mt-1 uppercase tracking-widest font-bold">Target: {state.innings1.totalRuns + 1}</Text>
                    </TouchableOpacity>
                </ScrollView>
            ) : (
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
                            <TouchableOpacity
                                onPress={() => handleExtra('bye')}
                                className="flex-1 h-14 bg-gray-800 rounded-xl items-center justify-center border border-gray-700"
                            >
                                <Text className="text-yellow-500 font-bold text-lg">Bye</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => handleExtra('leg-bye')}
                                className="flex-1 h-14 bg-gray-800 rounded-xl items-center justify-center border border-gray-700"
                            >
                                <Text className="text-yellow-500 font-bold text-lg">L-Bye</Text>
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
                                        battingTeamPlayers={state.innings1.battingTeamKey === 'teamA' ? state.teamAPlayers : state.teamBPlayers}
                                        bowlingTeamPlayers={state.innings1.battingTeamKey === 'teamA' ? state.teamBPlayers : state.teamAPlayers}
                                    />
                                </View>
                            )}

                            <ScorecardSection
                                title={`${state.currentInnings === 2 ? 'Innings 2' : 'Innings 1'}: ${innings.battingTeam}`}
                                innings={innings}
                                battingTeamPlayers={innings.battingTeamKey === 'teamA' ? state.teamAPlayers : state.teamBPlayers}
                                bowlingTeamPlayers={innings.battingTeamKey === 'teamA' ? state.teamBPlayers : state.teamAPlayers}
                            />
                        </View>

                    </View>
                </ScrollView>
            )}

            <BowlerSelectionModal
                visible={isBowlerModalVisible}
                players={bowlingTeamPlayers}
                onSelect={setBowler}
            />
            <BatterSelectionModal
                visible={isBatterSelectionVisible}
                title={batterSelectionType === 'striker' ? "Select Striker" : "Select Non-Striker"}
                players={(innings.battingTeam === state.teamA ? state.teamAPlayers : state.teamBPlayers).filter(p => {
                    const stats = innings.battingStats[p.id];
                    const isOtherBatter = batterSelectionType === 'striker' ? p.id === innings.nonStrikerId : p.id === innings.strikerId;
                    return !isOtherBatter && (!stats || (!stats.isOut && !stats.isRetired));
                })}
                onSelect={handleBatterSelect}
            />
            <RunSelectionModal
                visible={runModalVisible}
                title={runModalConfig.title}
                onSelect={handleRunSelection}
                onClose={() => setRunModalVisible(false)}
                options={runModalConfig.options}
            />
            <WicketTypeSelectionModal
                visible={wicketModalVisible}
                onSelect={handleWicketSelect}
                onClose={() => setWicketModalVisible(false)}
            />
            <FielderSelectionModal
                visible={fielderModalVisible}
                players={bowlingTeamPlayers}
                onSelect={handleFielderSelect}
                title={pendingWicket.type === 'caught' ? "Who caught it?" : pendingWicket.type === 'stumped' ? "Who stumped it?" : "Who made the run out?"}
                onCancel={() => setFielderModalVisible(false)}
            />
        </SafeAreaView>
    );
}
