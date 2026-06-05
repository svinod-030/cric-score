import React from 'react';
import { View, Text, TextInput, TouchableOpacity, Switch, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMatchStore } from '../store/useMatchStore';
import { MatchConfig } from '../types/match';
import { LiveMatchCard } from '../components/LiveMatchCard';
import { CoinFlipModal } from '../components/CoinFlipModal';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '../hooks/useAppTheme';

export default function MatchSetupScreen({ navigation }: any) {
    const { t } = useTranslation();
    const { config, setConfig, startMatch, loadTeamRoster, resetMatch } = useMatchStore();
    const [isCoinFlipVisible, setIsCoinFlipVisible] = React.useState(false);
    const { isDark } = useAppTheme();

    // Adaptive colours
    const bg = isDark ? 'bg-gray-900' : 'bg-gray-100';
    const titleColor = isDark ? 'text-white' : 'text-gray-900';
    const sectionTitle = isDark ? 'text-lg font-semibold text-gray-300 mb-2' : 'text-lg font-semibold text-gray-600 mb-2';
    const cardBg = isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
    const cardTitle = isDark ? 'text-lg font-semibold text-white mb-4' : 'text-lg font-semibold text-gray-900 mb-4';
    const inputBg = isDark ? 'bg-gray-800 text-white border-gray-700' : 'bg-white text-gray-900 border-gray-300';
    const inputPlaceholder = isDark ? '#666' : '#9CA3AF';
    const counterBtnBg = isDark ? 'bg-gray-700' : 'bg-gray-200';
    const counterText = isDark ? 'text-white' : 'text-gray-900';
    const sectionDivider = isDark ? 'border-gray-700' : 'border-gray-200';
    const rowLabel = isDark ? 'text-gray-300' : 'text-gray-600';
    const playerInputBg = isDark ? 'bg-gray-700 text-white border-gray-600' : 'bg-gray-50 text-gray-900 border-gray-300';
    const playerNameLabel = isDark ? 'text-gray-400' : 'text-gray-500';

    const canStartMatch = () => {
        return config.tossWinner && config.tossDecision && config.teamA && config.teamB;
    };

    const handleStartMatch = () => {
        if (!canStartMatch()) {
            Alert.alert(t('common.incompleteSetup'), t('common.pleaseSelectTossWinner'));
            return;
        }
        startMatch();
        navigation.navigate('Scoreboard');
    };

    const updateConfig = (key: keyof MatchConfig, value: any) => {
        setConfig({ [key]: value });
    };

    return (
        <SafeAreaView className={`flex-1 ${bg}`} edges={['bottom', 'left', 'right']}>
            <KeyboardAwareScrollView
                enableOnAndroid={true}
                extraScrollHeight={100}
                contentContainerStyle={{ flexGrow: 1 }}
                style={{ flex: 1 }}
                className="p-6"
            >
                <Text className={`text-3xl font-bold mb-8 ${titleColor}`}>{t('common.newMatch')}</Text>

                <LiveMatchCard
                    onClear={resetMatch}
                    containerStyle="mb-8"
                />

                <CoinFlipModal
                    isVisible={isCoinFlipVisible}
                    onClose={() => setIsCoinFlipVisible(false)}
                    onResult={(winner) => updateConfig('tossWinner', winner)}
                    teamAName={config.teamA || t('common.teamA')}
                    teamBName={config.teamB || t('common.teamB')}
                />

                {/* Teams Section */}
                <View className="mb-6">
                    <Text className={sectionTitle}>{t('common.teams')}</Text>
                    <View className="flex-row gap-4">
                        <View className="flex-1">
                            <TextInput
                                className={`p-4 rounded-xl border ${inputBg}`}
                                value={config.teamA}
                                onChangeText={(text: string) => {
                                    const teamName = text?.toUpperCase();
                                    updateConfig('teamA', teamName);
                                    loadTeamRoster('teamA', teamName);
                                }}
                                placeholder={t('common.teamA')}
                                placeholderTextColor={inputPlaceholder}
                            />
                            {!config.teamA && <Text className="text-red-500 mt-2">{t('common.pleaseProvideName')}</Text>}
                        </View>
                        <View className="flex-1">
                            <TextInput
                                className={`p-4 rounded-xl border ${inputBg}`}
                                value={config.teamB}
                                onChangeText={(text: string) => {
                                    const teamName = text?.toUpperCase();
                                    updateConfig('teamB', teamName);
                                    loadTeamRoster('teamB', teamName);
                                }}
                                placeholder={t('common.teamB')}
                                placeholderTextColor={inputPlaceholder}
                            />
                            {!config.teamB && <Text className="text-red-500 mt-2">{t('common.pleaseProvideName')}</Text>}
                        </View>
                    </View>
                </View>

                {/* Match Settings */}
                <View className={`mb-6 p-5 rounded-2xl border ${cardBg}`}>
                    <Text className={cardTitle}>{t('common.matchSettings')}</Text>

                    <View className="flex-row justify-between items-center mb-4">
                        <Text className={rowLabel}>{t('common.oversPerInnings')}</Text>
                        <View className="flex-row items-center gap-3">
                            <TouchableOpacity
                                onPress={() => updateConfig('overs', Math.max(1, config.overs - 1))}
                                className={`w-8 h-8 rounded-full items-center justify-center ${counterBtnBg}`}
                            >
                                <Text className={`text-xl ${counterText}`}>-</Text>
                            </TouchableOpacity>
                            <Text className={`text-lg font-bold w-6 text-center ${counterText}`}>{config.overs}</Text>
                            <TouchableOpacity
                                onPress={() => updateConfig('overs', config.overs + 1)}
                                className="w-8 h-8 bg-blue-600 rounded-full items-center justify-center"
                            >
                                <Text className="text-white text-xl">+</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View className="flex-row justify-between items-center">
                        <Text className={rowLabel}>{t('common.playersPerTeam')}</Text>
                        <View className="flex-row items-center gap-3">
                            <TouchableOpacity
                                onPress={() => updateConfig('playersPerTeam', Math.max(2, config.playersPerTeam - 1))}
                                className={`w-8 h-8 rounded-full items-center justify-center ${counterBtnBg}`}
                            >
                                <Text className={`text-xl ${counterText}`}>-</Text>
                            </TouchableOpacity>
                            <Text className={`text-lg font-bold w-6 text-center ${counterText}`}>{config.playersPerTeam}</Text>
                            <TouchableOpacity
                                onPress={() => updateConfig('playersPerTeam', config.playersPerTeam + 1)}
                                className="w-8 h-8 bg-blue-600 rounded-full items-center justify-center"
                            >
                                <Text className="text-white text-xl">+</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View className={`flex-row justify-between items-center mt-4 pt-4 border-t ${sectionDivider}`}>
                        <View className="flex-row items-center gap-2">
                            <Text className={rowLabel}>{t('common.customPlayerNames')}</Text>
                            <TouchableOpacity onPress={() => Alert.alert(
                                t('common.customPlayerNames'),
                                t('common.customNamesDescription')
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
                    <View className={`mb-8 p-5 rounded-2xl border ${cardBg}`}>
                        <Text className={cardTitle}>{t('common.playerNames')}</Text>
                        <View className="flex-row gap-6">
                            <View className="flex-1">
                                <Text className={`text-sm mb-2 font-bold ${playerNameLabel}`}>{config.teamA || t('common.teamA')}</Text>
                                {Array.from({ length: config.playersPerTeam }).map((_, i) => (
                                    <TextInput
                                        key={`A${i}`}
                                        className={`p-2 rounded-lg border mb-2 text-sm ${playerInputBg}`}
                                        placeholder={t('common.playerPlaceholder', { index: i + 1 })}
                                        placeholderTextColor={inputPlaceholder}
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
                                <Text className={`text-sm mb-2 font-bold ${playerNameLabel}`}>{config.teamB || t('common.teamB')}</Text>
                                {Array.from({ length: config.playersPerTeam }).map((_, i) => (
                                    <TextInput
                                        key={`B${i}`}
                                        className={`p-2 rounded-lg border mb-2 text-sm ${playerInputBg}`}
                                        placeholder={t('common.playerPlaceholder', { index: i + 1 })}
                                        placeholderTextColor={inputPlaceholder}
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
                <View className={`mb-8 p-5 rounded-2xl border ${cardBg}`}>
                    <View className="flex-row justify-between items-center mb-4">
                        <Text className={cardTitle.replace(' mb-4', '')}>{t('common.toss')}</Text>
                        <TouchableOpacity
                            onPress={() => setIsCoinFlipVisible(true)}
                            className="flex-row items-center gap-1 bg-blue-600/10 px-3 py-1.5 rounded-lg border border-blue-500/20"
                        >
                            <Ionicons name="infinite-outline" size={16} color="#3B82F6" />
                            <Text className="text-blue-500 text-xs font-bold uppercase tracking-wider">{t('common.onlineToss')}</Text>
                        </TouchableOpacity>
                    </View>

                    <View className="mb-4">
                        <Text className={`mb-2 ${rowLabel}`}>{t('common.whoWonToss')}</Text>
                        <View className="flex-row gap-4">
                            <TouchableOpacity
                                onPress={() => updateConfig('tossWinner', 'teamA')}
                                className={`flex-1 p-3 rounded-xl border ${config.tossWinner === 'teamA' ? 'bg-blue-600 border-blue-500' : (isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-100 border-gray-300')}`}
                            >
                                <Text className={`text-center font-bold ${config.tossWinner === 'teamA' ? 'text-white' : counterText}`}>{config.teamA || t('common.teamA')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => updateConfig('tossWinner', 'teamB')}
                                className={`flex-1 p-3 rounded-xl border ${config.tossWinner === 'teamB' ? 'bg-blue-600 border-blue-500' : (isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-100 border-gray-300')}`}
                            >
                                <Text className={`text-center font-bold ${config.tossWinner === 'teamB' ? 'text-white' : counterText}`}>{config.teamB || t('common.teamB')}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {config.tossWinner && (
                        <View>
                            <Text className={`mb-2 ${rowLabel}`}>{config.tossWinner === 'teamA' ? (config.teamA || t('common.teamA')) : (config.teamB || t('common.teamB'))} {t('common.electedTo')}</Text>
                            <View className="flex-row gap-4">
                                <TouchableOpacity
                                    onPress={() => updateConfig('tossDecision', 'bat')}
                                    className={`flex-1 p-3 rounded-xl border ${config.tossDecision === 'bat' ? 'bg-green-600 border-green-500' : (isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-100 border-gray-300')}`}
                                >
                                    <Text className={`text-center font-bold ${config.tossDecision === 'bat' ? 'text-white' : counterText}`}>{t('common.bat')}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => updateConfig('tossDecision', 'bowl')}
                                    className={`flex-1 p-3 rounded-xl border ${config.tossDecision === 'bowl' ? 'bg-green-600 border-green-500' : (isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-100 border-gray-300')}`}
                                >
                                    <Text className={`text-center font-bold ${config.tossDecision === 'bowl' ? 'text-white' : counterText}`}>{t('common.bowl')}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                </View>

                {/* Rules */}
                <View className={`mb-8 p-5 rounded-2xl border ${cardBg}`}>
                    <Text className={cardTitle}>{t('common.extrasRules')}</Text>

                    <View className="flex-row justify-between items-center mb-4">
                        <Text className={rowLabel}>{t('common.runForWide')}</Text>
                        <Switch
                            value={config.runsForWide > 0}
                            onValueChange={(v) => updateConfig('runsForWide', v ? 1 : 0)}
                            trackColor={{ false: "#374151", true: "#2563EB" }}
                            thumbColor="#fff"
                        />
                    </View>
                    <View className="flex-row justify-between items-center mb-4">
                        <Text className={rowLabel}>{t('common.runForNoBall')}</Text>
                        <Switch
                            value={config.runsForNoBall > 0}
                            onValueChange={(v) => updateConfig('runsForNoBall', v ? 1 : 0)}
                            trackColor={{ false: "#374151", true: "#2563EB" }}
                            thumbColor="#fff"
                        />
                    </View>
                    <View className="flex-row justify-between items-center mb-4">
                        <Text className={rowLabel}>{t('common.reballForWide')}</Text>
                        <Switch
                            value={config.reballForWide}
                            onValueChange={(v) => updateConfig('reballForWide', v)}
                            trackColor={{ false: "#374151", true: "#2563EB" }}
                            thumbColor="#fff"
                        />
                    </View>
                    <View className="flex-row justify-between items-center mb-4">
                        <Text className={rowLabel}>{t('common.reballForNoBall')}</Text>
                        <Switch
                            value={config.reballForNoBall}
                            onValueChange={(v) => updateConfig('reballForNoBall', v)}
                            trackColor={{ false: "#374151", true: "#2563EB" }}
                            thumbColor="#fff"
                        />
                    </View>
                </View>

                <TouchableOpacity
                    className={`p-4 rounded-xl items-center mb-10 shadow-lg ${(!canStartMatch()) ? (isDark ? 'bg-gray-700 shadow-none' : 'bg-gray-300 shadow-none') : 'bg-blue-600 shadow-blue-900/50'}`}
                    onPress={handleStartMatch}
                    disabled={!canStartMatch()}
                >
                    <Text className="text-white text-lg font-bold">{t('common.startMatch')}</Text>
                </TouchableOpacity>

            </KeyboardAwareScrollView>
        </SafeAreaView>
    );
}
