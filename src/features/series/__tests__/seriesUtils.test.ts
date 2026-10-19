import { BattingStats, BowlingStats, InningsState, MatchState } from '../../../types/match';
import { calculateAwards } from '../../../utils/awardsUtils';
import { computeSeriesAwards, computeTally, getSeriesMatches, groupHistory } from '../seriesUtils';

const series = { id: 'S1', teamA: 'LIONS', teamB: 'TIGERS' };

const bat = (playerId: string, runs: number, ballsFaced: number, isOut = true): BattingStats => ({
    playerId, runs, ballsFaced, fours: 0, sixes: 0, isOut, isRetired: false, battingOrder: 1,
});

const bowl = (playerId: string, wickets: number, runsConceded: number): BowlingStats => ({
    playerId, overs: 1, balls: 6, maidens: 0, runsConceded, wickets,
});

const innings = (
    battingTeam: string,
    key: 'teamA' | 'teamB',
    batting: BattingStats[],
    bowling: BowlingStats[],
    fielderIds: string[] = []
): InningsState => ({
    battingTeam,
    battingTeamKey: key,
    totalRuns: batting.reduce((sum, b) => sum + b.runs, 0),
    totalWickets: 0,
    overs: [{
        bowlerId: bowling[0]?.playerId ?? '',
        balls: fielderIds.map(fielderId => ({
            runs: 0, extraType: 'none', isWicket: true, wicketType: 'caught', isValidBall: true,
            batsmanId: '', bowlerId: '', fielderId,
        })),
    }],
    currentOver: [],
    strikerId: '',
    nonStrikerId: '',
    currentBowlerId: null,
    battingStats: Object.fromEntries(batting.map(b => [b.playerId, b])),
    bowlingStats: Object.fromEntries(bowling.map(b => [b.playerId, b])),
    fallOfWickets: [],
});

type MatchSpec = {
    seriesId?: string;
    teamA?: string;
    teamB?: string;
    winner?: string | null;
    completedAt?: string;
    namesA?: string[];
    namesB?: string[];
    innings1?: InningsState;
    innings2?: InningsState;
};

const createMatch = (spec: MatchSpec = {}): MatchState => {
    const teamA = spec.teamA ?? 'LIONS';
    const teamB = spec.teamB ?? 'TIGERS';
    const namesA = spec.namesA ?? ['Asha', 'Anil'];
    const namesB = spec.namesB ?? ['Bala', 'Bina'];
    return {
        teamA, teamB,
        overs: 5, playersPerTeam: 2, runsForWide: 1, runsForNoBall: 1,
        reballForWide: true, reballForNoBall: true,
        seriesId: spec.seriesId,
        isPlaying: false,
        matchResult: spec.winner === null ? null : { winner: spec.winner ?? teamA, reason: '' },
        currentInnings: 2,
        teamAPlayers: namesA.map((name, i) => ({ id: `A${i + 1}`, name })),
        teamBPlayers: namesB.map((name, i) => ({ id: `B${i + 1}`, name })),
        innings1: spec.innings1 ?? innings(teamA, 'teamA', [], []),
        innings2: spec.innings2 ?? innings(teamB, 'teamB', [], []),
        isInningsBreak: false,
        completedAt: spec.completedAt ?? '2026-01-01T10:00:00.000Z',
    };
};

describe('seriesUtils', () => {
    describe('computeTally / getSeriesMatches', () => {
        test('counts wins for both sides, ties and no-result separately', () => {
            const history = [
                createMatch({ seriesId: 'S1', winner: 'LIONS', completedAt: '2026-01-01T10:00:00.000Z' }),
                createMatch({ seriesId: 'S1', winner: 'TIGERS', completedAt: '2026-01-02T10:00:00.000Z' }),
                createMatch({ seriesId: 'S1', winner: 'LIONS', completedAt: '2026-01-03T10:00:00.000Z' }),
                createMatch({ seriesId: 'S1', winner: 'Draw', completedAt: '2026-01-04T10:00:00.000Z' }),
                createMatch({ seriesId: 'S1', winner: null, completedAt: '2026-01-05T10:00:00.000Z' }),
            ];

            expect(computeTally(history, series)).toEqual({ played: 5, winsA: 2, winsB: 1, ties: 1, noResult: 1 });
        });

        test('ignores matches of other series and individual matches', () => {
            const history = [
                createMatch({ seriesId: 'S1', winner: 'LIONS' }),
                createMatch({ seriesId: 'S2', winner: 'LIONS', completedAt: '2026-01-02T10:00:00.000Z' }),
                createMatch({ winner: 'TIGERS', completedAt: '2026-01-03T10:00:00.000Z' }),
            ];

            expect(computeTally(history, series).played).toBe(1);
        });

        test('ignores a match whose team names differ from the series teams', () => {
            const history = [
                createMatch({ seriesId: 'S1', winner: 'LIONS', completedAt: '2026-01-01T10:00:00.000Z' }),
                createMatch({ seriesId: 'S1', teamB: 'PANTHERS', winner: 'LIONS', completedAt: '2026-01-02T10:00:00.000Z' }),
            ];

            expect(computeTally(history, series)).toMatchObject({ played: 1, winsA: 1 });
        });

        test('counts a match where the teams are swapped', () => {
            const history = [createMatch({ seriesId: 'S1', teamA: 'TIGERS', teamB: 'LIONS', winner: 'LIONS' })];

            expect(computeTally(history, series)).toMatchObject({ played: 1, winsA: 1, winsB: 0 });
        });

        test('returns series matches newest first', () => {
            const older = createMatch({ seriesId: 'S1', completedAt: '2026-01-01T10:00:00.000Z' });
            const newer = createMatch({ seriesId: 'S1', completedAt: '2026-01-02T10:00:00.000Z' });

            expect(getSeriesMatches([older, newer], series)).toEqual([newer, older]);
        });
    });

    describe('groupHistory', () => {
        test('treats an individual match as a group of one', () => {
            const individual = createMatch({ completedAt: '2026-01-01T10:00:00.000Z' });

            const groups = groupHistory([individual]);

            expect(groups).toHaveLength(1);
            expect(groups[0].seriesId).toBeUndefined();
            expect(groups[0].matches).toEqual([individual]);
        });

        test('groups series matches together and orders groups by most recent match', () => {
            const s1Old = createMatch({ seriesId: 'S1', completedAt: '2026-01-01T10:00:00.000Z' });
            const single = createMatch({ completedAt: '2026-01-02T10:00:00.000Z' });
            const s1New = createMatch({ seriesId: 'S1', completedAt: '2026-01-03T10:00:00.000Z' });

            const groups = groupHistory([s1New, single, s1Old]);

            expect(groups.map(g => g.key)).toEqual(['S1', '2026-01-02T10:00:00.000Z']);
            expect(groups[0].matches).toEqual([s1New, s1Old]);
        });

        test('keeps a series with one completed match as a group with one match', () => {
            const groups = groupHistory([createMatch({ seriesId: 'S1' })]);

            expect(groups[0].seriesId).toBe('S1');
            expect(groups[0].matches).toHaveLength(1);
        });
    });

    describe('computeSeriesAwards', () => {
        test('totals players by name across matches even when match-local ids change', () => {
            // Match 1: Asha is A1. Match 2: Asha is A2 (roster order changed).
            const match1 = createMatch({
                seriesId: 'S1',
                namesA: ['Asha', 'Anil'],
                innings1: innings('LIONS', 'teamA', [bat('A1', 30, 20), bat('A2', 5, 8)], [bowl('A1', 0, 0)]),
                innings2: innings('TIGERS', 'teamB', [bat('B1', 10, 10)], [bowl('B1', 2, 12)]),
            });
            const match2 = createMatch({
                seriesId: 'S1',
                namesA: ['Anil', 'Asha'],
                completedAt: '2026-01-02T10:00:00.000Z',
                innings1: innings('LIONS', 'teamA', [bat('A2', 40, 25), bat('A1', 2, 5)], [bowl('A1', 0, 0)]),
                innings2: innings('TIGERS', 'teamB', [bat('B1', 8, 10)], [bowl('B1', 1, 20)]),
            });

            const awards = computeSeriesAwards([match1, match2]);
            const byType = Object.fromEntries(awards.map(a => [a.type, a]));

            expect(byType.bestBatsman).toMatchObject({ playerName: 'Asha', stats: '70 Runs (45 Balls)' });
            expect(byType.bestBowler).toMatchObject({ playerName: 'Bala', stats: '3 Wickets' });
        });

        test('mvp is the player with the most points and appears first', () => {
            const match = createMatch({
                innings1: innings('LIONS', 'teamA', [bat('A1', 20, 15)], [bowl('A2', 0, 0)]),
                innings2: innings('TIGERS', 'teamB', [bat('B1', 5, 5)], [bowl('B1', 1, 10)]),
            });

            const awards = computeSeriesAwards([match]);

            // Asha: 20 pts. Bala: 5 runs + 25 for one wicket = 30 pts.
            expect(awards[0]).toMatchObject({ type: 'mvp', playerName: 'Bala', stats: '5 Runs, 1 Wkts' });
        });

        test('tie-breaks the best batsman on fewer balls faced', () => {
            const match = createMatch({
                innings1: innings('LIONS', 'teamA', [bat('A1', 30, 30), bat('A2', 30, 20)], [bowl('A1', 0, 0)]),
            });

            const batsman = computeSeriesAwards([match]).find(a => a.type === 'bestBatsman');

            expect(batsman?.playerName).toBe('Anil');
        });

        test('returns no awards for a series without any scoring', () => {
            expect(computeSeriesAwards([createMatch()])).toEqual([]);
            expect(computeSeriesAwards([])).toEqual([]);
        });

        test('matches the per-match awards for a series of one match', () => {
            const match = createMatch({
                innings1: innings('LIONS', 'teamA', [bat('A1', 45, 30), bat('A2', 12, 14)], [bowl('A2', 1, 18)], ['A2']),
                innings2: innings('TIGERS', 'teamB', [bat('B1', 22, 18)], [bowl('B1', 3, 25)], ['B2']),
            });

            const expected = calculateAwards(match);
            const actual = computeSeriesAwards([match]);

            expect(actual.map(a => ({ type: a.type === 'mvp' ? 'potm' : a.type, name: a.playerName, stats: a.stats })))
                .toEqual(
                    expected
                        .filter(a => a.type !== 'bestFielder')
                        .map(a => ({ type: a.type, name: a.playerName, stats: a.stats }))
                );
        });
    });
});
