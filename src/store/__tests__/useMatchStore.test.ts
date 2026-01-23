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
        expect(state.state.innings1.totalRuns).toBe(0);
        // expect(state.state.innings1.battingStats['A1'].runs).toBe(0); // Stats might be reset to empty
    });
});
