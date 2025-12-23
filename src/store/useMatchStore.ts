import { create } from 'zustand';
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

export const useMatchStore = create<MatchStore>((set, get) => ({
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
                    battingTeam: config.teamA,
                    strikerId: teamAPlayers[0].id,
                    nonStrikerId: teamAPlayers[1].id,
                },
                innings2: {
                    ...INITIAL_INNINGS,
                    battingTeam: config.teamB
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
}));
