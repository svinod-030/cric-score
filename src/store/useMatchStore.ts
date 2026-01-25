import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MatchConfig, MatchState, InningsState, ExtraType, WicketType, Player } from '../types/match';
import { processBall } from '../utils/scoringUtils';

interface MatchStore {
    config: MatchConfig;
    state: MatchState;
    history: MatchState[];
    ballHistory: MatchState[];
    setConfig: (config: Partial<MatchConfig>) => void;
    startMatch: () => void;
    setBowler: (playerId: string) => void;
    setStriker: (playerId: string) => void;
    setNonStriker: (playerId: string) => void;
    endInnings: () => void;
    recordBall: (runs: number, extraType: ExtraType, isWicket: boolean, wicketType?: WicketType, fielderId?: string, isByeForNoBall?: boolean, whoIsOut?: 'striker' | 'non-striker') => void;
    startSecondInnings: () => void;
    undoBall: () => void;
    swapBatsmen: () => void;
    retirePlayer: (playerId: string) => void;
    resetMatch: () => void;
    restoreMatches: (backupData: string) => void;
    renamePlayer: (playerId: string, newName: string) => void;
    loadTeamRoster: (teamKey: 'teamA' | 'teamB', teamName: string) => void;
    saveTeamRoster: (teamName: string, playerNames: string[]) => void;
}

const INITIAL_CONFIG: MatchConfig = {
    teamA: "Team A",
    teamB: "Team B",
    overs: 5,
    playersPerTeam: 11,
    runsForWide: 1,
    runsForNoBall: 1,
    reballForWide: true,
    reballForNoBall: true,
    savedTeams: {},
};

const INITIAL_INNINGS: InningsState = {
    battingTeam: "",
    battingTeamKey: 'teamA',
    totalRuns: 0,
    totalWickets: 0,
    overs: [],
    currentOver: [],
    strikerId: "",
    nonStrikerId: "",
    currentBowlerId: null,
    battingStats: {},
    bowlingStats: {},
    fallOfWickets: []
};

export const useMatchStore = create<MatchStore>()(
    persist(
        (set, get) => ({
            config: INITIAL_CONFIG,
            state: {
                ...INITIAL_CONFIG,
                isPlaying: false,
                matchResult: null,
                currentInnings: 1,
                isInningsBreak: false,
                teamAPlayers: [],
                teamBPlayers: [],
                innings1: INITIAL_INNINGS,
                innings2: INITIAL_INNINGS,
            },
            history: [],
            ballHistory: [],
            setConfig: (updates) =>
                set((store) => ({ config: { ...store.config, ...updates } })),

            loadTeamRoster: (teamKey, teamName) => {
                const { config } = get();
                const key = teamKey === 'teamA' ? 'teamAPlayerNames' : 'teamBPlayerNames';

                if (config.savedTeams && config.savedTeams[teamName]) {
                    const savedNames = config.savedTeams[teamName];
                    set((store) => ({
                        config: {
                            ...store.config,
                            [key]: savedNames,
                            isCustomNamesEnabled: true
                        }
                    }));
                } else {
                    // Start generating default names if team is new/unsaved
                    const displayTeamName = teamName || (teamKey === 'teamA' ? config.teamA || "Team A" : config.teamB || "Team B");
                    const defaultNames = Array.from({ length: config.playersPerTeam }, (_, i) => `${displayTeamName} Player ${i + 1}`);

                    set((store) => ({
                        config: {
                            ...store.config,
                            [key]: defaultNames,
                            // We don't force enable custom names here, but we update the values 
                            // so if it IS enabled, they show correctly.
                        }
                    }));
                }
            },

            saveTeamRoster: (teamName, playerNames) => {
                set((store) => ({
                    config: {
                        ...store.config,
                        savedTeams: {
                            ...(store.config.savedTeams || {}),
                            [teamName]: playerNames
                        }
                    }
                }));
            },

            startMatch: () => {
                const { config } = get();
                // Generate Rosters
                const teamAPlayers = Array.from({ length: config.playersPerTeam }, (_, i) => ({
                    id: `A${i + 1}`,
                    name: config.isCustomNamesEnabled && config.teamAPlayerNames?.[i]
                        ? config.teamAPlayerNames[i]
                        : `${config.teamA} Player ${i + 1}`,
                }));
                const teamBPlayers = Array.from({ length: config.playersPerTeam }, (_, i) => ({
                    id: `B${i + 1}`,
                    name: config.isCustomNamesEnabled && config.teamBPlayerNames?.[i]
                        ? config.teamBPlayerNames[i]
                        : `${config.teamB} Player ${i + 1}`,
                }));

                // Auto-save teams on start match
                const savedTeams = config.savedTeams || {};
                const nextSavedTeams = { ...savedTeams };
                let hasUpdates = false;

                if (config.isCustomNamesEnabled) {
                    // Only save if custom names are enabled, otherwise we are saving default names
                    if (config.teamAPlayerNames && config.teamA) {
                        nextSavedTeams[config.teamA] = config.teamAPlayerNames;
                        hasUpdates = true;
                    }
                    if (config.teamBPlayerNames && config.teamB) {
                        nextSavedTeams[config.teamB] = config.teamBPlayerNames;
                        hasUpdates = true;
                    }
                }

                if (hasUpdates) {
                    set(s => ({ config: { ...s.config, savedTeams: nextSavedTeams } }));
                }

                // Determine Batting First Team based on Toss
                let battingFirstKey: 'teamA' | 'teamB' = 'teamA';

                if (config.tossWinner && config.tossDecision) {
                    if (config.tossDecision === 'bat') {
                        battingFirstKey = config.tossWinner;
                    } else {
                        // If winner chose bowl, the OTHER team bats first
                        battingFirstKey = config.tossWinner === 'teamA' ? 'teamB' : 'teamA';
                    }
                }

                const battingFirstTeam = battingFirstKey === 'teamA' ? config.teamA : config.teamB;
                const battingSecondTeam = battingFirstKey === 'teamA' ? config.teamB : config.teamA;

                const firstInningsBattingPlayers = battingFirstKey === 'teamA' ? teamAPlayers : teamBPlayers;
                const firstInningsBowlingPlayers = battingFirstKey === 'teamA' ? teamBPlayers : teamAPlayers;

                set({
                    ballHistory: [],
                    state: {
                        ...config,
                        isPlaying: true,
                        matchResult: null,
                        currentInnings: 1,
                        teamAPlayers,
                        teamBPlayers,
                        innings1: {
                            ...INITIAL_INNINGS,
                            battingTeam: battingFirstTeam,
                            battingTeamKey: battingFirstKey,
                            strikerId: !config.isCustomNamesEnabled ? firstInningsBattingPlayers[0]?.id || "" : "",
                            nonStrikerId: !config.isCustomNamesEnabled ? firstInningsBattingPlayers[1]?.id || "" : "",
                            currentBowlerId: !config.isCustomNamesEnabled ? firstInningsBowlingPlayers[firstInningsBowlingPlayers.length - 1]?.id || null : null,
                        },
                        innings2: {
                            ...INITIAL_INNINGS,
                            battingTeam: battingSecondTeam,
                            battingTeamKey: battingFirstKey === 'teamA' ? 'teamB' : 'teamA'
                        },
                        isInningsBreak: false
                    }
                });
            },

            setBowler: (playerId: string) => {
                set((store) => {
                    const currentInningsKey = store.state.currentInnings === 1 ? 'innings1' : 'innings2';
                    return {
                        state: {
                            ...store.state,
                            [currentInningsKey]: {
                                ...store.state[currentInningsKey],
                                currentBowlerId: playerId
                            }
                        }
                    };
                });
            },

            setStriker: (playerId: string) => {
                set((store) => {
                    const currentInningsKey = store.state.currentInnings === 1 ? 'innings1' : 'innings2';
                    return {
                        state: {
                            ...store.state,
                            [currentInningsKey]: {
                                ...store.state[currentInningsKey],
                                strikerId: playerId
                            }
                        }
                    };
                });
            },

            setNonStriker: (playerId: string) => {
                set((store) => {
                    const currentInningsKey = store.state.currentInnings === 1 ? 'innings1' : 'innings2';
                    return {
                        state: {
                            ...store.state,
                            [currentInningsKey]: {
                                ...store.state[currentInningsKey],
                                nonStrikerId: playerId
                            }
                        }
                    };
                });
            },

            endInnings: () => {
                set((store) => {
                    const { state, config } = store;

                    if (state.currentInnings === 1) {
                        // End 1st innings
                        return {
                            state: {
                                ...state,
                                isInningsBreak: true
                            }
                        };
                    } else {
                        let resultText = '';
                        let winner: string | 'Draw' = 'Draw';
                        const runs1 = state.innings1.totalRuns;
                        const runs2 = state.innings2.totalRuns;

                        if (runs2 > runs1) {
                            winner = state.innings2.battingTeam;
                            const wicketsLeft = config.playersPerTeam - 1 - state.innings2.totalWickets;
                            resultText = `${winner} won by ${wicketsLeft} wickets`;
                        } else if (runs2 === runs1) {
                            resultText = `Match Tied`;
                        } else {
                            winner = state.innings1.battingTeam;
                            resultText = `${winner} won by ${runs1 - runs2} runs`;
                        }

                        const matchResult = {
                            winner: winner,
                            reason: resultText
                        };

                        const completedMatch = { ...state, matchResult, isPlaying: false, completedAt: new Date().toISOString() };

                        return {
                            state: completedMatch,
                            history: [completedMatch, ...store.history],
                            ballHistory: []
                        };
                    }
                });
            },

            recordBall: (runs, extraType, isWicket, wicketType = 'none', fielderId, isByeForNoBall, whoIsOut) => {
                set((store) => {
                    const nextState = processBall(store.state, store.config, runs, extraType, isWicket, wicketType, fielderId, isByeForNoBall, whoIsOut);

                    // If match just finished, save to history
                    if (nextState.matchResult && !store.state.matchResult) {
                        const completedMatch = {
                            ...nextState,
                            completedAt: new Date().toISOString()
                        };
                        return {
                            state: completedMatch,
                            history: [completedMatch, ...store.history],
                            ballHistory: [] // Clear internal history
                        };
                    }

                    return {
                        state: nextState,
                        ballHistory: [...store.ballHistory, store.state] // Push CURRENT state before update
                    };
                });
            },

            undoBall: () => {
                set((store) => {
                    if (store.ballHistory.length === 0) return store;
                    const prevStates = [...store.ballHistory];
                    const lastState = prevStates.pop();
                    return {
                        state: lastState!,
                        ballHistory: prevStates
                    };
                });
            },

            swapBatsmen: () => {
                set((store) => {
                    const currentInningsKey = store.state.currentInnings === 1 ? 'innings1' : 'innings2';
                    const innings = store.state[currentInningsKey];
                    return {
                        state: {
                            ...store.state,
                            [currentInningsKey]: {
                                ...innings,
                                strikerId: innings.nonStrikerId,
                                nonStrikerId: innings.strikerId
                            }
                        }
                    };
                });
            },

            retirePlayer: (playerId: string) => {
                set((store) => {
                    const currentInningsKey = store.state.currentInnings === 1 ? 'innings1' : 'innings2';
                    const innings = store.state[currentInningsKey];

                    // Mark player as retired hurt
                    const currentStats = { ...(innings.battingStats[playerId] || { playerId, runs: 0, ballsFaced: 0, fours: 0, sixes: 0, isOut: false }) };
                    currentStats.isRetired = true;
                    currentStats.isOut = false;
                    currentStats.dismissal = 'retired-hurt';

                    // Find next player
                    const roster = innings.battingTeam === store.state.teamA ? store.state.teamAPlayers : store.state.teamBPlayers;
                    const nextBatter = roster.find(p => {
                        const stats = innings.battingStats[p.id];
                        const isPlaying = p.id === innings.strikerId || p.id === innings.nonStrikerId;
                        return !isPlaying && (!stats || (!stats.isOut && !stats.isRetired));
                    });

                    if (!nextBatter) return store; // No more players

                    const isStriker = innings.strikerId === playerId;
                    return {
                        state: {
                            ...store.state,
                            [currentInningsKey]: {
                                ...innings,
                                strikerId: isStriker ? "" : innings.strikerId,
                                nonStrikerId: !isStriker ? "" : innings.nonStrikerId,
                                battingStats: {
                                    ...innings.battingStats,
                                    [playerId]: currentStats
                                }
                            }
                        }
                    };
                });
            },

            startSecondInnings: () => {
                set((store) => {
                    const config = store.config;
                    const battingSecondPlayers = store.state.innings2.battingTeamKey === 'teamA' ? store.state.teamAPlayers : store.state.teamBPlayers;
                    const bowlingSecondPlayers = store.state.innings2.battingTeamKey === 'teamA' ? store.state.teamBPlayers : store.state.teamAPlayers;

                    const isDefaultNames = !config.isCustomNamesEnabled;

                    return {
                        state: {
                            ...store.state,
                            currentInnings: 2 as 1 | 2,
                            isInningsBreak: false,
                            innings2: {
                                ...store.state.innings2,
                                strikerId: isDefaultNames ? battingSecondPlayers[0]?.id || "" : "",
                                nonStrikerId: isDefaultNames ? battingSecondPlayers[1]?.id || "" : "",
                                currentBowlerId: isDefaultNames ? bowlingSecondPlayers[bowlingSecondPlayers.length - 1]?.id || null : null,
                            }
                        }
                    };
                });
            },

            resetMatch: () => set((store) => ({
                state: {
                    ...INITIAL_CONFIG,
                    isPlaying: false,
                    matchResult: null,
                    currentInnings: 1,
                    isInningsBreak: false,
                    teamAPlayers: [],
                    teamBPlayers: [],
                    innings1: INITIAL_INNINGS,
                    innings2: INITIAL_INNINGS,
                    ...store.config
                }
            })),
            restoreMatches: (backupData: string) => {
                try {
                    const parsedData = JSON.parse(backupData);
                    if (parsedData.state) {
                        set({
                            config: parsedData.state.config || get().config,
                            state: parsedData.state.state || get().state,
                            history: parsedData.state.history || get().history,
                        });
                    }
                } catch (error) {
                    console.error('Failed to restore matches:', error);
                    throw error;
                }
            },

            renamePlayer: (playerId: string, newName: string) => {
                set((store) => {
                    const { teamAPlayers, teamBPlayers } = store.state;

                    // 1. Update Current Match State
                    const updateRoster = (roster: Player[]) =>
                        roster.map(p => p.id === playerId ? { ...p, name: newName } : p);

                    const nextState = {
                        ...store.state,
                        teamAPlayers: updateRoster(teamAPlayers),
                        teamBPlayers: updateRoster(teamBPlayers)
                    };

                    // 2. Persist to Global Config
                    const nextConfig = { ...store.config };
                    let teamNameKey = '';
                    let updatedNames: string[] = [];

                    // Parse ID (A1...A11 or B1...B11)
                    if (playerId.startsWith('A')) {
                        const index = parseInt(playerId.substring(1)) - 1;
                        if (!isNaN(index)) {
                            // Ensure array exists and has values
                            if (!nextConfig.teamAPlayerNames) {
                                nextConfig.teamAPlayerNames = Array.from({ length: nextConfig.playersPerTeam }, (_, i) => `${nextConfig.teamA} Player ${i + 1}`);
                            }
                            // Fill any gaps if array is shorter than index
                            while (nextConfig.teamAPlayerNames.length <= index) {
                                nextConfig.teamAPlayerNames.push(`${nextConfig.teamA} Player ${nextConfig.teamAPlayerNames.length + 1}`);
                            }
                            nextConfig.teamAPlayerNames[index] = newName;
                            nextConfig.isCustomNamesEnabled = true;

                            teamNameKey = nextConfig.teamA;
                            updatedNames = nextConfig.teamAPlayerNames;
                        }
                    } else if (playerId.startsWith('B')) {
                        const index = parseInt(playerId.substring(1)) - 1;
                        if (!isNaN(index)) {
                            if (!nextConfig.teamBPlayerNames) {
                                nextConfig.teamBPlayerNames = Array.from({ length: nextConfig.playersPerTeam }, (_, i) => `${nextConfig.teamB} Player ${i + 1}`);
                            }
                            while (nextConfig.teamBPlayerNames.length <= index) {
                                nextConfig.teamBPlayerNames.push(`${nextConfig.teamB} Player ${nextConfig.teamBPlayerNames.length + 1}`);
                            }
                            nextConfig.teamBPlayerNames[index] = newName;
                            nextConfig.isCustomNamesEnabled = true;

                            teamNameKey = nextConfig.teamB;
                            updatedNames = nextConfig.teamBPlayerNames;
                        }
                    }

                    // Update Saved Teams
                    if (teamNameKey && updatedNames.length > 0) {
                        if (!nextConfig.savedTeams) nextConfig.savedTeams = {};
                        nextConfig.savedTeams[teamNameKey] = updatedNames;
                    }

                    return {
                        config: nextConfig,
                        state: nextState
                    };
                });
            },
        }),
        {
            name: 'match-storage',
            storage: createJSONStorage(() => AsyncStorage),
            partialize: (state) => {
                const { tossWinner, tossDecision, ...restConfig } = state.config;
                return {
                    config: restConfig as MatchConfig,
                    state: state.state,
                    history: state.history,
                    ballHistory: state.ballHistory
                };
            },
        }
    )
);
