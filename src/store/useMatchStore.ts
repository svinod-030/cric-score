import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MatchConfig, MatchState, InningsState, ExtraType } from '../types/match';
import { processBall } from '../utils/scoringUtils';

interface MatchStore {
    config: MatchConfig;
    state: MatchState;
    setConfig: (config: Partial<MatchConfig>) => void;
    startMatch: () => void;
    setBowler: (playerId: string) => void;
    recordBall: (runs: number, extraType: ExtraType, isWicket: boolean) => void;
    resetMatch: () => void;
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
                teamAPlayers: [],
                teamBPlayers: [],
                innings1: INITIAL_INNINGS,
                innings2: INITIAL_INNINGS,
            },
            setConfig: (updates) =>
                set((store) => ({ config: { ...store.config, ...updates } })),

            startMatch: () => {
                const { config } = get();
                // Generate Rosters
                const teamAPlayers = Array.from({ length: config.playersPerTeam }, (_, i) => ({
                    id: `A${i + 1}`,
                    name: `${config.teamA} Player ${i + 1}`,
                }));
                const teamBPlayers = Array.from({ length: config.playersPerTeam }, (_, i) => ({
                    id: `B${i + 1}`,
                    name: `${config.teamB} Player ${i + 1}`,
                }));

                // Determine Batting First Team based on Toss
                let battingFirstTeam = config.teamA; // Default

                // If Toss info exists, use logic
                if (config.tossWinner && config.tossDecision) {
                    if (config.tossDecision === 'bat') {
                        battingFirstTeam = config.tossWinner;
                    } else {
                        // If winner chose bowl, the OTHER team bats first
                        battingFirstTeam = config.tossWinner === config.teamA ? config.teamB : config.teamA;
                    }
                }

                const battingSecondTeam = battingFirstTeam === config.teamA ? config.teamB : config.teamA;

                // Correctly assign players to innings based on who is batting
                const firstInningsBattingPlayers = battingFirstTeam === config.teamA ? teamAPlayers : teamBPlayers;
                const secondInningsBattingPlayers = battingSecondTeam === config.teamA ? teamAPlayers : teamBPlayers;

                set({
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
                            strikerId: firstInningsBattingPlayers[0].id,
                            nonStrikerId: firstInningsBattingPlayers[1].id,
                        },
                        innings2: {
                            ...INITIAL_INNINGS,
                            battingTeam: battingSecondTeam
                        },
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

            recordBall: (runs, extraType, isWicket) => {
                set((store) => {
                    const nextState = processBall(store.state, store.config, runs, extraType, isWicket);
                    return { state: nextState };
                });
            },

            resetMatch: () => set((store) => ({
                state: {
                    ...INITIAL_CONFIG, // Just reset state, keep config or reset? Let's reset purely state logic mostly
                    isPlaying: false,
                    matchResult: null,
                    currentInnings: 1,
                    teamAPlayers: [],
                    teamBPlayers: [],
                    innings1: INITIAL_INNINGS,
                    innings2: INITIAL_INNINGS,
                    ...store.config // keep current config
                }
            })),
        }),
        {
            name: 'match-storage',
            storage: createJSONStorage(() => AsyncStorage),
            partialize: (state) => {
                const { tossWinner, tossDecision, ...restConfig } = state.config;
                return {
                    config: restConfig as MatchConfig,
                    state: state.state
                };
            },
        }
    )
);
