import { act } from '@testing-library/react-native';
import { MatchState } from '../../../types/match';
import { restoreSeriesFromBackup } from '../seriesBackup';
import { useSeriesStore } from '../useSeriesStore';

const match = (seriesId: string | undefined, completedAt: string) =>
    ({ teamA: 'LIONS', teamB: 'TIGERS', seriesId, completedAt } as MatchState);

const backup = (history: MatchState[], seriesStorage?: any) =>
    JSON.stringify({ state: { history }, version: 0, ...(seriesStorage ? { seriesStorage } : {}) });

describe('restoreSeriesFromBackup', () => {
    beforeEach(() => {
        act(() => useSeriesStore.setState({ series: [], activeSeriesId: undefined }));
    });

    test('restores backed-up series records', () => {
        const history = [match('S1', '2026-05-01T10:00:00.000Z')];
        const record = { id: 'S1', teamA: 'LIONS', teamB: 'TIGERS', createdAt: '2026-05-01T09:00:00.000Z', endedAt: '2026-05-01T11:00:00.000Z' };

        act(() => restoreSeriesFromBackup(backup(history, { series: [record], activeSeriesId: undefined })));

        expect(useSeriesStore.getState().series).toEqual([record]);
    });

    test('keeps the device\'s current active series and does not duplicate known series', () => {
        let currentId = '';
        act(() => { currentId = useSeriesStore.getState().startSeries('KINGS', 'QUEENS'); });
        const history = [match('S1', '2026-05-01T10:00:00.000Z')];
        const record = { id: 'S1', teamA: 'LIONS', teamB: 'TIGERS', createdAt: '2026-05-01T09:00:00.000Z' };

        act(() => restoreSeriesFromBackup(backup(history, { series: [record, record], activeSeriesId: 'S1' })));

        const { series, activeSeriesId } = useSeriesStore.getState();
        expect(activeSeriesId).toBe(currentId);
        expect(series.map(s => s.id).sort()).toEqual([currentId, 'S1'].sort());
    });

    test('rebuilds series from matches when the backup has no series data (older backups)', () => {
        const history = [match('S9', '2026-05-02T10:00:00.000Z'), match('S9', '2026-05-01T10:00:00.000Z'), match(undefined, '2026-05-03T10:00:00.000Z')];

        act(() => restoreSeriesFromBackup(backup(history)));

        const { series, activeSeriesId } = useSeriesStore.getState();
        expect(activeSeriesId).toBeUndefined();
        expect(series).toHaveLength(1);
        expect(series[0]).toMatchObject({ id: 'S9', teamA: 'LIONS', teamB: 'TIGERS', endedAt: '2026-05-02T10:00:00.000Z' });
    });

    test('ignores backups that are not valid JSON or have no matches', () => {
        expect(() => restoreSeriesFromBackup('not json')).not.toThrow();
        expect(() => restoreSeriesFromBackup(JSON.stringify({ matches: [] }))).not.toThrow();
        expect(useSeriesStore.getState().series).toEqual([]);
    });
});
