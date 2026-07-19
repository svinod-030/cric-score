import { doc, setDoc, updateDoc } from 'firebase/firestore';
import { matchSyncService } from '../matchSyncService';
import { MatchState } from '../../types/match';

jest.mock('../../utils/firebase', () => ({ db: {} }));
jest.mock('firebase/firestore', () => ({
    collection: jest.fn(),
    doc: jest.fn(() => ({ id: 'mock-ref' })),
    setDoc: jest.fn().mockResolvedValue(undefined),
    updateDoc: jest.fn().mockResolvedValue(undefined),
    onSnapshot: jest.fn(),
    getDoc: jest.fn(),
    deleteDoc: jest.fn(),
}));

describe('matchSyncService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // Firestore state that can end up with a battingStats entry keyed by '' (e.g. a
    // "last man standing" innings where there is no non-striker). Firestore rejects
    // any document field named with an empty string, so the sync layer must strip it.
    const stateWithEmptyKey = {
        innings1: {
            battingStats: {
                p1: { playerId: 'p1', runs: 10 },
                '': { playerId: '', runs: 0 },
            },
            bowlingStats: {
                p4: { playerId: 'p4', runsConceded: 5 },
            },
        },
        innings2: {
            battingStats: {},
            bowlingStats: {},
        },
    } as unknown as MatchState;

    describe('createLiveMatch', () => {
        test('strips empty-string keys before writing to Firestore', async () => {
            await matchSyncService.createLiveMatch(stateWithEmptyKey);

            expect(setDoc).toHaveBeenCalledTimes(1);
            const written = (setDoc as jest.Mock).mock.calls[0][1];

            expect(written.innings1.battingStats['']).toBeUndefined();
            expect(written.innings1.battingStats.p1).toEqual({ playerId: 'p1', runs: 10 });
            expect(written.innings1.bowlingStats.p4).toEqual({ playerId: 'p4', runsConceded: 5 });
        });
    });

    describe('updateLiveMatch', () => {
        test('strips empty-string keys before writing to Firestore', async () => {
            await matchSyncService.updateLiveMatch('AHOH17', stateWithEmptyKey);

            expect(updateDoc).toHaveBeenCalledTimes(1);
            const written = (updateDoc as jest.Mock).mock.calls[0][1];

            expect(written.innings1.battingStats['']).toBeUndefined();
            expect(Object.keys(written.innings1.battingStats)).toEqual(['p1']);
        });

        test('does nothing when matchId is empty', async () => {
            await matchSyncService.updateLiveMatch('', stateWithEmptyKey);

            expect(doc).not.toHaveBeenCalled();
            expect(updateDoc).not.toHaveBeenCalled();
        });
    });
});
