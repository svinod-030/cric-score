import { MatchConfig, MatchState, InningsState, ExtraType, MatchResult, WicketType } from '../types/match';

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
    isByeForNoBall?: boolean,
    whoIsOut?: 'striker' | 'non-striker'
): MatchState => {
    const currentInningsKey = state.currentInnings === 1 ? 'innings1' : 'innings2';
    const innings = state[currentInningsKey];

    // Ensure we have a bowler
    if (!innings.currentBowlerId) {
        return state;
    }

    let runsToAdd = runs;
    let isValidBall = true;
    let runsOffBat = runs;
    let isExtra = false;

    if (extraType === 'wide') {
        runsToAdd += config.runsForWide;
        runsOffBat = 0;
        isExtra = true;
        if (config.reballForWide) isValidBall = false;
    } else if (extraType === 'no-ball') {
        runsToAdd += config.runsForNoBall;
        if (isByeForNoBall) {
            runsOffBat = 0;
        } else {
            runsOffBat = runs;
        }
        isExtra = true;
        if (config.reballForNoBall) isValidBall = false;
    } else if (extraType === 'bye' || extraType === 'leg-bye') {
        runsOffBat = 0;
        isExtra = true;
    }

    // --- Update Stats ---
    const strikerId = innings.strikerId;
    const nonStrikerId = innings.nonStrikerId;
    const bowlerId = innings.currentBowlerId;

    let strikerStats = { ...getBattingStats(state, innings, strikerId) };
    let nonStrikerStats = { ...getBattingStats(state, innings, nonStrikerId) };
    let bowlerStats = { ...getBowlingStats(state, innings, bowlerId) };

    if (isValidBall) {
        strikerStats.ballsFaced += 1;
    }

    strikerStats.runs += runsOffBat;
    if (runsOffBat === 4) strikerStats.fours += 1;
    if (runsOffBat === 6) strikerStats.sixes += 1;

    let dismissedPlayerId: string | undefined;

    if (isWicket) {
        const isNonStrikerOut = whoIsOut === 'non-striker';
        dismissedPlayerId = isNonStrikerOut ? nonStrikerId : strikerId;

        const statsToUpdate = isNonStrikerOut ? nonStrikerStats : strikerStats;
        statsToUpdate.isOut = true;
        statsToUpdate.dismissal = wicketType;
        statsToUpdate.fielderId = fielderId;
        statsToUpdate.bowlerId = innings.currentBowlerId!;
    }

    // Bowling Updates
    if (isValidBall) {
        bowlerStats.balls += 1;
        if (bowlerStats.balls % 6 === 0) {
            bowlerStats.overs += 1;
        }
    }

    let bowlerRuns = 0;
    if (extraType === 'wide' || extraType === 'no-ball') {
        bowlerRuns += runsToAdd;
    } else if (extraType === 'bye' || extraType === 'leg-bye') {
        bowlerRuns = 0;
    } else {
        bowlerRuns = runsToAdd;
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
    let newNonStrikerId = nonStrikerId;

    // Standard Swap on odd runs
    if (runs % 2 !== 0) {
        [newStrikerId, newNonStrikerId] = [newNonStrikerId, newStrikerId];
    }

    // Handle Wicket Fall - Logic for replacement
    if (isWicket && dismissedPlayerId) {
        if (!config.isCustomNamesEnabled) {
            // Auto-select next batter
            const roster = innings.battingTeam === state.teamA ? state.teamAPlayers : state.teamBPlayers;
            const nextBatter = roster.find(p => {
                const pStats = innings.battingStats[p.id];
                const isPlaying = p.id === strikerId || p.id === innings.nonStrikerId;
                return !isPlaying && (!pStats || (!pStats.isOut && !pStats.isRetired));
            });

            const nextPlayerId = nextBatter ? nextBatter.id : "";

            // Replace the dismissed player
            if (newStrikerId === dismissedPlayerId) {
                newStrikerId = nextPlayerId;
            } else if (newNonStrikerId === dismissedPlayerId) {
                newNonStrikerId = nextPlayerId;
            }
        } else {
            // Manual selection
            if (newStrikerId === dismissedPlayerId) {
                newStrikerId = "";
            } else if (newNonStrikerId === dismissedPlayerId) {
                newNonStrikerId = "";
            }
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
                [strikerId]: strikerStats,
                [nonStrikerId]: nonStrikerStats,
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
