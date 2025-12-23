import { MatchConfig, MatchState, InningsState, ExtraType, MatchResult } from '../types/match';

const INITIAL_INNINGS: InningsState = {
    battingTeam: "",
    totalRuns: 0,
    totalWickets: 0,
    overs: [],
    currentOver: [],
    strikerId: "p1",
    nonStrikerId: "p2",
};

export const calculateMatchResult = (
    state: MatchState,
    config: MatchConfig
): MatchResult => {
    const runs1 = state.innings1.totalRuns;
    const runs2 = state.innings2.totalRuns;

    if (runs1 > runs2) {
        return {
            winner: config.teamA,
            reason: `Won by ${runs1 - runs2} runs`,
        };
    } else if (runs2 > runs1) {
        const wicketsLeft =
            config.playersPerTeam - 1 - state.innings2.totalWickets;
        return {
            winner: config.teamB,
            reason: `Won by ${wicketsLeft} wickets`,
        };
    } else {
        return { winner: 'Draw', reason: 'Scores are tied' };
    }
};

export const processBall = (
    state: MatchState,
    config: MatchConfig,
    runs: number,
    extraType: ExtraType,
    isWicket: boolean
): MatchState => {
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
    const validBallsCount = newCurrentOver.filter(b => b.isValidBall).length;

    let finalCurrentOver = newCurrentOver;
    let finalOvers = innings.overs;

    if (validBallsCount >= 6) {
        finalOvers = [...finalOvers, { balls: newCurrentOver, bowlerName: "Bowler" }];
        finalCurrentOver = [];
    }

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

    const isAllOut = newTotalWickets >= config.playersPerTeam - 1;
    const isMaxOvers = finalOvers.length >= config.overs;
    const isTargetReached = state.currentInnings === 2 && newTotalRuns > state.innings1.totalRuns;

    if (state.currentInnings === 1) {
        if (isAllOut || isMaxOvers) {
            // Start 2nd Innings
            return {
                ...nextState,
                currentInnings: 2,
                innings2: {
                    ...INITIAL_INNINGS,
                    battingTeam: config.teamB,
                }
            };
        }
    } else {
        if (isAllOut || isMaxOvers || isTargetReached) {
            // Match Ends
            const result = calculateMatchResult(nextState, config);
            return {
                ...nextState,
                isPlaying: false,
                matchResult: result
            };
        }
    }

    return nextState;
};
