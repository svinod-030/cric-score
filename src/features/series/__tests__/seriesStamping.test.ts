import { act } from '@testing-library/react-native';
import { useMatchStore } from '../../../store/useMatchStore';

// A match started with seriesId in config carries it into state and then into history,
// without any change to the match store itself.
describe('seriesId stamping', () => {
    beforeEach(() => {
        act(() => {
            useMatchStore.getState().resetMatch();
            useMatchStore.setState({ history: [] });
        });
    });

    const playToCompletion = (seriesId?: string) => {
        act(() => {
            const store = useMatchStore.getState();
            store.setConfig({
                teamA: 'LIONS', teamB: 'TIGERS', overs: 2, playersPerTeam: 2,
                tossWinner: 'teamA', tossDecision: 'bat', seriesId,
            });
            useMatchStore.getState().startMatch();
            useMatchStore.getState().endInnings();
            useMatchStore.getState().startSecondInnings();
            useMatchStore.getState().endInnings();
        });
    };

    test('a series match carries its seriesId into history', () => {
        playToCompletion('S1');

        const { history, state } = useMatchStore.getState();
        expect(state.seriesId).toBe('S1');
        expect(history).toHaveLength(1);
        expect(history[0].seriesId).toBe('S1');
    });

    test('an individual match started right after a series match carries no seriesId', () => {
        playToCompletion('S1');
        act(() => useMatchStore.getState().resetMatch());

        playToCompletion(undefined);

        const { history } = useMatchStore.getState();
        expect(history).toHaveLength(2);
        expect(history[0].seriesId).toBeUndefined(); // newest first: the individual match
        expect(history[1].seriesId).toBe('S1');
    });
});
