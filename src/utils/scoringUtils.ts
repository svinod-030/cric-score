import { MatchConfig, MatchState, InningsState, ExtraType, MatchResult, WicketType } from '../types/match';

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
    fallOfWickets: [],
};

export const calculateMatchResult = (
    state: MatchState,
    config: MatchConfig
): MatchResult => {
    const runs1 = state.innings1.totalRuns;
    const runs2 = state.innings2.totalRuns;

    if (runs1 > runs2) {
        return {
            winner: state.innings1.battingTeam,
            reason: `Won by ${runs1 - runs2} runs`,
        };
    } else if (runs2 > runs1) {
        const wicketsLeft =
            config.playersPerTeam - 1 - state.innings2.totalWickets;
        return {
            winner: state.innings2.battingTeam,
            reason: `Won by ${wicketsLeft} wickets`,
        };
    } else {
        return { winner: 'Draw', reason: 'Scores are tied' };
    }
};

// Helper to init player stats if missing
const getBattingStats = (state: MatchState, inning: InningsState, playerId: string) => {
    return inning.battingStats[playerId] || {
        playerId,
        runs: 0,
        ballsFaced: 0,
        fours: 0,
        sixes: 0,
        isOut: false,
    };
};

const getBowlingStats = (state: MatchState, inning: InningsState, playerId: string) => {
    return inning.bowlingStats[playerId] || {
        playerId,
        overs: 0,
        balls: 0,
        maidens: 0,
        runsConceded: 0,
        wickets: 0,
    };
};

export const processBall = (
    state: MatchState,
    config: MatchConfig,
    runs: number,
    extraType: ExtraType,
    isWicket: boolean,
    wicketType: WicketType = 'none',
    fielderId?: string,
    isByeForNoBall?: boolean
): MatchState => {
    const currentInningsKey = state.currentInnings === 1 ? 'innings1' : 'innings2';
    const innings = state[currentInningsKey];

    // Ensure we have a bowler
    if (!innings.currentBowlerId) {
        // Should ideally be blocked by UI, but safe return if not
        return state;
    }

    let runsToAdd = runs;
    let isValidBall = true;
    let runsOffBat = runs;
    let isExtra = false;

    // Calculate extras
    if (extraType === 'wide') {
        runsToAdd += config.runsForWide;
        runsOffBat = 0; // Wides don't count for batsman runs usually
        isExtra = true;
        if (config.reballForWide) isValidBall = false;
    } else if (extraType === 'no-ball') {
        runsToAdd += config.runsForNoBall;
        // If it's a bye off a no ball, or just "runs", the logic differs.
        if (isByeForNoBall) {
            runsOffBat = 0; // It's byes, so no runs for batsman
        } else {
            runsOffBat = runs; // Runs scored off bat
        }
        isExtra = true;
        if (config.reballForNoBall) isValidBall = false;
    } else if (extraType === 'bye' || extraType === 'leg-bye') {
        runsOffBat = 0;
        isExtra = true;
    }

    // --- Update Stats ---
    const strikerId = innings.strikerId;
    const bowlerId = innings.currentBowlerId;

    let strikerStats = { ...getBattingStats(state, innings, strikerId) };
    let bowlerStats = { ...getBowlingStats(state, innings, bowlerId) };

    // Batting Updates
    if (isValidBall) {
        // Only valid balls count as balls faced
        // Wides and No Balls do NOT count as balls faced
        strikerStats.ballsFaced += 1;
    }

    strikerStats.runs += runsOffBat;
    if (runsOffBat === 4) strikerStats.fours += 1;
    if (runsOffBat === 6) strikerStats.sixes += 1;

    if (isWicket) {
        strikerStats.isOut = true;
        strikerStats.dismissal = wicketType;
        strikerStats.fielderId = fielderId;
        strikerStats.bowlerId = innings.currentBowlerId!;
    }

    // Bowling Updates
    if (isValidBall) {
        bowlerStats.balls += 1;
        if (bowlerStats.balls % 6 === 0) {
            bowlerStats.overs += 1;
            // Check Maiden? (Need to track runs in this over, too complex for simplified logic right now)
        }
    }
    // Runs conceded by bowler:
    // Wides/NB count to bowler. Byes/Legbyes do NOT count to bowler runs, but to team extras.
    let bowlerRuns = 0;
    if (extraType === 'wide' || extraType === 'no-ball') {
        bowlerRuns += runsToAdd; // Includes penalty + runs ran
    } else if (extraType === 'bye' || extraType === 'leg-bye') {
        // Byes/Legbyes don't count against bowler
        bowlerRuns = 0;
    } else {
        bowlerRuns = runsToAdd; // Regular runs
    }
    bowlerStats.runsConceded += bowlerRuns;

    if (isWicket && !['run-out', 'retired-hurt'].includes(wicketType)) {
        bowlerStats.wickets += 1;
    }

    // --- Update Innings Totals ---
    const newTotalRuns = innings.totalRuns + runsToAdd;
    const newTotalWickets = isWicket ? innings.totalWickets + 1 : innings.totalWickets;

    const newBall = {
        runs: runsToAdd,
        extraType,
        isWicket,
        wicketType,
        isValidBall,
        batsmanId: strikerId,
        bowlerId: bowlerId,
        fielderId: fielderId
    };
    const newCurrentOver = [...innings.currentOver, newBall];

    // --- Strike Rotation ---
    let newStrikerId = strikerId;
    let newNonStrikerId = innings.nonStrikerId;

    // Swap based on RUNS RAN (or runs scored excluding fixed extras), not total runs added to score
    // Typical logic: 1, 3, 5 runs = Swap. 4, 6 = No Swap.
    // runs input:
    // - On Wide: input is runs RAN (e.g. 1). Swap if 1.
    // - On No Ball: input is runs RAN or Boundary (e.g. 1 or 4). Swap if 1.
    // - On Normal: input is runs (1 or 4). Swap if 1.
    // So checking runs % 2 !== 0 covers all these standard cases.
    if (runs % 2 !== 0) {
        // Swap
        [newStrikerId, newNonStrikerId] = [newNonStrikerId, newStrikerId];
    }

    // Handle Wicket Fall - Reset striker to empty string for manual selection
    if (isWicket) {
        newStrikerId = "";
    }


    // --- Over Completion ---
    const validBallsCount = newCurrentOver.filter(b => b.isValidBall).length;
    let finalCurrentOver = newCurrentOver;
    let finalOvers = innings.overs;
    let finalBowlerId = bowlerId;

    if (validBallsCount >= 6) {
        finalOvers = [...finalOvers, { balls: newCurrentOver, bowlerId }];
        finalCurrentOver = [];

        // Swap Ends at end of over
        [newStrikerId, newNonStrikerId] = [newNonStrikerId, newStrikerId];

        // Clear bowler to force selection
        finalBowlerId = null as any;
    }

    let nextState = {
        ...state,
        [currentInningsKey]: {
            ...innings,
            totalRuns: newTotalRuns,
            totalWickets: newTotalWickets,
            currentOver: finalCurrentOver,
            overs: finalOvers,
            strikerId: newStrikerId,
            nonStrikerId: newNonStrikerId,
            currentBowlerId: finalBowlerId,
            battingStats: {
                ...innings.battingStats,
                [strikerId]: strikerStats, // Save stats for the guy who faced the ball
                // Ensure the OTHER guy is also in stats? initialized at start
            },
            bowlingStats: {
                ...innings.bowlingStats,
                [bowlerId]: bowlerStats,
            }
        },
    };

    const isAllOut = newTotalWickets >= config.playersPerTeam - 1;
    const isMaxOvers = finalOvers.length >= config.overs;
    const isTargetReached = state.currentInnings === 2 && newTotalRuns > state.innings1.totalRuns;

    if (state.currentInnings === 1) {
        if (isAllOut || isMaxOvers) {
            return {
                ...nextState,
                isInningsBreak: true
            };
        }
    }
    else {
        if (isAllOut || isMaxOvers || isTargetReached) {
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
