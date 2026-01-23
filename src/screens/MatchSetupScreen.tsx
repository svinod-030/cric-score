import React from 'react';
import { View, Text, TextInput, TouchableOpacity, Switch, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMatchStore } from '../store/useMatchStore';
import { MatchConfig } from '../types/match';

export default function MatchSetupScreen({ navigation }: any) {
    const { config, setConfig, startMatch, loadTeamRoster } = useMatchStore();

    const canStartMatch = () => {
        return config.tossWinner && config.tossDecision && config.teamA && config.teamB;
    };

    const handleStartMatch = () => {
        if (!canStartMatch()) {
            Alert.alert('Incomplete Setup', 'Please select toss winner and decision before starting.');
            return;
        }
        startMatch();
        navigation.navigate('Scoreboard');
    };

    const updateConfig = (key: keyof MatchConfig, value: any) => {
        setConfig({ [key]: value });
    };

    return (

        <SafeAreaView className="flex-1 bg-gray-900" edges={['bottom', 'left', 'right']}>
            <KeyboardAwareScrollView
                enableOnAndroid={true}
                extraScrollHeight={100}
                contentContainerStyle={{ flexGrow: 1 }}
                style={{ flex: 1 }}
                className="p-6"
            >
                <Text className="text-3xl font-bold text-white mb-8">New Match</Text>

                {/* Teams Section */}
                <View className="mb-6">
                    <Text className="text-lg font-semibold text-gray-300 mb-2">Teams</Text>
                    <View className="flex-row gap-4">
                        <View className="flex-1">
                            <TextInput
                                className="bg-gray-800 text-white p-4 rounded-xl border border-gray-700"
                                value={config.teamA}
                                onChangeText={(text: string) => {
                                    const teamName = text?.toUpperCase();
                                    updateConfig('teamA', teamName);
                                    loadTeamRoster('teamA', teamName);
                                }}
                                placeholder="Team A"
                                placeholderTextColor="#666"
                            />
                            {!config.teamA && <Text className="text-red-500 mt-2">Please provide a name</Text>}
                        </View>
                        <View className="flex-1">
                            <TextInput
                                className="bg-gray-800 text-white p-4 rounded-xl border border-gray-700"
                                value={config.teamB}
                                onChangeText={(text: string) => {
                                    const teamName = text?.toUpperCase();
                                    updateConfig('teamB', teamName);
                                    loadTeamRoster('teamB', teamName);
                                }}
                                placeholder="Team B"
                                placeholderTextColor="#666"
                            />
                            {!config.teamB && <Text className="text-red-500 mt-2">Please provide a name</Text>}
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

                    <View className="flex-row justify-between items-center mt-4 pt-4 border-t border-gray-700">
                        <View className="flex-row items-center gap-2">
                            <Text className="text-gray-300">Custom Player Names</Text>
                            <TouchableOpacity onPress={() => Alert.alert(
                                "Custom Player Names",
                                "Enable this to enter specific names for your players. If disabled, default names (e.g., 'Team A Player 1') will be used, allowing for automated player selection."
                            )}>
                                <Ionicons name="information-circle-outline" size={20} color="#9ca3af" />
                            </TouchableOpacity>
                        </View>
                        <Switch
                            value={config.isCustomNamesEnabled || false}
                            onValueChange={(v) => updateConfig('isCustomNamesEnabled', v)}
                            trackColor={{ false: "#374151", true: "#2563EB" }}
                            thumbColor="#fff"
                        />
                    </View>
                </View>

                {config.isCustomNamesEnabled && (
                    <View className="mb-8 bg-gray-800 p-5 rounded-2xl border border-gray-700">
                        <Text className="text-lg font-semibold text-white mb-4">Player Names</Text>
                        <View className="flex-row gap-6">
                            <View className="flex-1">
                                <Text className="text-gray-400 text-sm mb-2 font-bold">{config.teamA || 'Team A'}</Text>
                                {Array.from({ length: config.playersPerTeam }).map((_, i) => (
                                    <TextInput
                                        key={`A${i}`}
                                        className="bg-gray-700 text-white p-2 rounded-lg border border-gray-600 mb-2 text-sm"
                                        placeholder={`Player ${i + 1}`}
                                        placeholderTextColor="#666"
                                        value={config.teamAPlayerNames?.[i] || ''}
                                        onChangeText={(text) => {
                                            const names = [...(config.teamAPlayerNames || [])];
                                            names[i] = text;
                                            updateConfig('teamAPlayerNames', names);
                                        }}
                                    />
                                ))}
                            </View>
                            <View className="flex-1">
                                <Text className="text-gray-400 text-sm mb-2 font-bold">{config.teamB || 'Team B'}</Text>
                                {Array.from({ length: config.playersPerTeam }).map((_, i) => (
                                    <TextInput
                                        key={`B${i}`}
                                        className="bg-gray-700 text-white p-2 rounded-lg border border-gray-600 mb-2 text-sm"
                                        placeholder={`Player ${i + 1}`}
                                        placeholderTextColor="#666"
                                        value={config.teamBPlayerNames?.[i] || ''}
                                        onChangeText={(text) => {
                                            const names = [...(config.teamBPlayerNames || [])];
                                            names[i] = text;
                                            updateConfig('teamBPlayerNames', names);
                                        }}
                                    />
                                ))}
                            </View>
                        </View>
                    </View>
                )}

                {/* Toss Section */}
                <View className="mb-8 bg-gray-800 p-5 rounded-2xl border border-gray-700">
                    <Text className="text-lg font-semibold text-white mb-4">Toss</Text>

                    <View className="mb-4">
                        <Text className="text-gray-300 mb-2">Who won the toss?</Text>
                        <View className="flex-row gap-4">
                            <TouchableOpacity
                                onPress={() => updateConfig('tossWinner', 'teamA')}
                                className={`flex-1 p-3 rounded-xl border ${config.tossWinner === 'teamA' ? 'bg-blue-600 border-blue-500' : 'bg-gray-700 border-gray-600'}`}
                            >
                                <Text className="text-white text-center font-bold">{config.teamA || 'Team A'}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => updateConfig('tossWinner', 'teamB')}
                                className={`flex-1 p-3 rounded-xl border ${config.tossWinner === 'teamB' ? 'bg-blue-600 border-blue-500' : 'bg-gray-700 border-gray-600'}`}
                            >
                                <Text className="text-white text-center font-bold">{config.teamB || 'Team B'}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {config.tossWinner && (
                        <View>
                            <Text className="text-gray-300 mb-2">{config.tossWinner === 'teamA' ? (config.teamA || 'Team A') : (config.teamB || 'Team B')} elected to?</Text>
                            <View className="flex-row gap-4">
                                <TouchableOpacity
                                    onPress={() => updateConfig('tossDecision', 'bat')}
                                    className={`flex-1 p-3 rounded-xl border ${config.tossDecision === 'bat' ? 'bg-green-600 border-green-500' : 'bg-gray-700 border-gray-600'}`}
                                >
                                    <Text className="text-white text-center font-bold">Bat</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => updateConfig('tossDecision', 'bowl')}
                                    className={`flex-1 p-3 rounded-xl border ${config.tossDecision === 'bowl' ? 'bg-green-600 border-green-500' : 'bg-gray-700 border-gray-600'}`}
                                >
                                    <Text className="text-white text-center font-bold">Bowl</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
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
                    <View className="flex-row justify-between items-center mb-4">
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
                    className={`p-4 rounded-xl items-center mb-10 shadow-lg ${(!canStartMatch()) ? 'bg-gray-700 shadow-none' : 'bg-blue-600 shadow-blue-900/50'}`}
                    onPress={handleStartMatch}
                    disabled={!canStartMatch()}
                >
                    <Text className="text-white text-lg font-bold">Start Match</Text>
                </TouchableOpacity>

            </KeyboardAwareScrollView>
        </SafeAreaView>
    );
}
