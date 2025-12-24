import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMatchStore } from '../store/useMatchStore';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

export default function MatchesHistoryScreen() {
    const { state, history } = useMatchStore();
    const navigation = useNavigation<any>();

    return (
        <SafeAreaView className="flex-1 bg-gray-900" edges={['top', 'left', 'right']}>
            <ScrollView className="p-4">
                <Text className="text-white text-3xl font-bold mb-6">Matches</Text>

                {state.isPlaying && (
                    <View className="bg-gray-800 rounded-2xl p-5 border border-gray-700 shadow-lg shadow-black/50 mb-6">
                        <View className="flex-row justify-between items-start mb-4">
                            <View>
                                <Text className="text-green-500 font-bold tracking-wider text-xs uppercase mb-1">Live Now</Text>
                                <Text className="text-white text-xl font-bold">
                                    {state.teamA} vs {state.teamB}
                                </Text>
                            </View>
                            <View className="bg-green-500/10 px-3 py-1 rounded-full">
                                <Text className="text-green-500 text-xs font-bold">
                                    Innings {state.currentInnings}
                                </Text>
                            </View>
                        </View>

                        <View className="flex-row justify-between mb-6">
                            <View>
                                <Text className="text-gray-400 text-xs mb-1">{state.innings1.battingTeam}</Text>
                                <Text className="text-white text-2xl font-black">
                                    {state.innings1.totalRuns}/{state.innings1.totalWickets}
                                    <Text className="text-gray-500 text-sm font-normal"> ({state.innings1.overs.length}.{state.innings1.currentOver.filter(b => b.isValidBall).length})</Text>
                                </Text>
                            </View>
                            {state.currentInnings === 2 && (
                                <View className="items-end">
                                    <Text className="text-gray-400 text-xs mb-1">{state.innings2.battingTeam}</Text>
                                    <Text className="text-white text-2xl font-black">
                                        {state.innings2.totalRuns}/{state.innings2.totalWickets}
                                        <Text className="text-gray-500 text-sm font-normal"> ({state.innings2.overs.length}.{state.innings2.currentOver.filter(b => b.isValidBall).length})</Text>
                                    </Text>
                                </View>
                            )}
                        </View>

                        <TouchableOpacity
                            onPress={() => navigation.navigate('Scoreboard')}
                            className="bg-blue-600 p-4 rounded-xl flex-row items-center justify-center gap-2 active:bg-blue-700"
                        >
                            <Ionicons name="play" size={20} color="white" />
                            <Text className="text-white font-bold text-lg">Resume Match</Text>
                        </TouchableOpacity>
                    </View>
                )}

                <Text className="text-white text-xl font-bold mb-4">History</Text>

                {history.length === 0 ? (
                    <Text className="text-gray-500 text-center py-10">No completed matches yet.</Text>
                ) : (
                    history.map((match, index) => (
                        <TouchableOpacity
                            key={index}
                            className="bg-gray-800 p-4 rounded-xl mb-3 border border-gray-700"
                            onPress={() => navigation.navigate('MatchResult', { matchData: match })}
                        >
                            <View className="flex-row justify-between items-center mb-2">
                                <Text className="text-white font-bold text-lg">{match.teamA} vs {match.teamB}</Text>
                                <Text className="text-xs text-gray-400">Completed</Text>
                            </View>
                            <Text className="text-yellow-500 font-medium">
                                {match.matchResult?.winner === 'Draw' ? 'Match Drawn' : `${match.matchResult?.winner} Won`}
                            </Text>
                            <Text className="text-gray-400 text-xs mt-1">{match.matchResult?.reason}</Text>
                        </TouchableOpacity>
                    ))
                )}

                <View className="h-20" />
            </ScrollView>
        </SafeAreaView>
    );
}
