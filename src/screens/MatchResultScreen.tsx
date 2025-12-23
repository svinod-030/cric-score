import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMatchStore } from '../store/useMatchStore';

export default function MatchResultScreen({ navigation }: any) {
    const { state, resetMatch } = useMatchStore();
    const { matchResult, innings1, innings2, teamA, teamB } = state;

    const handleNewMatch = () => {
        resetMatch();
        navigation.popToTop();
    };

    if (!matchResult) {
        // Safety fallback
        return (
            <SafeAreaView className="flex-1 bg-gray-900 items-center justify-center">
                <Text className="text-white mb-4">No Result Yet</Text>
                <TouchableOpacity
                    className="bg-blue-600 px-6 py-3 rounded-xl"
                    onPress={() => navigation.goBack()}
                >
                    <Text className="text-white font-bold">Go Back</Text>
                </TouchableOpacity>
            </SafeAreaView>
        )
    }

    return (
        <SafeAreaView className="flex-1 bg-gray-900 p-6 items-center justify-center">
            <View className="mb-10 items-center">
                <Text className="text-gray-400 text-lg mb-2">Match Result</Text>
                <Text className="text-4xl font-black text-white text-center mb-2">
                    {matchResult.winner === 'Draw' ? 'Match Drawn' : `${matchResult.winner} Wins!`}
                </Text>
                <Text className="text-xl text-yellow-500 font-medium">
                    {matchResult.reason}
                </Text>
            </View>

            <View className="w-full bg-gray-800 p-6 rounded-2xl mb-10 border border-gray-700">
                <View className="border-b border-gray-700 pb-4 mb-4">
                    <View className="flex-row justify-between items-center mb-1">
                        <Text className="text-gray-300 text-lg">{teamA}</Text>
                        <Text className="text-white text-2xl font-bold">{innings1.totalRuns}/{innings1.totalWickets}</Text>
                    </View>
                    <Text className="text-gray-500 text-right text-sm">{innings1.overs.length} Overs</Text>
                </View>

                <View>
                    <View className="flex-row justify-between items-center mb-1">
                        <Text className="text-gray-300 text-lg">{teamB}</Text>
                        <Text className="text-white text-2xl font-bold">{innings2.totalRuns}/{innings2.totalWickets}</Text>
                    </View>
                    <Text className="text-gray-500 text-right text-sm">{innings2.overs.length} Overs</Text>
                </View>
            </View>

            <TouchableOpacity
                className="bg-blue-600 w-full p-4 rounded-xl items-center shadow-lg shadow-blue-900/50"
                onPress={handleNewMatch}
            >
                <Text className="text-white text-lg font-bold">Start New Match</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
}
