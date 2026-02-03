import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useMatchStore } from '../store/useMatchStore';

interface LiveMatchCardProps {
    onClear?: () => void;
    showInningsBadge?: boolean;
    variant?: 'blue' | 'gray';
    containerStyle?: string;
}

export const LiveMatchCard: React.FC<LiveMatchCardProps> = ({
    onClear,
    showInningsBadge = false,
    variant = 'blue',
    containerStyle = ''
}) => {
    const { state } = useMatchStore();
    const navigation = useNavigation<any>();

    if (!state.isPlaying) return null;

    const isBlue = variant === 'blue';
    const bgClass = isBlue ? 'bg-blue-600/10 border-blue-500/30' : 'bg-gray-800 border-gray-700';
    const tagClass = isBlue ? 'text-blue-500' : 'text-green-500';
    const shadowClass = isBlue ? 'shadow-lg' : 'shadow-lg shadow-black/50';

    return (
        <View className={`${bgClass} rounded-2xl p-5 border ${shadowClass} ${containerStyle}`}>
            <View className="flex-row justify-between items-start mb-4">
                <View>
                    <Text className={`${tagClass} font-bold tracking-wider text-xs uppercase mb-1`}>Live Now</Text>
                    <Text className="text-white text-xl font-bold">
                        {state.teamA} vs {state.teamB}
                    </Text>
                </View>

                <View className="flex-row items-center gap-2">
                    {showInningsBadge && (
                        <View className="bg-green-500/10 px-3 py-1 rounded-full">
                            <Text className="text-green-500 text-xs font-bold">
                                Innings {state.currentInnings}
                            </Text>
                        </View>
                    )}

                    {onClear && (
                        <TouchableOpacity
                            onPress={() => {
                                Alert.alert(
                                    "Clear Match",
                                    "Are you sure you want to clear the ongoing match? This will move it to history if it was finished, or just delete it if not.",
                                    [
                                        { text: "Cancel", style: "cancel" },
                                        { text: "Clear", style: "destructive", onPress: onClear }
                                    ]
                                );
                            }}
                            className="bg-red-500/10 p-2 rounded-lg"
                        >
                            <Ionicons name="trash-outline" size={20} color="#EF4444" />
                        </TouchableOpacity>
                    )}
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
    );
};
