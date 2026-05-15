import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, TextInput, ActivityIndicator, Image, Alert, TouchableWithoutFeedback } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ViewShot from 'react-native-view-shot';
import Share from 'react-native-share';
import { useMatchStore } from '../store/useMatchStore';
import { useAuthStore } from '../store/useAuthStore';
import { backupToDrive } from '../utils/backupService';
import { APP_CONFIG } from '../utils/constants';
import { ExtraType, WicketType } from '../types/match';
import { BowlerSelectionModal } from '../components/BowlerSelectionModal';
import { BatterSelectionModal } from '../components/BatterSelectionModal';
import { ScorecardSection } from '../components/ScorecardSection';
import { OverSummarySection } from '../components/OverSummarySection';
import { RunSelectionModal } from '../components/RunSelectionModal';
import { WicketTypeSelectionModal } from '../components/WicketTypeSelectionModal';
import { FielderSelectionModal } from '../components/FielderSelectionModal';
import { WhoIsOutModal } from '../components/WhoIsOutModal';
import { MatchStartModal } from '../components/MatchStartModal';
import { MatchCard } from '../components/MatchCard';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';



const EditablePlayerName = ({
    name,
    onSave,
    textClassName = "text-white font-bold text-lg",
    containerClassName = ""
}: {
    name: string;
    onSave: (newName: string) => void;
    textClassName?: string;
    containerClassName?: string;
}) => {
    const [isEditing, setIsEditing] = useState(false);
    const [tempName, setTempName] = useState(name);

    useEffect(() => {
        setTempName(name);
    }, [name]);

    const handleSave = () => {
        if (tempName.trim()) {
            onSave(tempName.trim());
        } else {
            setTempName(name); // Revert if empty
        }
        setIsEditing(false);
    };

    if (isEditing) {
        return (
            <TextInput
                value={tempName}
                onChangeText={setTempName}
                onBlur={handleSave}
                onSubmitEditing={handleSave}
                autoFocus
                className={`${textClassName} border-b border-blue-500 min-w-[100px] p-0`}
                selectionColor="#3b82f6"
            />
        );
    }

    return (
        <TouchableOpacity
            onPress={() => {
                setIsEditing(true);
                setTempName('');
            }}
            className={`flex-row items-center gap-2 ${containerClassName}`}
        >
            <Text className={`max-w-[150px] ${textClassName}`}>{name}</Text>
            <Ionicons name="pencil" size={14} color="#6b7280" />
        </TouchableOpacity >
    );
};

export default function ScoreboardScreen({ navigation }: any) {
    const { t } = useTranslation();
    const { state, config, recordBall, endInnings, resetMatch, setBowler, setStriker, setNonStriker, undoBall, swapBatsmen, retirePlayer, startSecondInnings, renamePlayer, startLiveShare } = useMatchStore();
    const viewShotRef = useRef<any>(null);
    const innings = state.currentInnings === 1 ? state.innings1 : state.innings2;
    const currentOverValidBalls = innings.currentOver.filter(b => b.isValidBall).length;

    // Derived Rosters
    const bowlingTeamPlayers = innings.battingTeamKey === 'teamA' ? state.teamBPlayers : state.teamAPlayers;

    // Filter available bowlers (no consecutive overs)
    const lastOver = innings.overs.length > 0 ? innings.overs[innings.overs.length - 1] : null;
    const lastBowlerId = lastOver ? lastOver.bowlerId : null;
    const availableBowlers = bowlingTeamPlayers.filter(p => p.id !== lastBowlerId);

    // Check if it's the very start of an innings (no balls bowled, no players selected)
    const isStartOfInnings = innings.overs.length === 0 && innings.currentOver.length === 0 && !innings.strikerId;

    const [isMatchStartModalVisible, setMatchStartModalVisible] = useState(false);
    const [isBowlerModalVisible, setBowlerModalVisible] = useState(false);
    const [runModalVisible, setRunModalVisible] = useState(false);
    const [wicketModalVisible, setWicketModalVisible] = useState(false);
    const [fielderModalVisible, setFielderModalVisible] = useState(false);
    const [whoIsOutModalVisible, setWhoIsOutModalVisible] = useState(false);
    const [runModalConfig, setRunModalConfig] = useState<{ title: string; type: ExtraType | 'wicket'; runs: number; options?: number[]; showByeToggle?: boolean }>({ title: '', type: 'none', runs: 0 });

    const [isBatterModalVisible, setBatterModalVisible] = useState(false);
    const [batterSelectionType, setBatterSelectionType] = useState<'striker' | 'nonStriker' | null>(null);

    // Pending Wicket State
    const [pendingWicket, setPendingWicket] = useState<{ type: WicketType; fielderId?: string; runs?: number }>({ type: 'none' });
    const [isSharingLive, setIsSharingLive] = useState(false);
    const [isQRModalVisible, setQRModalVisible] = useState(false);
    const [isBatterSelectionVisible, setBatterSelectionVisible] = useState(false);

    const handleShareMatch = async () => {
        const { isAuthenticated } = useAuthStore.getState();
        if (!isAuthenticated) {
            Alert.alert(
                t('common.signInRequired'),
                t('common.pleaseSignInToShare'),
                [
                    { text: t('common.cancel'), style: 'cancel' },
                    { text: t('common.signInWithGoogle'), onPress: () => navigation.navigate('Profile') }
                ]
            );
            return;
        }

        try {
            setIsSharingLive(true);
            const matchId = await startLiveShare();

            // Wait for QR code to potentially load and for ViewShot to be ready
            await new Promise(resolve => setTimeout(resolve, 1500));

            if (viewShotRef.current) {
                const uri = await viewShotRef.current.capture();
                const message = `🔴 ${t('common.shareMatchScore')}\n\n${t('common.shareLivePromo')}\n📲 ${t('common.downloadAppPrompt', { link: APP_CONFIG.STORE_URL_ANDROID })}`;

                const shareOptions = {
                    title: t('common.shareMatchScore'),
                    message: message,
                    url: uri,
                    type: 'image/png',
                };

                await Share.open(shareOptions);
            }
        } catch (e: any) {
            if (e.message !== 'User did not share') {
                Alert.alert(t('common.error'), t('common.failedToStartLiveShare'));
            }
        } finally {
            setIsSharingLive(false);
        }
    };

    const handleShowQR = async () => {
        const { isAuthenticated } = useAuthStore.getState();
        if (!isAuthenticated) {
            Alert.alert(
                t('common.signInRequired'),
                t('common.pleaseSignInToShare'),
                [
                    { text: t('common.cancel'), style: 'cancel' },
                    { text: t('common.signInWithGoogle'), onPress: () => navigation.navigate('Profile') }
                ]
            );
            return;
        }

        try {
            if (!state.liveMatchId) {
                setIsSharingLive(true);
                await startLiveShare();
                setIsSharingLive(false);
            }
            setQRModalVisible(true);
        } catch (e) {
            console.error("Failed to show QR:", e);
            setIsSharingLive(false);
            Alert.alert(t('common.error'), t('common.failedToStartLiveShare'));
        }
    };

    useEffect(() => {
        const handleMatchEnd = async () => {
            if (!state.isPlaying && state.matchResult) {
                // If authenticated, backup immediately
                const { isAuthenticated } = useAuthStore.getState();
                if (isAuthenticated) {
                    console.log('Match completed, triggering auto-backup...');
                    backupToDrive(); // Fire and forget in background
                }
                navigation.replace('MatchResult');
            }
        };

        handleMatchEnd();
    }, [state.isPlaying, state.matchResult]);

    // Check for start of innings vs other states
    useEffect(() => {
        if (state.isPlaying && !state.isInningsBreak) {
            if (isStartOfInnings) {
                setMatchStartModalVisible(true);
                setBowlerModalVisible(false);
                setBatterSelectionVisible(false);
            } else {
                setMatchStartModalVisible(false);

                // Normal checks for missing players during match
                if (!innings.currentBowlerId) {
                    setBowlerModalVisible(true);
                } else {
                    setBowlerModalVisible(false);
                }

                if (!innings.strikerId || !innings.nonStrikerId) {
                    const roster = innings.battingTeam === state.teamA ? state.teamAPlayers : state.teamBPlayers;
                    const availableBatters = roster.filter(p => {
                        const stats = innings.battingStats[p.id];
                        const isOtherBatter = p.id === (innings.strikerId || innings.nonStrikerId);
                        return !isOtherBatter && (!stats || !stats.isOut);
                    });
                    const retiredBatters = roster.filter(p => innings.battingStats[p.id]?.isRetired && !innings.battingStats[p.id]?.isOut);

                    if (availableBatters.length === 0 && retiredBatters.length === 0 && !innings.isLastManStanding && innings.totalWickets === config.playersPerTeam - 1) {
                        Alert.alert(
                            t('common.lastManStanding'),
                            t('common.continueBattingAlone'),
                            [
                                { text: t('common.no'), style: 'cancel', onPress: () => endInnings() },
                                { text: t('common.yes'), onPress: () => useMatchStore.getState().toggleLastManStanding() }
                            ]
                        );
                        return; // Don't show batter selection if we are showing LMS prompt
                    }
                }

                if (!innings.strikerId && (innings.nonStrikerId || innings.isLastManStanding)) {
                    setBatterSelectionType('striker');
                    setBatterSelectionVisible(true);
                } else if (!innings.nonStrikerId && !innings.isLastManStanding) {
                    setBatterSelectionType('nonStriker');
                    setBatterSelectionVisible(true);
                } else {
                    setBatterSelectionVisible(false);
                    setBatterSelectionType(null);
                }
            }
        } else {
            setMatchStartModalVisible(false);
            setBowlerModalVisible(false);
            setBatterSelectionVisible(false);
        }
    }, [state.isPlaying, state.isInningsBreak, isStartOfInnings, innings.currentBowlerId, innings.strikerId, innings.nonStrikerId]);

    const handleMatchStart = (strikerId: string, nonStrikerId: string, bowlerId: string) => {
        setStriker(strikerId);
        setNonStriker(nonStrikerId);
        setBowler(bowlerId);
        setMatchStartModalVisible(false);
    };

    const handleBatterSelect = (playerId: string) => {
        if (batterSelectionType === 'striker') {
            setStriker(playerId);
        } else {
            setNonStriker(playerId);
        }
    };

    const handleScore = (runs: number) => {
        recordBall(runs, 'none', false);
    };

    const handleExtra = (type: ExtraType) => {
        // If Wide Run is disabled, record immediately without modal
        if (type === 'wide' && config.runsForWide === 0) {
            recordBall(0, 'wide', false);
            return;
        }

        // For ALL extras (Wide, No Ball, Bye, Leg Bye), allow run selection
        const titleMap: Record<string, string> = {
            'wide': t('common.wideBall'),
            'no-ball': t('common.noBall'),
            'bye': t('common.byes'),
            'leg-bye': t('common.legByes')
        };

        let options = [0, 1, 2, 3, 4, 6];
        if (type === 'wide') {
            options = [0, 1, 2, 3, 4];
        }

        setRunModalConfig({
            title: titleMap[type] || t('common.selectExtras'),
            type,
            runs: 0,
            options,
            showByeToggle: type === 'no-ball'
        });
        setRunModalVisible(true);
    };

    const handleWicket = () => {
        setWicketModalVisible(true);
    };

    const handleWicketSelect = (type: WicketType) => {
        setWicketModalVisible(false);
        setPendingWicket({ type });

        if (['caught', 'run-out', 'stumped'].includes(type)) {
            setFielderModalVisible(true);
        } else {
            recordBall(0, 'none', true, type);
        }
    };

    const handleFielderSelect = (fielderId: string) => {
        setFielderModalVisible(false);
        const nextPending = { ...pendingWicket, fielderId };
        setPendingWicket(nextPending);

        if (nextPending.type === 'run-out') {
            setRunModalConfig({
                title: t('common.selectRunsForRunOut'),
                type: 'wicket',
                runs: 0,
                options: [0, 1, 2, 3]
            });
            setRunModalVisible(true);
        } else {
            recordBall(0, 'none', true, nextPending.type, fielderId);
        }
    };

    const handleRunSelection = (runs: number, isBye?: boolean) => {
        setRunModalVisible(false);
        if (runModalConfig.type === 'wicket') {
            // If it's a run out, we must ask "Who is out?"
            if (pendingWicket.type === 'run-out') {
                // Save the runs temporarily, use existing pendingWicket state
                setPendingWicket(prev => ({ ...prev, runs }));
                setTimeout(() => setWhoIsOutModalVisible(true), 200); // Small delay for modal smooth transition
            } else {
                recordBall(runs, 'none', true, pendingWicket.type, pendingWicket.fielderId);
            }
        } else {
            recordBall(runs, runModalConfig.type as ExtraType, false, undefined, undefined, isBye);
        }
    };

    const handleWhoIsOutSelect = (who: 'striker' | 'non-striker') => {
        setWhoIsOutModalVisible(false);
        recordBall(pendingWicket.runs || 0, 'none', true, pendingWicket.type, pendingWicket.fielderId, false, who);
    };

    const handleEndInnings = () => {
        Alert.alert(
            t('common.endInnings'),
            state.currentInnings === 1
                ? t('common.end1stInningsConfirm')
                : t('common.endMatchConfirm'),
            [
                { text: t('common.cancel'), style: "cancel" },
                { text: t('common.endInnings'), style: "destructive", onPress: () => endInnings() }
            ]
        );
    };

    // Stats Helpers
    const getBatterStats = (id: string) => innings.battingStats[id] || { runs: 0, ballsFaced: 0, fours: 0, sixes: 0 };
    const getBowlerStats = (id: string | null) => id ? innings.bowlingStats[id] || { overs: 0, runsConceded: 0, wickets: 0, balls: 0 } : null;

    const getPlayerName = (id: string) => {
        if (!id) return t('common.selectPlayer');
        const player = [...state.teamAPlayers, ...state.teamBPlayers].find(p => p.id === id);
        return player ? player.name : id;
    };

    const strikerStats = getBatterStats(innings.strikerId);
    const nonStrikerStats = getBatterStats(innings.nonStrikerId);
    const currentBowlerStats = getBowlerStats(innings.currentBowlerId);
    // Calculate partial overs for display (e.g. 1.2)
    const bowlerOversDisplay = currentBowlerStats
        ? `${currentBowlerStats.overs}.${currentBowlerStats.balls % 6}`
        : "0.0";


    return (
        <SafeAreaView className="flex-1 bg-gray-900" edges={['bottom', 'left', 'right']}>
            {/* Hidden ViewShot for Match Card sharing */}
            <View style={{ position: 'absolute', left: -9999, top: -9999 }}>
                <ViewShot ref={viewShotRef} options={{ format: 'png', quality: 0.9 }}>
                    <MatchCard state={state} matchId={state.liveMatchId || ''} t={t} />
                </ViewShot>
            </View>

            <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                {/* Header / Score */}
                {!state.isInningsBreak && (
                    <View className="p-6 pb-2 border-b border-gray-800">
                        {/* Team Status Row */}
                        <View className="items-center mb-4">
                            <View className="flex-row items-center bg-gray-800/50 px-4 py-1.5 rounded-full border border-gray-700">
                                <View className="w-2 h-2 rounded-full bg-red-600 mr-2 animate-pulse" />
                                <Text className="text-gray-300 font-black uppercase tracking-[2px] text-[10px]">
                                    {innings.battingTeam} {t('common.batting')}
                                </Text>
                            </View>
                        </View>

                        <View className="items-center mb-6">
                            <Text className="text-6xl font-black text-white">
                                {innings.totalRuns}/{innings.totalWickets}
                            </Text>
                            <Text className="text-xl text-gray-400 mt-2">
                                {t('common.overs')}: {innings.overs.length}.{currentOverValidBalls} ({state.overs})
                            </Text>

                            {state.currentInnings === 2 && (
                                <View className="mt-4 bg-gray-800 px-4 py-2 rounded-lg">
                                    <Text className="text-yellow-500 font-bold text-lg text-center">
                                        {t('common.target')}: {state.innings1.totalRuns + 1}
                                    </Text>
                                    <Text className="text-gray-300 text-sm text-center mt-1">
                                        {t('common.needRunsInBalls', {
                                            runs: state.innings1.totalRuns + 1 - innings.totalRuns,
                                            balls: (state.overs * 6) - (innings.overs.length * 6 + currentOverValidBalls)
                                        })}
                                    </Text>
                                </View>
                            )}
                        </View>
                        {/* Action Buttons Row */}
                        <View className="flex-row justify-between items-center mb-4">
                            <View className="flex-row items-center gap-2">
                                <TouchableOpacity
                                    onPress={handleShareMatch}
                                    className="flex-row items-center bg-blue-600 px-3 py-2 rounded-xl shadow-lg shadow-blue-500/20"
                                >
                                    {isSharingLive ? (
                                        <ActivityIndicator color="white" size="small" />
                                    ) : (
                                        <>
                                            <Ionicons name={state.liveMatchId ? "share-social" : "radio"} size={14} color="white" />
                                            <Text className="text-white text-[10px] font-black ml-1.5 uppercase tracking-wider">
                                                {state.liveMatchId ? t('common.shareMatchScore') : t('common.goLive')}
                                            </Text>
                                        </>
                                    )}
                                </TouchableOpacity>

                                <TouchableOpacity
                                    onPress={handleShowQR}
                                    className="bg-gray-800 p-2 rounded-xl border border-gray-700 w-10 h-10 items-center justify-center"
                                >
                                    <Ionicons name="qr-code-outline" size={18} color="#3b82f6" />
                                </TouchableOpacity>
                            </View>

                            <TouchableOpacity
                                onPress={handleEndInnings}
                                className="bg-red-900/20 px-4 py-2 rounded-xl border border-red-900/40"
                            >
                                <Text className="text-red-500 text-[10px] font-black uppercase tracking-widest">{t('common.end')}</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Player Stats Bar */}
                        <View className={`flex-row ${innings.isLastManStanding ? 'justify-center' : 'justify-between'} bg-gray-800 p-3 rounded-xl mb-4`}>
                            <View className={innings.isLastManStanding ? 'items-center' : ''}>
                                <EditablePlayerName
                                    name={getPlayerName(innings.strikerId) + "*"}
                                    onSave={(newName) => renamePlayer(innings.strikerId, newName.replace('*', ''))}
                                />
                                <Text className="text-gray-400">
                                    {strikerStats.runs} ({strikerStats.ballsFaced})
                                </Text>
                            </View>
                            {!innings.isLastManStanding && (
                                <View className="items-end">
                                    <EditablePlayerName
                                        name={getPlayerName(innings.nonStrikerId)}
                                        onSave={(newName) => renamePlayer(innings.nonStrikerId, newName)}
                                    />
                                    <Text className="text-gray-400">
                                        {nonStrikerStats.runs} ({nonStrikerStats.ballsFaced})
                                    </Text>
                                </View>
                            )}
                        </View>

                        {/* Current Bowler Bar */}
                        <View className="flex-row justify-between items-center bg-gray-800 p-3 rounded-xl mb-4">
                            <View>
                                <Text className="text-gray-400 text-xs uppercase font-bold">{t('common.bowler')}</Text>
                                {innings.currentBowlerId ? (
                                    <EditablePlayerName
                                        name={getPlayerName(innings.currentBowlerId)}
                                        onSave={(newName) => renamePlayer(innings.currentBowlerId!, newName)}
                                    />
                                ) : (
                                    <Text className="text-white font-bold text-lg">{t('common.selectBowler')}</Text>
                                )}
                            </View>
                            <View className="items-end">
                                <Text className="text-white font-bold">
                                    {currentBowlerStats ? `${currentBowlerStats.wickets}-${currentBowlerStats.runsConceded}` : "0-0"}
                                </Text>
                                <Text className="text-gray-400 text-xs">
                                    {bowlerOversDisplay} {t('common.overs')}
                                </Text>
                            </View>
                        </View>


                        <View className="mb-4">
                            <Text className="text-gray-400 mb-2 text-sm">{t('common.thisOver')}</Text>
                            <View className="flex-row gap-2 min-h-[32px] flex-wrap">
                                {innings.currentOver.length > 0 ? (
                                    innings.currentOver.map((ball, idx) => (
                                        <View
                                            key={idx}
                                            className={`px-2 h-8 rounded-full items-center justify-center border border-white/10 ${ball.isWicket ? 'bg-red-600' : ball.extraType !== 'none' ? 'bg-yellow-600' : ball.runs >= 4 ? 'bg-green-600' : 'bg-gray-700'}`}
                                        >
                                            <View className="flex-row items-center">
                                                <Text className="text-white font-bold text-xs">
                                                    {ball.isWicket ? 'W' : ball.extraType !== 'none' ? ball.extraType === 'wide' ? 'WD' : ball.extraType === 'no-ball' ? 'NB' : ball.extraType === 'bye' ? 'B' : 'LB' : ball.runs}
                                                </Text>
                                                {(ball.extraType === 'bye' || ball.extraType === 'leg-bye' || (ball.isWicket && ball.runs > 0) || (ball.extraType === 'no-ball' && ball.runs > state.runsForNoBall) || (ball.extraType === 'wide' && ball.runs > state.runsForWide)) && (
                                                    <Text className="text-white font-bold text-[10px] ml-0.5">+{ball.extraType === 'no-ball' ? ball.runs - state.runsForNoBall : ball.extraType === 'wide' ? ball.runs - state.runsForWide : ball.runs}</Text>
                                                )}
                                            </View>
                                        </View>
                                    ))
                                ) : (
                                    <Text className="text-gray-600 text-sm italic">-</Text>
                                )}
                            </View>
                        </View>

                        {/* Quick Controls */}
                        <View className="flex-row gap-2 mt-2">
                            <TouchableOpacity
                                onPress={undoBall}
                                className="flex-1 bg-red-900/30 py-2 rounded-lg flex-row items-center justify-center border border-red-800/50"
                            >
                                <Ionicons name="arrow-undo" size={16} color="#ef4444" />
                                <Text className="text-red-500 font-bold ml-2">{t('common.undo')}</Text>
                            </TouchableOpacity>
                            {!innings.isLastManStanding && (
                                <TouchableOpacity
                                    onPress={swapBatsmen}
                                    className="flex-1 bg-blue-900/30 py-2 rounded-lg flex-row items-center justify-center border border-blue-800/50"
                                >
                                    <Ionicons name="swap-horizontal" size={16} color="#3b82f6" />
                                    <Text className="text-blue-500 font-bold ml-2">{t('common.swap')}</Text>
                                </TouchableOpacity>
                            )}
                            <TouchableOpacity
                                onPress={() => retirePlayer(innings.strikerId)}
                                className="flex-1 bg-orange-900/30 py-2 rounded-lg flex-row items-center justify-center border border-orange-800/50"
                            >
                                <Ionicons name="exit-outline" size={16} color="#f97316" />
                                <Text className="text-orange-500 font-bold ml-2">{t('common.retire')}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}


                {state.isInningsBreak ? (
                    <View className="flex-1 p-6">
                        <View className="items-center mb-8 bg-gray-800 p-8 rounded-3xl border border-blue-900/30">
                            <Ionicons name="trophy" size={64} color="#fbbf24" className="mb-4" />
                            <Text className="text-white text-3xl font-black text-center">{t('common.inningsOver')}</Text>
                            <Text className="text-gray-400 text-lg mt-2">{t('common.finishedTheirInnings', { team: state.innings1.battingTeam })}</Text>
                            <View className="mt-6 flex-row items-baseline">
                                <Text className="text-5xl font-bold text-white">{state.innings1.totalRuns}</Text>
                                <Text className="text-2xl text-gray-500 font-medium ml-2">/ {state.innings1.totalWickets}</Text>
                            </View>
                        </View>

                        <ScorecardSection
                            title={`${t('common.stInnings')}: ${state.innings1.battingTeam}`}
                            innings={state.innings1}
                            battingTeamPlayers={state.innings1.battingTeamKey === 'teamA' ? state.teamAPlayers : state.teamBPlayers}
                            bowlingTeamPlayers={state.innings1.battingTeamKey === 'teamA' ? state.teamBPlayers : state.teamAPlayers}
                        />

                        <TouchableOpacity
                            onPress={startSecondInnings}
                            className="mt-10 mb-20 bg-blue-600 p-5 rounded-2xl items-center shadow-lg shadow-blue-500/30 active:bg-blue-700"
                        >
                            <Text className="text-white text-xl font-black">{t('common.start2ndInnings')}</Text>
                            <Text className="text-blue-200 text-sm mt-1 uppercase tracking-widest font-bold">{t('common.target')}: {state.innings1.totalRuns + 1}</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View className="flex-1 p-4">
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
                                    <Text className="text-red-500 text-2xl font-bold">{t('common.wicket')}</Text>
                                </TouchableOpacity>
                            </View>

                            {/* Extras */}
                            <Text className="text-gray-400 mt-4 mb-2">{t('common.extras')}</Text>
                            <View className="flex-row gap-4">
                                <TouchableOpacity
                                    onPress={() => handleExtra('wide')}
                                    className="flex-1 h-14 bg-gray-800 rounded-xl items-center justify-center border border-gray-700"
                                >
                                    <Text className="text-yellow-500 font-bold text-lg">{t('common.wide')}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => handleExtra('no-ball')}
                                    className="flex-1 h-14 bg-gray-800 rounded-xl items-center justify-center border border-gray-700"
                                >
                                    <Text className="text-yellow-500 font-bold text-lg">{t('common.noBall')}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => handleExtra('bye')}
                                    className="flex-1 h-14 bg-gray-800 rounded-xl items-center justify-center border border-gray-700"
                                >
                                    <Text className="text-yellow-500 font-bold text-lg">{t('common.byes')}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => handleExtra('leg-bye')}
                                    className="flex-1 h-14 bg-gray-800 rounded-xl items-center justify-center border border-gray-700"
                                >
                                    <Text className="text-yellow-500 font-bold text-lg">{t('common.lBye')}</Text>
                                </TouchableOpacity>
                            </View>

                            {/* Full Scorecard Section */}
                            <View className="mt-10 mb-20">
                                <Text className="text-white text-2xl font-bold mb-4 px-2">{t('common.scorecard')}</Text>

                                {state.currentInnings === 2 && (
                                    <View className="mb-4">
                                        <ScorecardSection
                                            title={`${t('common.stInnings')}: ${state.innings1.battingTeam}`}
                                            innings={state.innings1}
                                            battingTeamPlayers={state.innings1.battingTeamKey === 'teamA' ? state.teamAPlayers : state.teamBPlayers}
                                            bowlingTeamPlayers={state.innings1.battingTeamKey === 'teamA' ? state.teamBPlayers : state.teamAPlayers}
                                            isCollapsible={true}
                                            defaultExpanded={true}
                                        />
                                        <OverSummarySection
                                            title={t('common.overSummaryTitle', { innings: t('common.stInnings') })}
                                            innings={state.innings1}
                                            bowlingTeamPlayers={state.innings1.battingTeamKey === 'teamA' ? state.teamBPlayers : state.teamAPlayers}
                                            defaultExpanded={false}
                                        />
                                    </View>
                                )}

                                <ScorecardSection
                                    title={`${state.currentInnings === 2 ? t('common.ndInnings') : t('common.stInnings')}: ${innings.battingTeam}`}
                                    innings={innings}
                                    battingTeamPlayers={innings.battingTeamKey === 'teamA' ? state.teamAPlayers : state.teamBPlayers}
                                    bowlingTeamPlayers={innings.battingTeamKey === 'teamA' ? state.teamAPlayers : state.teamBPlayers}
                                    isCollapsible={true}
                                    defaultExpanded={state.currentInnings === 1}
                                />

                                <OverSummarySection
                                    title={t('common.overSummaryTitle', { innings: state.currentInnings === 2 ? t('common.ndInnings') : t('common.stInnings') })}
                                    innings={innings}
                                    bowlingTeamPlayers={bowlingTeamPlayers}
                                    defaultExpanded={false}
                                />
                            </View>

                        </View>
                    </View>
                )}

            </ScrollView>

            <BowlerSelectionModal
                visible={isBowlerModalVisible}
                players={availableBowlers}
                onSelect={setBowler}
            />
            <BatterSelectionModal
                visible={isBatterSelectionVisible}
                title={batterSelectionType === 'striker' ? t('common.selectStriker') : t('common.selectNonStriker')}
                battingStats={innings.battingStats}
                players={(innings.battingTeam === state.teamA ? state.teamAPlayers : state.teamBPlayers).filter(p => {
                    const stats = innings.battingStats[p.id];
                    const isOtherBatter = batterSelectionType === 'striker' ? p.id === innings.nonStrikerId : p.id === innings.strikerId;
                    return !isOtherBatter && (!stats || !stats.isOut);
                })}
                onSelect={handleBatterSelect}
            />
            <RunSelectionModal
                visible={runModalVisible}
                title={runModalConfig.title}
                onSelect={handleRunSelection}
                onClose={() => setRunModalVisible(false)}
                options={runModalConfig.options}
            />
            <WicketTypeSelectionModal
                visible={wicketModalVisible}
                onSelect={handleWicketSelect}
                onClose={() => setWicketModalVisible(false)}
            />
            <FielderSelectionModal
                visible={fielderModalVisible}
                players={bowlingTeamPlayers}
                onSelect={handleFielderSelect}
                title={pendingWicket.type === 'caught' ? t('common.whoCaughtIt') : pendingWicket.type === 'stumped' ? t('common.whoStumpedIt') : t('common.whoMadeRunOut')}
                onCancel={() => setFielderModalVisible(false)}
            />
            <WhoIsOutModal
                visible={whoIsOutModalVisible}
                strikerName={getPlayerName(innings.strikerId)}
                nonStrikerName={getPlayerName(innings.nonStrikerId)}
                onSelect={handleWhoIsOutSelect}
                onCancel={() => setWhoIsOutModalVisible(false)}
            />
            <MatchStartModal
                visible={isMatchStartModalVisible}
                battingTeamPlayers={innings.battingTeamKey === 'teamA' ? state.teamAPlayers : state.teamBPlayers}
                bowlingTeamPlayers={bowlingTeamPlayers}
                onStart={handleMatchStart}
                title={state.currentInnings === 1 ? t('common.start1stInnings') : t('common.start2ndInningsTitle')}
            />

            {/* QR View Modal */}
            <Modal
                visible={isQRModalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setQRModalVisible(false)}
            >
                <TouchableWithoutFeedback onPress={() => setQRModalVisible(false)}>
                    <View className="flex-1 bg-black/80 justify-center items-center p-4">
                        <TouchableWithoutFeedback>
                            <View className="bg-gray-900 rounded-[40px] overflow-hidden border border-gray-800 shadow-2xl">
                                <MatchCard state={state} matchId={state.liveMatchId || ''} t={t} />
                                <TouchableOpacity
                                    onPress={() => setQRModalVisible(false)}
                                    className="absolute top-4 right-4 bg-black/40 p-2 rounded-full"
                                >
                                    <Ionicons name="close" size={24} color="#fff" />
                                </TouchableOpacity>
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        </SafeAreaView>
    );
}
