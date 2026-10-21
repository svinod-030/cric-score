import { MatchState } from '../../types/match';
import { HistoryGroup, Series, SeriesAward, SeriesTally } from './types';

const completedTime = (m: MatchState) => (m.completedAt ? new Date(m.completedAt).getTime() : 0);

// A match only counts for a series when it finished and was played between the series' two teams.
const isCountedMatch = (m: MatchState, series: Pick<Series, 'id' | 'teamA' | 'teamB'>) =>
    m.seriesId === series.id &&
    !!m.completedAt &&
    ((m.teamA === series.teamA && m.teamB === series.teamB) ||
        (m.teamA === series.teamB && m.teamB === series.teamA));

// Completed matches of a series, newest first.
export const getSeriesMatches = (history: MatchState[], series: Pick<Series, 'id' | 'teamA' | 'teamB'>): MatchState[] =>
    history.filter(m => isCountedMatch(m, series)).sort((a, b) => completedTime(b) - completedTime(a));

export const computeTally = (history: MatchState[], series: Pick<Series, 'id' | 'teamA' | 'teamB'>): SeriesTally => {
    const tally: SeriesTally = { played: 0, winsA: 0, winsB: 0, ties: 0, noResult: 0 };

    getSeriesMatches(history, series).forEach(m => {
        tally.played += 1;
        const winner = m.matchResult?.winner;
        if (!m.matchResult) tally.noResult += 1;
        else if (winner === series.teamA) tally.winsA += 1;
        else if (winner === series.teamB) tally.winsB += 1;
        else tally.ties += 1; // 'Draw' / tied
    });

    return tally;
};

// Turns history into the rows shown on the History screen. An individual match is a group of one.
// Groups are ordered by their most recent match; matches inside a group are newest first.
export const groupHistory = (history: MatchState[]): HistoryGroup[] => {
    const groups = new Map<string, HistoryGroup>();

    history.forEach((match, index) => {
        const key = match.seriesId ?? match.completedAt ?? `match-${index}`;
        const existing = groups.get(key);
        if (existing) existing.matches.push(match);
        else groups.set(key, { key, seriesId: match.seriesId, matches: [match] });
    });

    const result = Array.from(groups.values());
    result.forEach(g => g.matches.sort((a, b) => completedTime(b) - completedTime(a)));
    return result.sort((a, b) => completedTime(b.matches[0]) - completedTime(a.matches[0]));
};

type PlayerTotals = { teamName: string; runs: number; wickets: number; dismissals: number; points: number; ballsFaced: number; runsConceded: number };

const emptyTotals = (teamName: string): PlayerTotals => ({ teamName, runs: 0, wickets: 0, dismissals: 0, points: 0, ballsFaced: 0, runsConceded: 0 });

// Series awards use the same scoring as the per-match awards in awardsUtils.ts
// (1 pt per run, 25 per wicket, 10 per fielding dismissal, same tie-breaks).
// Match-local player ids (A1, B2...) are not stable across matches, so totals are keyed by player name.
export const computeSeriesAwards = (matches: MatchState[]): SeriesAward[] => {
    const totals: Record<string, PlayerTotals> = {};
    const get = (name: string, teamName: string) => (totals[name] ??= emptyTotals(teamName));

    matches.forEach(match => {
        const nameById: Record<string, string> = {};
        const teamById: Record<string, string> = {};
        match.teamAPlayers.forEach(p => { nameById[p.id] = p.name; teamById[p.id] = match.teamA; });
        match.teamBPlayers.forEach(p => { nameById[p.id] = p.name; teamById[p.id] = match.teamB; });
        const nameOf = (id: string) => nameById[id] || 'Unknown';
        const teamOf = (id: string) => teamById[id] || '';

        [match.innings1, match.innings2].forEach(innings => {
            Object.values(innings.battingStats).forEach(stats => {
                const t = get(nameOf(stats.playerId), teamOf(stats.playerId));
                t.runs += stats.runs;
                t.ballsFaced += stats.ballsFaced;
                t.points += stats.runs;
            });

            Object.values(innings.bowlingStats).forEach(stats => {
                const t = get(nameOf(stats.playerId), teamOf(stats.playerId));
                t.wickets += stats.wickets;
                t.runsConceded += stats.runsConceded;
                t.points += stats.wickets * 25;
            });

            [...innings.overs.flatMap(o => o.balls), ...innings.currentOver].forEach(ball => {
                if (ball.fielderId) {
                    const t = get(nameOf(ball.fielderId), teamOf(ball.fielderId));
                    t.dismissals += 1;
                    t.points += 10;
                }
            });
        });
    });

    const names = Object.keys(totals);
    if (names.length === 0) return [];

    const awards: SeriesAward[] = [];

    const bestBatsman = [...names].sort((a, b) => {
        if (totals[b].runs !== totals[a].runs) return totals[b].runs - totals[a].runs;
        return totals[a].ballsFaced - totals[b].ballsFaced;
    })[0];
    if (totals[bestBatsman].runs > 0) {
        awards.push({
            type: 'bestBatsman',
            playerName: bestBatsman,
            teamName: totals[bestBatsman].teamName,
            stats: `${totals[bestBatsman].runs} Runs (${totals[bestBatsman].ballsFaced} Balls)`,
        });
    }

    const bestBowler = [...names].sort((a, b) => {
        if (totals[b].wickets !== totals[a].wickets) return totals[b].wickets - totals[a].wickets;
        return totals[a].runsConceded - totals[b].runsConceded;
    })[0];
    if (totals[bestBowler].wickets > 0) {
        awards.push({
            type: 'bestBowler',
            playerName: bestBowler,
            teamName: totals[bestBowler].teamName,
            stats: `${totals[bestBowler].wickets} Wickets`,
        });
    }

    const mvp = [...names].sort((a, b) => totals[b].points - totals[a].points)[0];
    if (totals[mvp].points > 0) {
        awards.unshift({
            type: 'mvp',
            playerName: mvp,
            teamName: totals[mvp].teamName,
            stats: `${totals[mvp].runs} Runs, ${totals[mvp].wickets} Wkts`,
        });
    }

    return awards;
};

// Runs/wickets per team for a match, regardless of which innings each team batted in.
export const getMatchScores = (match: MatchState) => {
    const inningsA = [match.innings1, match.innings2].find(i => i.battingTeamKey === 'teamA');
    const inningsB = [match.innings1, match.innings2].find(i => i.battingTeamKey === 'teamB');
    return {
        teamARuns: inningsA?.totalRuns ?? 0,
        teamAWickets: inningsA?.totalWickets ?? 0,
        teamBRuns: inningsB?.totalRuns ?? 0,
        teamBWickets: inningsB?.totalWickets ?? 0,
    };
};

// Fallback for a series whose record is missing (e.g. history restored from an older backup):
// describe it from its matches. It is treated as ended.
export const deriveSeries = (seriesId: string, history: MatchState[]): Series | undefined => {
    const matches = history
        .filter(m => m.seriesId === seriesId && m.completedAt)
        .sort((a, b) => completedTime(a) - completedTime(b));
    if (matches.length === 0) return undefined;
    return {
        id: seriesId,
        teamA: matches[0].teamA,
        teamB: matches[0].teamB,
        createdAt: matches[0].completedAt!,
        endedAt: matches[matches.length - 1].completedAt,
    };
};
