import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMatchStore } from '../store/useMatchStore';
import { ExtraType } from '../types/match';

export default function ScoreboardScreen({ navigation }: any) {
    const { state, recordBall, resetMatch } = useMatchStore();
    const innings = state.currentInnings === 1 ? state.innings1 : state.innings2;
    const currentOverValidBalls = innings.currentOver.filter(b => b.isValidBall).length;

    React.useEffect(() => {
        if (!state.isPlaying && state.matchResult) {
            navigation.replace('MatchResult');
        }
    }, [state.isPlaying, state.matchResult]);

    const handleScore = (runs: number) => {
        recordBall(runs, 'none', false);
    };

    const handleExtra = (type: ExtraType) => {
        recordBall(0, type, false);
    };

    const handleWicket = () => {
        recordBall(0, 'none', true);
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-900">
            <View className="p-6 pb-2 border-b border-gray-800">
                <Text className="text-gray-400 text-center font-medium mb-1">
                    {innings.battingTeam} Batting
                </Text>
                <View className="items-center mb-6">
                    <Text className="text-6xl font-black text-white">
                        {innings.totalRuns}/{innings.totalWickets}
                    </Text>
                    <Text className="text-xl text-gray-400 mt-2">
                        Overs: {innings.overs.length}.{currentOverValidBalls}
                    </Text>
                </View>

                <View className="mb-4">
                    <Text className="text-gray-400 mb-2 text-sm">This Over:</Text>
                    <View className="flex-row gap-2">
                        {innings.currentOver.map((ball, idx) => (
                            <View
                                key={idx}
                                className={`w-8 h-8 rounded-full items-center justify-center ${ball.isWicket ? 'bg-red-600' : ball.extraType !== 'none' ? 'bg-yellow-600' : ball.runs >= 4 ? 'bg-green-600' : 'bg-gray-700'}`}
                            >
                                <Text className="text-white font-bold text-xs">
                                    {ball.isWicket ? 'W' : ball.extraType !== 'none' ? ball.extraType === 'wide' ? 'WD' : 'NB' : ball.runs}
                                </Text>
                            </View>
                        ))}
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

                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
