import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MatchState } from '../../types/match';
import { useMatchStore } from '../../store/useMatchStore';
import { Series } from './types';

interface SeriesStore {
    series: Series[];
    activeSeriesId?: string; // At most one active series at a time
    startSeries: (teamA: string, teamB: string) => string;
    endSeries: (id: string) => void;
    deleteSeries: (id: string) => { ok: boolean; reason?: 'inProgress' };
    reconcileFromHistory: (history: MatchState[]) => void;
}

const generateSeriesId = () =>
    `S${Date.now().toString(36)}${Math.random().toString(36).substring(2, 6)}`.toUpperCase();

// A match of this series is being scored right now (it has not reached history yet).
const hasMatchInProgress = (seriesId: string) => {
    const match = useMatchStore.getState()?.state;
    return !!match && match.isPlaying && match.seriesId === seriesId;
};

export const useSeriesStore = create<SeriesStore>()(
    persist(
        (set, get) => ({
            series: [],
            activeSeriesId: undefined,

            startSeries: (teamA, teamB) => {
                const id = generateSeriesId();
                const now = new Date().toISOString();
                set((store) => ({
                    series: [
                        { id, teamA, teamB, createdAt: now },
                        // Only one series can be active: close any previous one.
                        ...store.series.map(s =>
                            s.id === store.activeSeriesId && !s.endedAt ? { ...s, endedAt: now } : s
                        ),
                    ],
                    activeSeriesId: id,
                }));
                return id;
            },

            endSeries: (id) => {
                const { history } = useMatchStore.getState();
                const hasMatches = history.some(m => m.seriesId === id);

                set((store) => ({
                    // Nothing was ever completed (and nothing is being played): don't keep an empty series.
                    series: hasMatches || hasMatchInProgress(id)
                        ? store.series.map(s => (s.id === id ? { ...s, endedAt: new Date().toISOString() } : s))
                        : store.series.filter(s => s.id !== id),
                    activeSeriesId: store.activeSeriesId === id ? undefined : store.activeSeriesId,
                }));
            },

            // Matches that belong to a series can only be deleted together, by deleting the series.
            deleteSeries: (id) => {
                if (hasMatchInProgress(id)) return { ok: false, reason: 'inProgress' };

                const { history, deleteMatch } = useMatchStore.getState();
                history
                    .filter(m => m.seriesId === id && m.completedAt)
                    .forEach(m => deleteMatch(m.completedAt!));

                set((store) => ({
                    series: store.series.filter(s => s.id !== id),
                    activeSeriesId: store.activeSeriesId === id ? undefined : store.activeSeriesId,
                }));
                return { ok: true };
            },

            // Keeps series metadata in step with history, e.g. after a restore from an older backup:
            // recreates missing series from the seriesId stamped on matches and drops series with no matches.
            reconcileFromHistory: (history) => {
                const bySeries = new Map<string, MatchState[]>();
                history.forEach(m => {
                    if (!m.seriesId) return;
                    bySeries.set(m.seriesId, [...(bySeries.get(m.seriesId) || []), m]);
                });

                set((store) => {
                    const known = new Set(store.series.map(s => s.id));
                    const recreated: Series[] = [];

                    bySeries.forEach((matches, id) => {
                        if (known.has(id)) return;
                        const byTime = [...matches].sort((a, b) => (a.completedAt || '').localeCompare(b.completedAt || ''));
                        recreated.push({
                            id,
                            teamA: byTime[0].teamA,
                            teamB: byTime[0].teamB,
                            createdAt: byTime[0].completedAt || new Date().toISOString(),
                            endedAt: byTime[byTime.length - 1].completedAt, // Restored series are not resumed
                        });
                    });

                    const kept = store.series.filter(s =>
                        bySeries.has(s.id) || s.id === store.activeSeriesId || hasMatchInProgress(s.id)
                    );
                    const series = [...kept, ...recreated];

                    return {
                        series,
                        activeSeriesId: series.some(s => s.id === store.activeSeriesId) ? store.activeSeriesId : undefined,
                    };
                });
            },
        }),
        {
            name: 'series-storage',
            storage: createJSONStorage(() => AsyncStorage),
            partialize: (state) => ({
                series: state.series,
                activeSeriesId: state.activeSeriesId,
            }),
        }
    )
);

export const getActiveSeries = (store: Pick<SeriesStore, 'series' | 'activeSeriesId'>): Series | undefined =>
    store.series.find(s => s.id === store.activeSeriesId && !s.endedAt);
