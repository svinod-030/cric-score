import { act } from '@testing-library/react-native';
import { MatchState } from '../../../types/match';
import { useMatchStore } from '../../../store/useMatchStore';
import { useSeriesStore } from '../useSeriesStore';

const completed = (seriesId: string | undefined, completedAt: string, teamA = 'LIONS', teamB = 'TIGERS'): MatchState => ({
    ...useMatchStore.getState().state,
    teamA,
    teamB,
    seriesId,
    isPlaying: false,
    matchResult: { winner: teamA, reason: '' },
    completedAt,
});

const reset = () => {
    useSeriesStore.setState({ series: [], activeSeriesId: undefined });
    useMatchStore.getState().resetMatch();
    useMatchStore.setState({ history: [] });
};

describe('useSeriesStore', () => {
    beforeEach(() => act(reset));

    test('startSeries creates an active series', () => {
        let id = '';
        act(() => { id = useSeriesStore.getState().startSeries('LIONS', 'TIGERS'); });

        const { series, activeSeriesId } = useSeriesStore.getState();
        expect(activeSeriesId).toBe(id);
        expect(series).toHaveLength(1);
        expect(series[0]).toMatchObject({ id, teamA: 'LIONS', teamB: 'TIGERS' });
        expect(series[0].endedAt).toBeUndefined();
    });

    test('starting a new series ends the previously active one', () => {
        let first = '';
        act(() => {
            first = useSeriesStore.getState().startSeries('LIONS', 'TIGERS');
            useSeriesStore.getState().startSeries('A', 'B');
        });

        const old = useSeriesStore.getState().series.find(s => s.id === first);
        expect(old?.endedAt).toBeDefined();
    });

    test('endSeries keeps a series that has matches and clears active', () => {
        let id = '';
        act(() => {
            id = useSeriesStore.getState().startSeries('LIONS', 'TIGERS');
            useMatchStore.setState({ history: [completed(id, '2026-01-01T10:00:00.000Z')] });
            useSeriesStore.getState().endSeries(id);
        });

        const { series, activeSeriesId } = useSeriesStore.getState();
        expect(activeSeriesId).toBeUndefined();
        expect(series).toHaveLength(1);
        expect(series[0].endedAt).toBeDefined();
    });

    test('endSeries deletes a series with no completed matches', () => {
        act(() => {
            const id = useSeriesStore.getState().startSeries('LIONS', 'TIGERS');
            useSeriesStore.getState().endSeries(id);
        });

        expect(useSeriesStore.getState().series).toHaveLength(0);
    });

    test('endSeries keeps a series whose match is still being played', () => {
        act(() => {
            const id = useSeriesStore.getState().startSeries('LIONS', 'TIGERS');
            useMatchStore.setState((s) => ({ state: { ...s.state, isPlaying: true, seriesId: id } }));
            useSeriesStore.getState().endSeries(id);
        });

        expect(useSeriesStore.getState().series).toHaveLength(1);
    });

    describe('deleteSeries', () => {
        test('removes every match of the series and the series itself, leaving other matches alone', () => {
            let id = '';
            act(() => {
                id = useSeriesStore.getState().startSeries('LIONS', 'TIGERS');
                useMatchStore.setState({
                    history: [
                        completed(id, '2026-01-03T10:00:00.000Z'),
                        completed(undefined, '2026-01-02T10:00:00.000Z'),
                        completed(id, '2026-01-01T10:00:00.000Z'),
                    ],
                });
            });

            let result: { ok: boolean } = { ok: false };
            act(() => { result = useSeriesStore.getState().deleteSeries(id); });

            expect(result.ok).toBe(true);
            expect(useMatchStore.getState().history.map(m => m.completedAt)).toEqual(['2026-01-02T10:00:00.000Z']);
            expect(useSeriesStore.getState().series).toHaveLength(0);
            expect(useSeriesStore.getState().activeSeriesId).toBeUndefined();
        });

        test('is blocked while a match of the series is in progress', () => {
            let id = '';
            act(() => {
                id = useSeriesStore.getState().startSeries('LIONS', 'TIGERS');
                useMatchStore.setState((s) => ({
                    history: [completed(id, '2026-01-01T10:00:00.000Z')],
                    state: { ...s.state, isPlaying: true, seriesId: id },
                }));
            });

            let result: { ok: boolean; reason?: string } = { ok: true };
            act(() => { result = useSeriesStore.getState().deleteSeries(id); });

            expect(result).toEqual({ ok: false, reason: 'inProgress' });
            expect(useMatchStore.getState().history).toHaveLength(1);
            expect(useSeriesStore.getState().series).toHaveLength(1);
        });
    });

    describe('reconcileFromHistory', () => {
        test('recreates missing series from the seriesId on matches, as ended', () => {
            const history = [
                completed('SX', '2026-01-02T10:00:00.000Z'),
                completed('SX', '2026-01-01T10:00:00.000Z'),
            ];

            act(() => useSeriesStore.getState().reconcileFromHistory(history));

            const { series, activeSeriesId } = useSeriesStore.getState();
            expect(activeSeriesId).toBeUndefined();
            expect(series).toEqual([{
                id: 'SX',
                teamA: 'LIONS',
                teamB: 'TIGERS',
                createdAt: '2026-01-01T10:00:00.000Z',
                endedAt: '2026-01-02T10:00:00.000Z',
            }]);
        });

        test('drops series with no matches but keeps the active one', () => {
            let activeId = '';
            act(() => {
                useSeriesStore.setState({
                    series: [{ id: 'GONE', teamA: 'A', teamB: 'B', createdAt: '2026-01-01T10:00:00.000Z', endedAt: '2026-01-02T10:00:00.000Z' }],
                });
                activeId = useSeriesStore.getState().startSeries('LIONS', 'TIGERS');
            });

            act(() => useSeriesStore.getState().reconcileFromHistory([]));

            expect(useSeriesStore.getState().series.map(s => s.id)).toEqual([activeId]);
        });

        test('clears activeSeriesId when the active series no longer exists', () => {
            act(() => useSeriesStore.setState({ series: [], activeSeriesId: 'MISSING' }));

            act(() => useSeriesStore.getState().reconcileFromHistory([]));

            expect(useSeriesStore.getState().activeSeriesId).toBeUndefined();
        });
    });
});
