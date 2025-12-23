import { create } from 'zustand';
import { MatchConfig, MatchState, InningsState, ExtraType } from '../types/match';
import { processBall } from '../utils/scoringUtils';

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
            innings1: INITIAL_INNINGS,
            innings2: INITIAL_INNINGS,
            ...store.config // keep current config
        }
    })),
}));
