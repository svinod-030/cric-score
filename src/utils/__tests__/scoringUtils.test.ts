import { calculateMatchResult, processBall } from '../scoringUtils';
import { MatchConfig, MatchState, MatchResult } from '../../types/match';

describe('scoringUtils', () => {
    describe('calculateMatchResult', () => {
        const mockConfig: MatchConfig = {
            overs: 5,
            playersPerTeam: 11,
            teamA: 'Team A',
            teamB: 'Team B',
            runsForWide: 1,
            runsForNoBall: 1,
            reballForWide: true,
            reballForNoBall: true,
            isCustomNamesEnabled: false,
        };

        const createMockState = (runs1: number, runs2: number, wickets2: number = 0): MatchState => ({
            teamA: 'Team A',
            teamB: 'Team B',
            teamAPlayers: [],
            teamBPlayers: [],
            currentInnings: 2,
            isPlaying: true,
            isInningsBreak: false,
            matchResult: null,
            overs: mockConfig.overs,
            playersPerTeam: mockConfig.playersPerTeam,
            runsForWide: mockConfig.runsForWide,
            runsForNoBall: mockConfig.runsForNoBall,
            reballForWide: mockConfig.reballForWide,
            reballForNoBall: mockConfig.reballForNoBall,
            isCustomNamesEnabled: mockConfig.isCustomNamesEnabled,
            innings1: {
                battingTeam: 'Team A',
                battingTeamKey: 'teamA',
                totalRuns: runs1,
                totalWickets: 0,
                currentOver: [],
                overs: [],
                battingStats: {},
                bowlingStats: {},
                strikerId: 'player1',
                nonStrikerId: 'player2',
                currentBowlerId: 'bowler1',
                fallOfWickets: [],
            },
            innings2: {
                battingTeam: 'Team B',
                battingTeamKey: 'teamB',
                totalRuns: runs2,
                totalWickets: wickets2,
                currentOver: [],
                overs: [],
                battingStats: {},
                bowlingStats: {},
                strikerId: 'player3',
                nonStrikerId: 'player4',
                currentBowlerId: 'bowler2',
                fallOfWickets: [],
            },
        });

        test('should return Team A as winner when they score more runs', () => {
            const state = createMockState(150, 120);
            const result = calculateMatchResult(state, mockConfig);

            expect(result).not.toBeNull();
            expect(result?.winner).toBe('Team A');
            expect(result?.reason).toBe('Won by 30 runs');
        });

        test('should return Team B as winner when they score more runs', () => {
            const state = createMockState(120, 125, 5);
            const result = calculateMatchResult(state, mockConfig);

            expect(result).not.toBeNull();
            expect(result?.winner).toBe('Team B');
            expect(result?.reason).toBe('Won by 5 wickets');
        });

        test('should return Draw when scores are tied', () => {
            const state = createMockState(150, 150);
            const result = calculateMatchResult(state, mockConfig);

            expect(result).not.toBeNull();
            expect(result?.winner).toBe('Draw');
            expect(result?.reason).toBe('Scores are tied');
        });

        test('should calculate correct wickets remaining for Team B win', () => {
            const state = createMockState(100, 101, 7);
            const result = calculateMatchResult(state, mockConfig);

            expect(result).not.toBeNull();
            expect(result?.winner).toBe('Team B');
            expect(result?.reason).toBe('Won by 3 wickets');
        });
    });

    describe('processBall', () => {
        const mockConfig: MatchConfig = {
            overs: 5,
            playersPerTeam: 11,
            teamA: 'Team A',
            teamB: 'Team B',
            runsForWide: 1,
            runsForNoBall: 1,
            reballForWide: true,
            reballForNoBall: true,
            isCustomNamesEnabled: false,
        };

        const createInitialState = (): MatchState => ({
            teamA: 'Team A',
            teamB: 'Team B',
            teamAPlayers: [
                { id: 'p1', name: 'Player 1' },
                { id: 'p2', name: 'Player 2' },
                { id: 'p3', name: 'Player 3' },
            ],
            teamBPlayers: [
                { id: 'p4', name: 'Player 4' },
                { id: 'p5', name: 'Player 5' },
            ],
            currentInnings: 1,
            isPlaying: true,
            isInningsBreak: false,
            matchResult: null,
            overs: mockConfig.overs,
            playersPerTeam: mockConfig.playersPerTeam,
            runsForWide: mockConfig.runsForWide,
            runsForNoBall: mockConfig.runsForNoBall,
            reballForWide: mockConfig.reballForWide,
            reballForNoBall: mockConfig.reballForNoBall,
            isCustomNamesEnabled: mockConfig.isCustomNamesEnabled,
            innings1: {
                battingTeam: 'Team A',
                battingTeamKey: 'teamA',
                totalRuns: 0,
                totalWickets: 0,
                currentOver: [],
                overs: [],
                battingStats: {},
                bowlingStats: {},
                strikerId: 'p1',
                nonStrikerId: 'p2',
                currentBowlerId: 'p4',
                fallOfWickets: [],
            },
            innings2: {
                battingTeam: 'Team B',
                battingTeamKey: 'teamB',
                totalRuns: 0,
                totalWickets: 0,
                currentOver: [],
                overs: [],
                battingStats: {},
                bowlingStats: {},
                strikerId: '',
                nonStrikerId: '',
                currentBowlerId: null,
                fallOfWickets: [],
            },
        });

        test('should add runs correctly for a normal ball', () => {
            const state = createInitialState();
            const newState = processBall(state, mockConfig, 4, 'none', false);

            expect(newState.innings1.totalRuns).toBe(4);
            expect(newState.innings1.battingStats['p1'].runs).toBe(4);
            expect(newState.innings1.battingStats['p1'].fours).toBe(1);
            expect(newState.innings1.battingStats['p1'].ballsFaced).toBe(1);
        });

        test('should add runs and six correctly', () => {
            const state = createInitialState();
            const newState = processBall(state, mockConfig, 6, 'none', false);

            expect(newState.innings1.totalRuns).toBe(6);
            expect(newState.innings1.battingStats['p1'].runs).toBe(6);
            expect(newState.innings1.battingStats['p1'].sixes).toBe(1);
            expect(newState.innings1.battingStats['p1'].ballsFaced).toBe(1);
        });

        test('should handle wide correctly', () => {
            const state = createInitialState();
            const newState = processBall(state, mockConfig, 0, 'wide', false);

            expect(newState.innings1.totalRuns).toBe(1);
            expect(newState.innings1.battingStats['p1'].ballsFaced).toBe(0);
            expect(newState.innings1.currentOver.length).toBe(1);
            expect(newState.innings1.currentOver[0].isValidBall).toBe(false);
        });

        test('should handle no-ball correctly', () => {
            const state = createInitialState();
            const newState = processBall(state, mockConfig, 2, 'no-ball', false);

            expect(newState.innings1.totalRuns).toBe(3); // 2 runs + 1 no-ball penalty
            expect(newState.innings1.battingStats['p1'].runs).toBe(2);
            expect(newState.innings1.battingStats['p1'].ballsFaced).toBe(0);
        });

        test('should credit a boundary to the batsman off a no-ball', () => {
            const state = createInitialState();
            const newState = processBall(state, mockConfig, 4, 'no-ball', false, undefined, undefined, undefined);

            // Team total = 4 (bat) + 1 (no-ball penalty)
            expect(newState.innings1.totalRuns).toBe(5);
            // Batsman gets the 4 runs and a "four" on their card
            expect(newState.innings1.battingStats['p1'].runs).toBe(4);
            expect(newState.innings1.battingStats['p1'].fours).toBe(1);
            // Bowler is charged for everything (runs off bat + the no-ball penalty)
            expect(newState.innings1.bowlingStats['p4'].runsConceded).toBe(5);
            // No-ball is not a legal delivery when re-ball is enabled
            expect(newState.innings1.currentOver[0].isValidBall).toBe(false);
        });

        test('should credit a six to the batsman off a no-ball', () => {
            const state = createInitialState();
            const newState = processBall(state, mockConfig, 6, 'no-ball', false);

            expect(newState.innings1.totalRuns).toBe(7);
            expect(newState.innings1.battingStats['p1'].runs).toBe(6);
            expect(newState.innings1.battingStats['p1'].sixes).toBe(1);
            expect(newState.innings1.bowlingStats['p4'].runsConceded).toBe(7);
        });

        test('should support a custom/overthrow total off a no-ball (e.g. 2 run + overthrow)', () => {
            const state = createInitialState();
            const newState = processBall(state, mockConfig, 5, 'no-ball', false);

            // 5 off the bat + 1 no-ball penalty
            expect(newState.innings1.totalRuns).toBe(6);
            expect(newState.innings1.battingStats['p1'].runs).toBe(5);
            expect(newState.innings1.bowlingStats['p4'].runsConceded).toBe(6);
        });

        test('should NOT credit the batsman when runs off a no-ball are byes', () => {
            const state = createInitialState();
            // isByeForNoBall = true
            const newState = processBall(state, mockConfig, 4, 'no-ball', false, undefined, undefined, true);

            expect(newState.innings1.totalRuns).toBe(5); // 4 byes + 1 no-ball penalty
            expect(newState.innings1.battingStats['p1'].runs).toBe(0);
            expect(newState.innings1.battingStats['p1'].fours).toBe(0);
            // Bowler is still charged for everything conceded off a no-ball, byes included
            expect(newState.innings1.bowlingStats['p4'].runsConceded).toBe(5);
        });

        test('should honor a custom no-ball run value from match settings', () => {
            const state = createInitialState();
            const customConfig = { ...mockConfig, runsForNoBall: 2 };
            const newState = processBall(state, customConfig, 1, 'no-ball', false);

            expect(newState.innings1.totalRuns).toBe(3); // 1 run + 2 no-ball penalty
            expect(newState.innings1.battingStats['p1'].runs).toBe(1);
        });

        test('should not create a battingStats entry keyed by an empty string when there is no non-striker (last man standing)', () => {
            const state = createInitialState();
            state.innings1.nonStrikerId = '';

            const newState = processBall(state, mockConfig, 1, 'none', false);

            expect(newState.innings1.battingStats['']).toBeUndefined();
            expect(Object.keys(newState.innings1.battingStats)).toEqual(['p1']);
            expect(newState.innings1.battingStats['p1'].runs).toBe(1);
        });

        test('should not create a battingStats entry keyed by an empty string when there is no striker', () => {
            const state = createInitialState();
            state.innings1.strikerId = '';

            const newState = processBall(state, mockConfig, 0, 'none', false);

            expect(newState.innings1.battingStats['']).toBeUndefined();
            expect(Object.keys(newState.innings1.battingStats)).toEqual(['p2']);
        });

        test('should swap strike on odd runs', () => {
            const state = createInitialState();
            const newState = processBall(state, mockConfig, 1, 'none', false);

            expect(newState.innings1.strikerId).toBe('p2');
            expect(newState.innings1.nonStrikerId).toBe('p1');
        });

        test('should not swap strike on even runs', () => {
            const state = createInitialState();
            const newState = processBall(state, mockConfig, 2, 'none', false);

            expect(newState.innings1.strikerId).toBe('p1');
            expect(newState.innings1.nonStrikerId).toBe('p2');
        });

        test('should handle wicket correctly', () => {
            const state = createInitialState();
            const newState = processBall(state, mockConfig, 0, 'none', true, 'bowled');

            expect(newState.innings1.totalWickets).toBe(1);
            expect(newState.innings1.battingStats['p1'].isOut).toBe(true);
            expect(newState.innings1.battingStats['p1'].dismissal).toBe('bowled');
            expect(newState.innings1.bowlingStats['p4'].wickets).toBe(1);
        });

        test('should complete over after 6 valid balls', () => {
            let state = createInitialState();

            // Bowl 6 balls
            for (let i = 0; i < 6; i++) {
                state = processBall(state, mockConfig, 0, 'none', false);
            }

            expect(state.innings1.overs.length).toBe(1);
            expect(state.innings1.currentOver.length).toBe(0);
            expect(state.innings1.overs[0].balls.length).toBe(6);
            // Strike should swap at end of over (p1 becomes non-striker, p2 becomes striker)
            expect(state.innings1.strikerId).toBe('p2');
            expect(state.innings1.nonStrikerId).toBe('p1');
        });

        test('should handle bye correctly', () => {
            const state = createInitialState();
            const newState = processBall(state, mockConfig, 2, 'bye', false);

            expect(newState.innings1.totalRuns).toBe(2);
            expect(newState.innings1.battingStats['p1'].runs).toBe(0);
            expect(newState.innings1.battingStats['p1'].ballsFaced).toBe(1);
            expect(newState.innings1.bowlingStats['p4'].runsConceded).toBe(0);
        });

        test('should handle leg-bye correctly', () => {
            const state = createInitialState();
            const newState = processBall(state, mockConfig, 1, 'leg-bye', false);

            expect(newState.innings1.totalRuns).toBe(1);
            expect(newState.innings1.battingStats['p1'].runs).toBe(0);
            expect(newState.innings1.battingStats['p1'].ballsFaced).toBe(1);
            expect(newState.innings1.bowlingStats['p4'].runsConceded).toBe(0);
        });

        test('should detect maiden over correctly', () => {
            let state = createInitialState();

            // Bowl 6 dot balls
            for (let i = 0; i < 6; i++) {
                state = processBall(state, mockConfig, 0, 'none', false);
            }

            expect(state.innings1.bowlingStats['p4'].maidens).toBe(1);
        });

        test('should detect maiden over with byes', () => {
            let state = createInitialState();

            // Bowl 5 dots and 1 bye
            for (let i = 0; i < 5; i++) {
                state = processBall(state, mockConfig, 0, 'none', false);
            }
            state = processBall(state, mockConfig, 4, 'bye', false);

            expect(state.innings1.bowlingStats['p4'].runsConceded).toBe(0);
            expect(state.innings1.bowlingStats['p4'].maidens).toBe(1);
        });

        test('should NOT detect maiden over if runs are conceded', () => {
            let state = createInitialState();

            // Bowl 5 dots and 1 run
            for (let i = 0; i < 5; i++) {
                state = processBall(state, mockConfig, 0, 'none', false);
            }
            state = processBall(state, mockConfig, 1, 'none', false);

            expect(state.innings1.bowlingStats['p4'].maidens).toBe(0);
        });

        test('should NOT detect maiden over if wide is bowled', () => {
            let state = createInitialState();

            // Bowl 1 wide and then 6 dots
            state = processBall(state, mockConfig, 0, 'wide', false);
            for (let i = 0; i < 6; i++) {
                state = processBall(state, mockConfig, 0, 'none', false);
            }

            expect(state.innings1.bowlingStats['p4'].maidens).toBe(0);
        });
    });
});
