import { MatchConfig, MatchState, InningsState, ExtraType, MatchResult } from '../types/match';

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
    isWicket: boolean
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
        runsOffBat = runs; // Runs scored off no-ball count for batsman? Usually runs off bat do, the no-ball extra penalty doesn't. 
        // For simplicity: Run input implies runs off bat + extra runs logic handling here.
        // Standard rule: 1 run for NB + whatever runs hit. "runs" arg here is the button pressed.
        // If button is "4" on NoBall, it's 1 NB + 4 runs.
        // If button is "NB", it's 0 runs + 1 NB.
        // Let's assume input runs is purely what's run/hit, unrelated to the extra PENALTY.
        // actually NoBall button adds penalty. If user presses "Run" button after no-ball, it's complex.
        // SIMPLIFICATION: Extra buttons add 0 runs + penalty. "Runs" buttons add runs only. 
        // If "No Ball" button is pressed, it adds 1 runs. 
        // If we want "4 off a No ball", we need better UI. For now, assume "No Ball" button = 1 run total. 
        // OR better: recordBall(runs, extraType). 
        // If extraType is NB, we add runs + NB penalty.
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
    if (isValidBall || extraType === 'no-ball') {
        // No balls count as balls faced? Actually, usually NO. 
        // Wides don't count as balls faced.
        if (extraType !== 'wide') {
            strikerStats.ballsFaced += 1;
        }
    }

    strikerStats.runs += runsOffBat;
    if (runsOffBat === 4) strikerStats.fours += 1;
    if (runsOffBat === 6) strikerStats.sixes += 1;

    if (isWicket) {
        strikerStats.isOut = true;
        strikerStats.dismissal = "Bowled/Caught"; // Simplified
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

    if (isWicket && !['run-out'].includes('')) { // Simplify: all wickets credit to bowler for now
        bowlerStats.wickets += 1;
    }

    // --- Update Innings Totals ---
    const newTotalRuns = innings.totalRuns + runsToAdd;
    const newTotalWickets = isWicket ? innings.totalWickets + 1 : innings.totalWickets;

    const newBall = {
        runs: runsToAdd,
        extraType,
        isWicket,
        isValidBall,
        batsmanId: strikerId,
        bowlerId: bowlerId
    };
    const newCurrentOver = [...innings.currentOver, newBall];

    // --- Strike Rotation ---
    let newStrikerId = strikerId;
    let newNonStrikerId = innings.nonStrikerId;

    if (runsToAdd % 2 !== 0) {
        // Swap
        [newStrikerId, newNonStrikerId] = [newNonStrikerId, newStrikerId];
    }

    // Handle Wicket Fall - Pick Next Batsman
    if (isWicket) {
        // Current striker is OUT.
        // Need to find next player in roster who is NOT out and NOT non-striker
        const roster = state.currentInnings === 1 ? state.teamAPlayers : state.teamBPlayers;
        // Check who is already batting/out
        const activeIds = [strikerId, newNonStrikerId]; // Old striker is out, so we need to replace 'strikerId' position
        // Actually, if crossed, the NEW striker position might be the one out? 
        // Standard rule: New batsman takes strike usually, unless Crossed? 
        // Simplified: New batsman takes place of dismissed batsman.

        const nextPlayer = roster.find(p =>
            p.id !== strikerId &&
            p.id !== newNonStrikerId &&
            !innings.battingStats[p.id]?.isOut &&
            !innings.battingStats[p.id]?.runs // Simplified: find someone with NO stats yet? Or just track who played
            // Better: Check if existing stats say isOut. 
            // Also need to check if they are the current non-striker.
        );

        // Wait, 'roster' contains simple Player objects without 'isOut' state usually, 
        // unless we are looking at 'InningsState.battingStats'. 
        // For MVP, lets iterate roster and check `innings.battingStats`.

        const nextBatter = roster.find(p => {
            const stats = innings.battingStats[p.id];
            const isPlaying = p.id === strikerId || p.id === newNonStrikerId;
            return !isPlaying && (!stats || !stats.isOut);
        });

        if (nextBatter) {
            // Who was out? The 'strikerId' (before swap? or after?). 
            // Usually the one facing is out.
            // If they ran 1 run and got runout, valid ball?
            // Let's assume Caught/Bowled => Striker Out.
            // Place new batter at Striker end (if not crossed)
            // Simplified: New batter replaces StrikerId.
            // If they ran odd runs, we already swapped names. 
            // So we overwrite the `newStrikerId` (which points to the guy who is now at striker end).
            // Actually, if Wicket, runs usually don't count for swap unless Run Out. 
            // Assume NO RUNS on wicket for MVP.
            newStrikerId = nextBatter.id;
        } else {
            // No more batters - All Out logic handled by checks below
        }
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
                currentInnings: 2,
                innings2: {
                    ...INITIAL_INNINGS,
                    battingTeam: config.teamB,
                    // Need to init first 2 batters for Innings 2?
                    // We'll handle that in startMatch or here? 
                    // Better to rely on UI or logic to init players.
                    // For now, let's copy the roster init logic from start match if needed 
                    // or just rely on defaults (p1, p2 placeholders are bad now).
                    // Logic will fail if p1/p2 not in roster. 
                    // We will fix INITIAL_INNINGS in useMatchStore for real Ids.
                    strikerId: state.teamBPlayers[0].id,
                    nonStrikerId: state.teamBPlayers[1].id,
                }
            };
        }
    } else {
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
