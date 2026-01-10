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
    recordBall: (runs: number, extraType: ExtraType, isWicket: boolean, wicketType?: WicketType, fielderId?: string, isByeForNoBall?: boolean) => void;
    startSecondInnings: () => void;
    undoBall: () => void;
    swapBatsmen: () => void;
    retirePlayer: (playerId: string) => void;
    resetMatch: () => void;
    restoreMatches: (backupData: string) => void;
    renamePlayer: (playerId: string, newName: string) => void;
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

            recordBall: (runs, extraType, isWicket, wicketType = 'none', fielderId, isByeForNoBall) => {
                set((store) => {
                    const nextState = processBall(store.state, store.config, runs, extraType, isWicket, wicketType, fielderId, isByeForNoBall);

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
                    const strikerStats = { ...(innings.battingStats[playerId] || { playerId, runs: 0, ballsFaced: 0, fours: 0, sixes: 0, isOut: false }) };
                    strikerStats.isRetired = true;

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
                                    [playerId]: strikerStats
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

                    return {
                        state: {
                            ...store.state,
                            currentInnings: 2 as 1 | 2,
                            isInningsBreak: false,
                            innings2: {
                                ...store.state.innings2,
                                strikerId: "",
                                nonStrikerId: "",
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

                    const updateRoster = (roster: Player[]) =>
                        roster.map(p => p.id === playerId ? { ...p, name: newName } : p);

                    return {
                        state: {
                            ...store.state,
                            teamAPlayers: updateRoster(teamAPlayers),
                            teamBPlayers: updateRoster(teamBPlayers)
                        }
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
