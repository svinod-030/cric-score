import { act } from '@testing-library/react-native';
import { useMatchStore } from '../useMatchStore';

describe('useMatchStore', () => {
    // We need to reset the store before each test
    beforeEach(() => {
        const { resetMatch } = useMatchStore.getState();
        act(() => {
            resetMatch();
        });
    });

    test('initial state is correct', () => {
        const state = useMatchStore.getState();
        expect(state.state.isPlaying).toBe(false);
        expect(state.config.teamA).toBe('Team A');
    });

    test('starts a match correctly', () => {
        act(() => {
            useMatchStore.getState().setConfig({
                teamA: 'India',
                teamB: 'Australia',
                overs: 20,
                playersPerTeam: 11,
                runsForWide: 1,
                runsForNoBall: 1,
                tossWinner: 'teamA',
                tossDecision: 'bat'
            });
            useMatchStore.getState().startMatch();
        });

        const state = useMatchStore.getState();
        expect(state.state.isPlaying).toBe(true);
        expect(state.config.teamA).toBe('India');
        expect(state.state.innings1.battingTeam).toBe('India');
    });

    test('records a normal delivery', () => {
        // Setup match
        act(() => {
            useMatchStore.getState().setConfig({
                teamA: 'Team A',
                teamB: 'Team B',
                overs: 5,
                playersPerTeam: 2,
                tossWinner: 'teamA',
                tossDecision: 'bat'
            });
            useMatchStore.getState().startMatch();

            // Default IDs are A1, A2, B1, B2
            useMatchStore.getState().setStriker('A1');
            useMatchStore.getState().setNonStriker('A2');
            useMatchStore.getState().setBowler('B1');
        });

        // Record 1 run
        act(() => {
            useMatchStore.getState().recordBall(1, 'none', false);
        });

        const state = useMatchStore.getState();
        expect(state.state.innings1.totalRuns).toBe(1);
        expect(state.state.innings1.battingStats['A1'].runs).toBe(1);
        // Strike should rotate
        expect(state.state.innings1.strikerId).toBe('A2');
    });

    test('records a wicket', () => {
        act(() => {
            useMatchStore.getState().setConfig({
                teamA: 'Team A',
                teamB: 'Team B',
                overs: 5,
                playersPerTeam: 2,
                tossWinner: 'teamA',
                tossDecision: 'bat'
            });
            useMatchStore.getState().startMatch();

            useMatchStore.getState().setStriker('A1');
            useMatchStore.getState().setNonStriker('A2');
            useMatchStore.getState().setBowler('B1');
        });

        act(() => {
            useMatchStore.getState().recordBall(0, 'none', true, 'bowled');
        });

        const state = useMatchStore.getState();
        expect(state.state.innings1.totalWickets).toBe(1);
        expect(state.state.innings1.strikerId).toBe(''); // Should be unset (empty string) after wicket
        expect(state.state.innings1.battingStats['A1'].isOut).toBe(true);
    });

    test('undo functionality', () => {
        act(() => {
            useMatchStore.getState().setConfig({
                teamA: 'Team A',
                teamB: 'Team B',
                overs: 5,
                playersPerTeam: 2,
                tossWinner: 'teamA',
                tossDecision: 'bat'
            });
            useMatchStore.getState().startMatch();

            useMatchStore.getState().setStriker('A1');
            useMatchStore.getState().setNonStriker('A2');
            useMatchStore.getState().setBowler('B1');

            useMatchStore.getState().recordBall(4, 'none', false);
        });

        let state = useMatchStore.getState();
        expect(state.state.innings1.totalRuns).toBe(4);

        act(() => {
            useMatchStore.getState().undoBall();
        });

        state = useMatchStore.getState();
        expect(state.state.innings1.totalRuns).toBe(0);
    });

    test('assigns batting order correctly', () => {
        act(() => {
            useMatchStore.getState().setConfig({
                teamA: 'Team A',
                teamB: 'Team B',
                overs: 5,
                playersPerTeam: 11,
                tossWinner: 'teamA',
                tossDecision: 'bat'
            });
            useMatchStore.getState().startMatch();

            // Set A2 as striker first, then A4
            useMatchStore.getState().setStriker('A2');
            useMatchStore.getState().setNonStriker('A4');
        });

        let state = useMatchStore.getState();
        expect(state.state.innings1.battingStats['A2'].battingOrder).toBe(1);
        expect(state.state.innings1.battingStats['A4'].battingOrder).toBe(2);

        // Record a wicket for A2
        act(() => {
            useMatchStore.getState().recordBall(0, 'none', true, 'bowled');
        });

        // Set A3 as new striker
        act(() => {
            useMatchStore.getState().setStriker('A3');
        });

        state = useMatchStore.getState();
        expect(state.state.innings1.battingStats['A3'].battingOrder).toBe(3);
    });
    describe('default player names', () => {
        const setup = (overrides = {}) => act(() => {
            useMatchStore.getState().setConfig({
                teamA: 'TEAM A', teamB: 'TEAM B', overs: 5, playersPerTeam: 3,
                isCustomNamesEnabled: false, teamAPlayerNames: undefined, teamBPlayerNames: undefined,
                tossWinner: 'teamA', tossDecision: 'bat', ...overrides,
            });
        });

        test('startMatch names players with team initials and a number', () => {
            setup();
            act(() => useMatchStore.getState().startMatch());

            const { teamAPlayers, teamBPlayers } = useMatchStore.getState().state;
            expect(teamAPlayers.map(p => p.name)).toEqual(['TA1', 'TA2', 'TA3']);
            expect(teamBPlayers.map(p => p.name)).toEqual(['TB1', 'TB2', 'TB3']);
            // Match-local ids are unchanged
            expect(teamAPlayers.map(p => p.id)).toEqual(['A1', 'A2', 'A3']);
        });

        test('uses the initials of every word in a longer team name', () => {
            setup({ teamA: 'CHENNAI SUPER KINGS', teamB: 'LIONS' });
            act(() => useMatchStore.getState().startMatch());

            const { teamAPlayers, teamBPlayers } = useMatchStore.getState().state;
            expect(teamAPlayers[0].name).toBe('CSK1');
            expect(teamBPlayers[0].name).toBe('L1');
        });

        test('loadTeamRoster fills unsaved teams with short default names', () => {
            setup();
            act(() => useMatchStore.getState().loadTeamRoster('teamA', 'TEAM A'));

            expect(useMatchStore.getState().config.teamAPlayerNames).toEqual(['TA1', 'TA2', 'TA3']);
        });

        test('custom player names are still used as typed', () => {
            setup({ isCustomNamesEnabled: true, teamAPlayerNames: ['Asha', 'Anil', 'Arun'], teamBPlayerNames: ['Bala', '', 'Bina'] });
            act(() => useMatchStore.getState().startMatch());

            const { teamAPlayers, teamBPlayers } = useMatchStore.getState().state;
            expect(teamAPlayers.map(p => p.name)).toEqual(['Asha', 'Anil', 'Arun']);
            // A blank custom name falls back to the short default
            expect(teamBPlayers.map(p => p.name)).toEqual(['Bala', 'TB2', 'Bina']);
        });
    });
});
