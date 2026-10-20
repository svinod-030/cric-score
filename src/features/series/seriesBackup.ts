import { MatchState } from '../../types/match';
import { useSeriesStore } from './useSeriesStore';

// Brings series metadata back after matches were restored from a Drive backup.
// Backups made before series existed (or by older app versions) simply have no `seriesStorage`;
// in that case series are rebuilt from the seriesId on the restored matches.
export const restoreSeriesFromBackup = (backupData: string) => {
    let parsed: any;
    try {
        parsed = JSON.parse(backupData);
    } catch {
        return;
    }

    const history: MatchState[] = Array.isArray(parsed?.state?.history) ? parsed.state.history : [];
    const backedUp = parsed?.seriesStorage;

    if (backedUp && Array.isArray(backedUp.series)) {
        useSeriesStore.setState((store) => {
            const known = new Set(store.series.map(s => s.id));
            const added = backedUp.series.filter((s: any) => {
                if (!s?.id || known.has(s.id)) return false;
                known.add(s.id);
                return true;
            });
            return {
                series: [...store.series, ...added],
                activeSeriesId: store.activeSeriesId ?? backedUp.activeSeriesId,
            };
        });
    }

    useSeriesStore.getState().reconcileFromHistory(history);
};
