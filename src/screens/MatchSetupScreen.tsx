import React from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, Switch, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMatchStore } from '../store/useMatchStore';
import { MatchConfig } from '../types/match';

export default function MatchSetupScreen({ navigation }: any) {
    const { config, setConfig, startMatch } = useMatchStore();

    const handleStartMatch = () => {
        startMatch();
        navigation.navigate('Scoreboard'); // Will implement later
        // console.log("Match Started with config:", config);
    };

    const updateConfig = (key: keyof MatchConfig, value: any) => {
        setConfig({ [key]: value });
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-900" edges={['bottom', 'left', 'right']}>
            <ScrollView className="p-6">
                <Text className="text-3xl font-bold text-white mb-8">New Match</Text>

                {/* Teams Section */}
                <View className="mb-6">
                    <Text className="text-lg font-semibold text-gray-300 mb-2">Teams</Text>
                    <View className="flex-row gap-4">
                        <View className="flex-1">
                            <Text className="text-gray-400 text-sm mb-1">Team A</Text>
                            <TextInput
                                className="bg-gray-800 text-white p-4 rounded-xl border border-gray-700"
                                value={config.teamA}
                                onChangeText={(text) => updateConfig('teamA', text)}
                                placeholder="Team A Name"
                                placeholderTextColor="#666"
                            />
                        </View>
                        <View className="flex-1">
                            <Text className="text-gray-400 text-sm mb-1">Team B</Text>
                            <TextInput
                                className="bg-gray-800 text-white p-4 rounded-xl border border-gray-700"
                                value={config.teamB}
                                onChangeText={(text) => updateConfig('teamB', text)}
                                placeholder="Team B Name"
                                placeholderTextColor="#666"
                            />
                        </View>
                    </View>
                </View>

                {/* Match Settings */}
                <View className="mb-6 bg-gray-800 p-5 rounded-2xl border border-gray-700">
                    <Text className="text-lg font-semibold text-white mb-4">Match Settings</Text>

                    <View className="flex-row justify-between items-center mb-4">
                        <Text className="text-gray-300">Overs per Innings</Text>
                        <View className="flex-row items-center gap-3">
                            <TouchableOpacity
                                onPress={() => updateConfig('overs', Math.max(1, config.overs - 1))}
                                className="w-8 h-8 bg-gray-700 rounded-full items-center justify-center"
                            >
                                <Text className="text-white text-xl">-</Text>
                            </TouchableOpacity>
                            <Text className="text-white text-lg font-bold w-6 text-center">{config.overs}</Text>
                            <TouchableOpacity
                                onPress={() => updateConfig('overs', config.overs + 1)}
                                className="w-8 h-8 bg-blue-600 rounded-full items-center justify-center"
                            >
                                <Text className="text-white text-xl">+</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View className="flex-row justify-between items-center">
                        <Text className="text-gray-300">Players per Team</Text>
                        <View className="flex-row items-center gap-3">
                            <TouchableOpacity
                                onPress={() => updateConfig('playersPerTeam', Math.max(2, config.playersPerTeam - 1))}
                                className="w-8 h-8 bg-gray-700 rounded-full items-center justify-center"
                            >
                                <Text className="text-white text-xl">-</Text>
                            </TouchableOpacity>
                            <Text className="text-white text-lg font-bold w-6 text-center">{config.playersPerTeam}</Text>
                            <TouchableOpacity
                                onPress={() => updateConfig('playersPerTeam', config.playersPerTeam + 1)}
                                className="w-8 h-8 bg-blue-600 rounded-full items-center justify-center"
                            >
                                <Text className="text-white text-xl">+</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                {/* Rules */}
                <View className="mb-8 bg-gray-800 p-5 rounded-2xl border border-gray-700">
                    <Text className="text-lg font-semibold text-white mb-4">Extras & Rules</Text>

                    <View className="flex-row justify-between items-center mb-4">
                        <Text className="text-gray-300">Run for Wide (1)</Text>
                        <Switch
                            value={config.runsForWide > 0}
                            onValueChange={(v) => updateConfig('runsForWide', v ? 1 : 0)}
                            trackColor={{ false: "#374151", true: "#2563EB" }}
                            thumbColor="#fff"
                        />
                    </View>
                    <View className="flex-row justify-between items-center mb-4">
                        <Text className="text-gray-300">Run for No Ball (1)</Text>
                        <Switch
                            value={config.runsForNoBall > 0}
                            onValueChange={(v) => updateConfig('runsForNoBall', v ? 1 : 0)}
                            trackColor={{ false: "#374151", true: "#2563EB" }}
                            thumbColor="#fff"
                        />
                    </View>

                    <View className="flex-row justify-between items-center mb-4">
                        <Text className="text-gray-300">Re-ball for Wide</Text>
                        <Switch
                            value={config.reballForWide}
                            onValueChange={(v) => updateConfig('reballForWide', v)}
                            trackColor={{ false: "#374151", true: "#2563EB" }}
                            thumbColor="#fff"
                        />
                    </View>
                    <View className="flex-row justify-between items-center">
                        <Text className="text-gray-300">Re-ball for No Ball</Text>
                        <Switch
                            value={config.reballForNoBall}
                            onValueChange={(v) => updateConfig('reballForNoBall', v)}
                            trackColor={{ false: "#374151", true: "#2563EB" }}
                            thumbColor="#fff"
                        />
                    </View>
                </View>

                <TouchableOpacity
                    className="bg-blue-600 p-4 rounded-xl items-center mb-10 shadow-lg shadow-blue-900/50"
                    onPress={handleStartMatch}
                >
                    <Text className="text-white text-lg font-bold">Start Match</Text>
                </TouchableOpacity>

            </ScrollView>
        </SafeAreaView>
    );
}
