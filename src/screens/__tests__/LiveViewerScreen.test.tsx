import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import LiveViewerScreen from '../LiveViewerScreen';
import { matchSyncService } from '../../services/matchSyncService';
import { MatchState } from '../../types/match';

jest.mock('../../services/matchSyncService', () => ({
    matchSyncService: { subscribeToMatch: jest.fn() },
}));
jest.mock('../../components/OverSummarySection', () => ({ OverSummarySection: () => null }));

const batter = (playerId: string, runs: number, ballsFaced: number, battingOrder: number) => ({
    playerId, runs, ballsFaced, fours: 0, sixes: 0, isOut: false, isRetired: false, battingOrder,
});

// LIONS (A1, A2) bat first against TIGERS (B1, B2). One ball bowled so far.
const liveMatch = (battingKey: 'teamA' | 'teamB'): MatchState => {
    const lions = battingKey === 'teamA';
    const [strikerId, nonStrikerId, bowlerId] = lions ? ['A1', 'A2', 'B1'] : ['B1', 'B2', 'A1'];
    const innings = {
        battingTeam: lions ? 'LIONS' : 'TIGERS',
        battingTeamKey: battingKey,
        totalRuns: 1,
        totalWickets: 0,
        overs: [],
        currentOver: [{
            runs: 1, extraType: 'none', isWicket: false, wicketType: 'none', isValidBall: true,
            batsmanId: strikerId, bowlerId,
        }],
        strikerId,
        nonStrikerId,
        currentBowlerId: bowlerId,
        battingStats: {
            [strikerId]: batter(strikerId, 1, 1, 1),
            [nonStrikerId]: batter(nonStrikerId, 0, 0, 2),
        },
        bowlingStats: {
            [bowlerId]: { playerId: bowlerId, overs: 0, balls: 1, maidens: 0, runsConceded: 1, wickets: 0 },
        },
        fallOfWickets: [],
    };
    return {
        teamA: 'LIONS', teamB: 'TIGERS', overs: 5, playersPerTeam: 2,
        runsForWide: 1, runsForNoBall: 1, reballForWide: true, reballForNoBall: true,
        isPlaying: true,
        matchResult: null,
        currentInnings: 1,
        teamAPlayers: [{ id: 'A1', name: 'Asha' }, { id: 'A2', name: 'Anil' }],
        teamBPlayers: [{ id: 'B1', name: 'Bala' }, { id: 'B2', name: 'Bina' }],
        innings1: innings as any,
        innings2: { ...innings, battingStats: {}, bowlingStats: {}, currentOver: [], totalRuns: 0 } as any,
        isInningsBreak: false,
    };
};

describe('LiveViewerScreen', () => {
    const navigation = { setOptions: jest.fn() };
    const route = { params: { matchId: 'ABC123' } };

    const renderWith = (match: MatchState) => {
        (matchSyncService.subscribeToMatch as jest.Mock).mockImplementation((_id: string, onUpdate: (m: MatchState) => void) => {
            onUpdate(match);
            return jest.fn();
        });
        return render(<LiveViewerScreen navigation={navigation} route={route} />);
    };

    beforeEach(() => jest.clearAllMocks());

    test('lists the current bowler in the bowlers table of the live scorecard', async () => {
        const { getAllByText } = renderWith(liveMatch('teamA'));

        // Once in the Bowler bar and once in the bowling table
        await waitFor(() => expect(getAllByText('Bala')).toHaveLength(2));
    });

    test('lists the bowler from the other team when the second team is batting', async () => {
        const { getAllByText } = renderWith(liveMatch('teamB'));

        await waitFor(() => expect(getAllByText('Asha')).toHaveLength(2));
    });

    test('lists the batters in the batting table', async () => {
        const { getAllByText } = renderWith(liveMatch('teamA'));

        await waitFor(() => {
            expect(getAllByText('Asha*')).toHaveLength(1); // striker in the stats bar
            expect(getAllByText('Asha')).toHaveLength(1); // and in the batting table
            expect(getAllByText('Anil')).toHaveLength(2); // non-striker: stats bar + table
        });
    });
});
