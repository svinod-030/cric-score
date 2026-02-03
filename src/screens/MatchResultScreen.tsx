import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Linking, Platform, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ViewShot from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMatchStore } from '../store/useMatchStore';
import { ScorecardSection } from '../components/ScorecardSection';
import { OverSummarySection } from '../components/OverSummarySection';
import { APP_CONFIG } from '../utils/constants';

export default function MatchResultScreen({ navigation, route }: any) {
    const { state, resetMatch } = useMatchStore();
    const viewShotRef = useRef<any>(null);
    const [isSharing, setIsSharing] = React.useState(false);

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

    const handleRateApp = () => {
        if (Platform.OS === 'android') {
            Linking.openURL(APP_CONFIG.STORE_URL_ANDROID);
        } else {
            Linking.openURL(APP_CONFIG.STORE_URL_IOS);
        }
    };

    const handleShare = async () => {
        try {
            setIsSharing(true);
            // Wait for UI to expand and render
            await new Promise(resolve => setTimeout(resolve, 500));

            const uri = await viewShotRef.current.capture();

            setIsSharing(false);

            if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(uri, {
                    mimeType: 'image/png',
                    dialogTitle: 'Share Match Scoreboard',
                    UTI: 'public.png',
                });
            } else {
                Alert.alert("Error", "Sharing is not available on this device");
            }
        } catch (error) {
            console.error("Failed to share scoreboard:", error);
            setIsSharing(false);
            Alert.alert("Error", "Failed to capture scoreboard image");
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-900" edges={['bottom', 'left', 'right']}>
            <ScrollView className="flex-1">
                <ViewShot
                    ref={viewShotRef}
                    options={{ format: 'png', quality: 0.9 }}
                    style={{ backgroundColor: '#111827' }} // Matches gray-900
                >
                    <View className="bg-gray-900">
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
                                title={`1st Innings: ${innings1.battingTeam}`}
                                innings={innings1}
                                battingTeamPlayers={innings1.battingTeam === state.teamA ? teamAPlayers : teamBPlayers}
                                bowlingTeamPlayers={innings1.battingTeam === state.teamA ? teamBPlayers : teamAPlayers}
                                isCollapsible={true}
                                defaultExpanded={true}
                                expanded={isSharing ? true : undefined}
                            />

                            <OverSummarySection
                                title={`1st Innings Over Summary`}
                                innings={innings1}
                                defaultExpanded={false}
                                expanded={isSharing ? true : undefined}
                            />

                            {(innings2.totalRuns > 0 || innings2.overs.length > 0 || innings2.currentOver.length > 0) && (
                                <>
                                    <ScorecardSection
                                        title={`2nd Innings: ${innings2.battingTeam}`}
                                        innings={innings2}
                                        battingTeamPlayers={innings2.battingTeam === state.teamA ? teamAPlayers : teamBPlayers}
                                        bowlingTeamPlayers={innings2.battingTeam === state.teamA ? teamBPlayers : teamAPlayers}
                                        isCollapsible={true}
                                        defaultExpanded={false}
                                        expanded={isSharing ? true : undefined}
                                    />
                                    <OverSummarySection
                                        title={`2nd Innings Over Summary`}
                                        innings={innings2}
                                        defaultExpanded={false}
                                        expanded={isSharing ? true : undefined}
                                    />
                                </>
                            )}
                        </View>
                        {/* Add branding or footer for the screenshot */}
                        <View className="p-4 items-center">
                            <Text className="text-gray-600 text-xs italic">Cric-Score - Your Cricket Companion</Text>
                        </View>
                    </View>
                </ViewShot>

                <View className="p-6 pt-0">
                    <TouchableOpacity
                        className="bg-green-600 w-full p-4 rounded-xl flex-row items-center justify-center gap-2 shadow-lg shadow-green-900/50 mb-4"
                        onPress={handleShare}
                    >
                        <Ionicons name="share-social" size={20} color="white" />
                        <Text className="text-white text-lg font-bold">Share Scoreboard</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        className="bg-blue-600 w-full p-4 rounded-xl items-center shadow-lg shadow-blue-900/50 mb-4"
                        onPress={handleRateApp}
                    >
                        <Text className="text-white text-lg font-bold">Rate App</Text>
                    </TouchableOpacity>
                    {!isHistoryView && (
                        <TouchableOpacity
                            className="bg-blue-600 w-full p-4 rounded-xl items-center shadow-lg shadow-blue-900/50 mb-4"
                            onPress={handleNewMatch}
                        >
                            <Text className="text-white text-lg font-bold">Start New Match</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
