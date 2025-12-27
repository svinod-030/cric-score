import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMatchStore } from '../store/useMatchStore';
import { ScorecardSection } from '../components/ScorecardSection';

export default function MatchResultScreen({ navigation, route }: any) {
    const { state, resetMatch } = useMatchStore();

    // Use passed match data (history) OR current active state
    const matchData = route.params?.matchData || state;
    const { matchResult, innings1, innings2, teamAPlayers, teamBPlayers } = matchData;
    const isHistoryView = !!route.params?.matchData;

    const handleNewMatch = () => {
        resetMatch();
        // Reset navigation stack to Home
        navigation.reset({
            index: 0,
            routes: [{ name: 'HomeTabs' }],
        });
    };

    if (!matchResult) {
        return (
            <SafeAreaView className="flex-1 bg-gray-900 items-center justify-center" edges={['bottom', 'left', 'right']}>
                <Text className="text-white mb-4">No Result Yet</Text>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text className="text-blue-500">Go Back</Text>
                </TouchableOpacity>
            </SafeAreaView>
        )
    }

    return (
        <SafeAreaView className="flex-1 bg-gray-900" edges={['bottom', 'left', 'right']}>
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
                        battingTeamPlayers={innings1.battingTeam === state.teamA ? teamAPlayers : teamBPlayers}
                        bowlingTeamPlayers={innings1.battingTeam === state.teamA ? teamBPlayers : teamAPlayers}
                    />

                    <ScorecardSection
                        title={`Innings 2: ${innings2.battingTeam}`}
                        innings={innings2}
                        battingTeamPlayers={innings2.battingTeam === state.teamA ? teamAPlayers : teamBPlayers}
                        bowlingTeamPlayers={innings2.battingTeam === state.teamA ? teamBPlayers : teamAPlayers}
                    />
                </View>

                {!isHistoryView && (
                    <View className="p-6">
                        <TouchableOpacity
                            className="bg-blue-600 w-full p-4 rounded-xl items-center shadow-lg shadow-blue-900/50"
                            onPress={handleNewMatch}
                        >
                            <Text className="text-white text-lg font-bold">Start New Match</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}
