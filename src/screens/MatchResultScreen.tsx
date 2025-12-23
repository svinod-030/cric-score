import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMatchStore } from '../store/useMatchStore';
import { ScorecardSection } from '../components/ScorecardSection';

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
                        battingTeamPlayers={teamAPlayers}
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
