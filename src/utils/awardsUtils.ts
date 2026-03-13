import { MatchState, Player } from '../types/match';

export interface Award {
    type: 'potm' | 'bestBatsman' | 'bestBowler' | 'bestFielder';
    playerId: string;
    playerName: string;
    stats: string;
}

export const calculateAwards = (state: MatchState): Award[] => {
    const { innings1, innings2, teamAPlayers, teamBPlayers } = state;
    const allPlayers = [...teamAPlayers, ...teamBPlayers];
    const playerMap: Record<string, string> = {};
    allPlayers.forEach(p => playerMap[p.id] = p.name);

    const playerScores: Record<string, { runs: number, wickets: number, dismissals: number, points: number, ballsFaced: number, runsConceded: number }> = {};

    const processInnings = (innings: typeof innings1) => {
        // Batting Stats
        Object.values(innings.battingStats).forEach(stats => {
            if (!playerScores[stats.playerId]) {
                playerScores[stats.playerId] = { runs: 0, wickets: 0, dismissals: 0, points: 0, ballsFaced: 0, runsConceded: 0 };
            }
            playerScores[stats.playerId].runs += stats.runs;
            playerScores[stats.playerId].ballsFaced += stats.ballsFaced;
            playerScores[stats.playerId].points += stats.runs; // 1 point per run
        });

        // Bowling Stats
        Object.values(innings.bowlingStats).forEach(stats => {
            if (!playerScores[stats.playerId]) {
                playerScores[stats.playerId] = { runs: 0, wickets: 0, dismissals: 0, points: 0, ballsFaced: 0, runsConceded: 0 };
            }
            playerScores[stats.playerId].wickets += stats.wickets;
            playerScores[stats.playerId].runsConceded += stats.runsConceded;
            playerScores[stats.playerId].points += (stats.wickets * 25); // 25 points per wicket
        });

        // Fielding dismissals (catches, stumpings, run-outs)
        // We look through all balls to find fielder assignments
        [...innings.overs.flatMap(o => o.balls), ...innings.currentOver].forEach(ball => {
            if (ball.fielderId) {
                if (!playerScores[ball.fielderId]) {
                    playerScores[ball.fielderId] = { runs: 0, wickets: 0, dismissals: 0, points: 0, ballsFaced: 0, runsConceded: 0 };
                }
                playerScores[ball.fielderId].dismissals += 1;
                playerScores[ball.fielderId].points += 10; // 10 points per fielding dismissal
            }
        });
    };

    processInnings(innings1);
    processInnings(innings2);

    const awards: Award[] = [];
    const playerIds = Object.keys(playerScores);

    if (playerIds.length === 0) return [];

    // 1. Best Batsman
    const bestBatsmanId = [...playerIds].sort((a, b) => {
        const scoreA = playerScores[a];
        const scoreB = playerScores[b];
        if (scoreB.runs !== scoreA.runs) return scoreB.runs - scoreA.runs;
        return scoreA.ballsFaced - scoreB.ballsFaced; // Tie-break: strike rate/balls faced
    })[0];

    if (playerScores[bestBatsmanId].runs > 0) {
        awards.push({
            type: 'bestBatsman',
            playerId: bestBatsmanId,
            playerName: playerMap[bestBatsmanId] || "Unknown",
            stats: `${playerScores[bestBatsmanId].runs} Runs (${playerScores[bestBatsmanId].ballsFaced} Balls)`
        });
    }

    // 2. Best Bowler
    const bestBowlerId = [...playerIds].sort((a, b) => {
        const scoreA = playerScores[a];
        const scoreB = playerScores[b];
        if (scoreB.wickets !== scoreA.wickets) return scoreB.wickets - scoreA.wickets;
        return scoreA.runsConceded - scoreB.runsConceded; // Tie-break: economy/runs conceded
    })[0];

    if (playerScores[bestBowlerId].wickets > 0) {
        awards.push({
            type: 'bestBowler',
            playerId: bestBowlerId,
            playerName: playerMap[bestBowlerId] || "Unknown",
            stats: `${playerScores[bestBowlerId].wickets} Wickets`
        });
    }

    // 3. Best Fielder
    const bestFielderId = [...playerIds].sort((a, b) => {
        return playerScores[b].dismissals - playerScores[a].dismissals;
    })[0];

    if (playerScores[bestFielderId].dismissals > 0) {
        awards.push({
            type: 'bestFielder',
            playerId: bestFielderId,
            playerName: playerMap[bestFielderId] || "Unknown",
            stats: `${playerScores[bestFielderId].dismissals} Dismissals`
        });
    }

    // 4. Player of the Match
    const potmId = [...playerIds].sort((a, b) => {
        return playerScores[b].points - playerScores[a].points;
    })[0];

    if (playerScores[potmId].points > 0) {
        awards.unshift({
            type: 'potm',
            playerId: potmId,
            playerName: playerMap[potmId] || "Unknown",
            stats: `${playerScores[potmId].runs} Runs, ${playerScores[potmId].wickets} Wkts`
        });
    }

    return awards;
};
