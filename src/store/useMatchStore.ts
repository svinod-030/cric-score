import { create } from 'zustand';
import { MatchConfig } from '../types/match';

type ExtraType = 'none' | 'wide' | 'no-ball' | 'leg-bye' | 'bye';

interface Ball {
    runs: number;
    extraType: ExtraType;
    isWicket: boolean;
    isValidBall: boolean; // True if it counts towards the over
}

interface Over {
    balls: Ball[];
    bowlerName: string; // Placeholder for now
}

interface InningsState {
    battingTeam: string;
    totalRuns: number;
    totalWickets: number;
    overs: Over[];
    currentOver: Ball[];
    strikerId: string; // Player ID
    nonStrikerId: string; // Player ID
    // Add other innings-specific state like partnerships, fall of wickets, etc.
}

interface MatchState extends MatchConfig {
    isPlaying: boolean;
    currentInnings: 1 | 2;
    innings1: InningsState;
    innings2: InningsState;
    // Add other match-specific state like target, result, etc.
}

interface MatchStore {
    config: MatchConfig;
    state: MatchState;
    setConfig: (config: Partial<MatchConfig>) => void;
    startMatch: () => void;
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
    strikerId: "p1",
    nonStrikerId: "p2",
};

export const useMatchStore = create<MatchStore>((set, get) => ({
    config: INITIAL_CONFIG,
    state: {
        ...INITIAL_CONFIG,
        isPlaying: false,
        currentInnings: 1,
        innings1: INITIAL_INNINGS,
        innings2: INITIAL_INNINGS,
    },
    setConfig: (updates) =>
        set((store) => ({ config: { ...store.config, ...updates } })),

    startMatch: () => {
        const { config } = get();
        // Initialize state based on config
        set({
            state: {
                ...config,
                isPlaying: true,
                currentInnings: 1,
                innings1: { ...INITIAL_INNINGS, battingTeam: config.teamA },
                innings2: { ...INITIAL_INNINGS, battingTeam: config.teamB },
            }
        });
    },

    recordBall: (runs, extraType, isWicket) => {
        set((store) => {
            const { state, config } = store;
            const currentInningsKey = state.currentInnings === 1 ? 'innings1' : 'innings2';
            const innings = state[currentInningsKey];

            let runsToAdd = runs;
            let isValidBall = true;

            // Calculate extras
            if (extraType === 'wide') {
                runsToAdd += config.runsForWide;
                if (config.reballForWide) isValidBall = false;
            } else if (extraType === 'no-ball') {
                runsToAdd += config.runsForNoBall;
                if (config.reballForNoBall) isValidBall = false;
            }

            // Update totals
            const newTotalRuns = innings.totalRuns + runsToAdd;
            const newTotalWickets = isWicket ? innings.totalWickets + 1 : innings.totalWickets;

            const newBall = { runs: runsToAdd, extraType, isWicket, isValidBall };
            const newCurrentOver = [...innings.currentOver, newBall];

            // Check if over is complete
            // Count valid balls in the current over
            const validBallsCount = newCurrentOver.filter(b => b.isValidBall).length;

            let finalCurrentOver = newCurrentOver;
            let finalOvers = innings.overs;

            if (validBallsCount >= 6) {
                // Over complete
                finalOvers = [...finalOvers, { balls: newCurrentOver, bowlerName: "Bowler" }];
                finalCurrentOver = [];
            }

            const isAllOut = newTotalWickets >= config.playersPerTeam - 1;
            const isMaxOvers = finalOvers.length >= config.overs;

            let nextState = {
                ...state,
                [currentInningsKey]: {
                    ...innings,
                    totalRuns: newTotalRuns,
                    totalWickets: newTotalWickets,
                    currentOver: finalCurrentOver,
                    overs: finalOvers,
                },
            };

            if (isAllOut || isMaxOvers) {
                if (state.currentInnings === 1) {
                    // Start 2nd Innings
                    nextState = {
                        ...nextState,
                        currentInnings: 2,
                        innings2: {
                            ...INITIAL_INNINGS,
                            battingTeam: config.teamB,
                        }
                    };
                } else {
                    // Match Ends
                    nextState = {
                        ...nextState,
                        isPlaying: false,
                    };
                    // Ideally navigate to a Summary screen or show alert (can be handled in UI via isPlaying check)
                }
            }

            return {
                state: nextState,
            };
        });
    },

    resetMatch: () => set((store) => ({
        state: {
            ...INITIAL_CONFIG, // Just reset state, keep config or reset? Let's reset purely state logic mostly
            isPlaying: false,
            currentInnings: 1,
            innings1: INITIAL_INNINGS,
            innings2: INITIAL_INNINGS,
            ...store.config // keep current config
        }
    })),
}));
