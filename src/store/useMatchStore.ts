import { create } from 'zustand';
import { MatchConfig, MatchState, InningsState, ExtraType } from '../types/match';

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
        matchResult: null,
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
                matchResult: null,
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
                    const runs1 = nextState.innings1.totalRuns;
                    const runs2 = nextState.innings2.totalRuns;
                    let result: any = { winner: 'Draw', reason: 'Scores are tied' };

                    if (runs1 > runs2) {
                        result = {
                            winner: config.teamA,
                            reason: `Won by ${runs1 - runs2} runs`
                        };
                    } else if (runs2 > runs1) {
                        const wicketsLeft = config.playersPerTeam - 1 - nextState.innings2.totalWickets;
                        result = {
                            winner: config.teamB,
                            reason: `Won by ${wicketsLeft} wickets`
                        };
                    }

                    nextState = {
                        ...nextState,
                        isPlaying: false,
                        matchResult: result
                    };
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
            matchResult: null,
            currentInnings: 1,
            innings1: INITIAL_INNINGS,
            innings2: INITIAL_INNINGS,
            ...store.config // keep current config
        }
    })),
}));
