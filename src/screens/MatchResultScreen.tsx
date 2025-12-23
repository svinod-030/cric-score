import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMatchStore } from '../store/useMatchStore';
import { InningsState, Player } from '../types/match';

const ScorecardSection = ({
    title,
    innings,
    battingTeamPlayers,
    bowlingTeamPlayers
}: {
    title: string,
    innings: InningsState,
    battingTeamPlayers: Player[],
    bowlingTeamPlayers: Player[]
}) => {
    return (
        <View className="mb-6 bg-gray-800 rounded-xl overflow-hidden">
            <View className="bg-gray-700 p-3 flex-row justify-between items-center">
                <Text className="text-white font-bold text-lg">{title}</Text>
                <Text className="text-gray-300 font-bold">{innings.totalRuns}/{innings.totalWickets} ({innings.overs.length} Ov)</Text>
            </View>

            {/* Batting Header */}
            <View className="flex-row bg-gray-800 p-2 border-b border-gray-700">
                <Text className="flex-[3] text-gray-400 text-xs uppercase font-bold">Batter</Text>
                <Text className="flex-1 text-gray-400 text-xs uppercase font-bold text-center">R</Text>
                <Text className="flex-1 text-gray-400 text-xs uppercase font-bold text-center">B</Text>
                <Text className="flex-1 text-gray-400 text-xs uppercase font-bold text-center">4s</Text>
                <Text className="flex-1 text-gray-400 text-xs uppercase font-bold text-center">6s</Text>
                <Text className="flex-1 text-gray-400 text-xs uppercase font-bold text-center">SR</Text>
            </View>

            {battingTeamPlayers.map(player => {
                const stats = innings.battingStats[player.id];
                if (!stats && !innings.battingStats[player.id]) return null;
                // Showing all might be too long, let's show only those with stats (batted)
                if (!stats) return null;

                const sr = stats.ballsFaced > 0 ? ((stats.runs / stats.ballsFaced) * 100).toFixed(0) : "0";
                return (
                    <View key={player.id} className="flex-row p-3 border-b border-gray-700/50">
                        <View className="flex-[3]">
                            <Text className="text-white font-medium">{player.name}</Text>
                            <Text className="text-gray-500 text-xs">{stats.isOut ? "Out" : "Not Out"}</Text>
                        </View>
                        <Text className="flex-1 text-white font-bold text-center">{stats.runs}</Text>
                        <Text className="flex-1 text-gray-400 text-center">{stats.ballsFaced}</Text>
                        <Text className="flex-1 text-gray-400 text-center">{stats.fours}</Text>
                        <Text className="flex-1 text-gray-400 text-center">{stats.sixes}</Text>
                        <Text className="flex-1 text-gray-400 text-center">{sr}</Text>
                    </View>
                );
            })}

            {/* Extras Row */}
            {(() => {
                const extras = calculateExtras(innings);
                return (
                    <View className="flex-row justify-between p-3 border-b border-gray-700 bg-gray-600/20">
                        <Text className="text-gray-300 font-bold">Extras</Text>
                        <Text className="text-white">
                            {extras.total} (wd {extras.wide}, nb {extras.noBall}, b {extras.bye}, lb {extras.legBye})
                        </Text>
                    </View>
                );
            })()}

            {/* Total Row */}
            <View className="flex-row justify-between p-3 border-b border-gray-700 bg-gray-900/40">
                <Text className="text-white font-black text-lg">Total</Text>
                <Text className="text-white font-black text-lg">
                    {innings.totalRuns}/{innings.totalWickets} <Text className="text-base text-gray-400 font-normal">({innings.overs.length} Ov)</Text>
                </Text>
            </View>

            {/* Bowling Header */}
            <View className="flex-row bg-gray-700 p-2 mt-4">
                <Text className="flex-[3] text-gray-300 text-xs uppercase font-bold">Bowler</Text>
                <Text className="flex-1 text-gray-300 text-xs uppercase font-bold text-center">O</Text>
                <Text className="flex-1 text-gray-300 text-xs uppercase font-bold text-center">M</Text>
                <Text className="flex-1 text-gray-300 text-xs uppercase font-bold text-center">R</Text>
                <Text className="flex-1 text-gray-300 text-xs uppercase font-bold text-center">W</Text>
                <Text className="flex-1 text-gray-300 text-xs uppercase font-bold text-center">Eco</Text>
            </View>

            {bowlingTeamPlayers.map(player => {
                const stats = innings.bowlingStats[player.id];
                if (!stats) return null;

                const economy = stats.overs > 0
                    ? (stats.runsConceded / (stats.overs + (stats.balls % 6) / 6)).toFixed(1)
                    : "0.0";

                const oversDisplay = `${stats.overs}.${stats.balls % 6}`;

                return (
                    <View key={player.id} className="flex-row p-3 border-b border-gray-700/50">
                        <Text className="flex-[3] text-white font-medium">{player.name}</Text>
                        <Text className="flex-1 text-gray-400 text-center">{oversDisplay}</Text>
                        <Text className="flex-1 text-gray-400 text-center">{stats.maidens}</Text>
                        <Text className="flex-1 text-gray-400 text-center">{stats.runsConceded}</Text>
                        <Text className="flex-1 text-white font-bold text-center">{stats.wickets}</Text>
                        <Text className="flex-1 text-gray-400 text-center">{economy}</Text>
                    </View>
                );
            })}
        </View>
    );
}

// Helper to calc extras
const calculateExtras = (innings: InningsState) => {
    let wide = 0, noBall = 0, bye = 0, legBye = 0;
    const allBalls = [...innings.overs.flatMap(o => o.balls), ...innings.currentOver];

    allBalls.forEach(ball => {
        if (ball.extraType === 'wide') wide += (1 + ball.runs); // Assuming 1 run for wide + any runs run? Default 1. 
        // Actually earlier logic was: runsToAdd = runs + config.runsForWide. 
        // But here we don't have config easily. 
        // Wait, 'runs' in Ball object allows us to track total runs for that ball. 
        // But we want to count how many wides/no-balls to display "5wd" or similar? 
        // Or just total runs from extras?
        // Usually scorecard shows: Extras 12 (wd 5, nb 2, b 4, lb 1)

        switch (ball.extraType) {
            case 'wide': wide += ball.runs; break; // ball.runs includes the penalty? 
            // In scoringUtils: newBall = { runs: runsToAdd ... }
            // runsToAdd includes the penalty. So YES.
            case 'no-ball': noBall += ball.runs; break;
            case 'bye': bye += ball.runs; break;
            case 'leg-bye': legBye += ball.runs; break;
        }
    });

    return { wide, noBall, bye, legBye, total: wide + noBall + bye + legBye };
};

export default function MatchResultScreen({ navigation }: any) {
    const { state, resetMatch } = useMatchStore();
    const { matchResult, innings1, innings2, teamAPlayers, teamBPlayers } = state;

    const handleNewMatch = () => {
        resetMatch();
        navigation.popToTop();
    };

    if (!matchResult) {
        return (
            <SafeAreaView className="flex-1 bg-gray-900 items-center justify-center">
                <Text className="text-white mb-4">No Result Yet</Text>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text className="text-blue-500">Go Back</Text>
                </TouchableOpacity>
            </SafeAreaView>
        )
    }

    return (
        <SafeAreaView className="flex-1 bg-gray-900">
            <ScrollView className="flex-1">
                <View className="p-6 items-center border-b border-gray-800 mb-4">
                    <Text className="text-gray-400 text-lg mb-1">Match Result</Text>
                    <Text className="text-3xl font-black text-white text-center mb-1">
                        {matchResult.winner === 'Draw' ? 'Match Drawn' : `${matchResult.winner} Wins!`}
                    </Text>
                    <Text className="text-lg text-yellow-500 font-medium lowercase">
                        {matchResult.reason}
                    </Text>
                </View>

                <View className="px-4">
                    <ScorecardSection
                        title={`Innings 1: ${innings1.battingTeam}`}
                        innings={innings1}
                        battingTeamPlayers={teamAPlayers} // Assumes Team A batted first. If Toss logic adds dynamic batting, this needs fix. But currently A always bats first.
                        bowlingTeamPlayers={teamBPlayers}
                    />

                    <ScorecardSection
                        title={`Innings 2: ${innings2.battingTeam}`}
                        innings={innings2}
                        battingTeamPlayers={teamBPlayers}
                        bowlingTeamPlayers={teamAPlayers}
                    />
                </View>

                <View className="p-6">
                    <TouchableOpacity
                        className="bg-blue-600 w-full p-4 rounded-xl items-center shadow-lg shadow-blue-900/50"
                        onPress={handleNewMatch}
                    >
                        <Text className="text-white text-lg font-bold">Start New Match</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
