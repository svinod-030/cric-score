import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import { Alert } from 'react-native';
import SeriesSummaryScreen from '../screens/SeriesSummaryScreen';
import { useMatchStore } from '../../../store/useMatchStore';
import { useSeriesStore } from '../useSeriesStore';
import { MatchState } from '../../../types/match';

jest.mock('react-native-view-shot', () => {
    const React = require('react');
    return { __esModule: true, default: React.forwardRef(({ children }: any, _ref: any) => children) };
});

jest.spyOn(Alert, 'alert');

const baseInnings = (battingTeam: string, key: 'teamA' | 'teamB', batting: any[], bowling: any[]) => ({
    battingTeam,
    battingTeamKey: key,
    totalRuns: batting.reduce((sum, b) => sum + b.runs, 0),
    totalWickets: 0,
    overs: [],
    currentOver: [],
    strikerId: '',
    nonStrikerId: '',
    currentBowlerId: null,
    battingStats: Object.fromEntries(batting.map(b => [b.playerId, b])),
    bowlingStats: Object.fromEntries(bowling.map(b => [b.playerId, b])),
    fallOfWickets: [],
});

const bat = (playerId: string, runs: number, ballsFaced: number) => ({
    playerId, runs, ballsFaced, fours: 0, sixes: 0, isOut: true, isRetired: false, battingOrder: 1,
});
const bowl = (playerId: string, wickets: number, runsConceded: number) => ({
    playerId, overs: 1, balls: 6, maidens: 0, runsConceded, wickets,
});

const match = (completedAt: string, winner: string, runsA: number, runsB: number): MatchState => ({
    ...useMatchStore.getState().state,
    teamA: 'LIONS',
    teamB: 'TIGERS',
    seriesId: 'S1',
    isPlaying: false,
    matchResult: { winner, reason: '' },
    completedAt,
    teamAPlayers: [{ id: 'A1', name: 'Asha' }],
    teamBPlayers: [{ id: 'B1', name: 'Bala' }],
    innings1: baseInnings('LIONS', 'teamA', [bat('A1', runsA, 20)], [bowl('A1', 0, 0)]),
    innings2: baseInnings('TIGERS', 'teamB', [bat('B1', runsB, 20)], [bowl('B1', 2, 10)]),
});

describe('SeriesSummaryScreen', () => {
    const navigation = { navigate: jest.fn(), goBack: jest.fn() };
    const route = { params: { seriesId: 'S1' } };
    const older = match('2026-03-01T10:00:00.000Z', 'LIONS', 60, 40);
    const newer = match('2026-03-02T10:00:00.000Z', 'TIGERS', 30, 50);

    beforeEach(() => {
        jest.clearAllMocks();
        act(() => {
            useMatchStore.getState().resetMatch();
            useMatchStore.setState({ history: [newer, older] });
            useSeriesStore.setState({
                series: [{ id: 'S1', teamA: 'LIONS', teamB: 'TIGERS', createdAt: older.completedAt! }],
                activeSeriesId: 'S1',
            });
        });
    });

    test('shows the tally, then the awards, then the matches', () => {
        const { getByText, getAllByText, toJSON } = render(<SeriesSummaryScreen navigation={navigation} route={route} />);

        expect(getByText('1 - 1')).toBeTruthy();
        expect(getByText('Player of the Series')).toBeTruthy();
        expect(getByText('Best Batsman')).toBeTruthy();
        expect(getByText('Best Bowler')).toBeTruthy();
        expect(getAllByText(/^Match [12]$/)).toHaveLength(2);

        // Awards come before the match list
        const text = JSON.stringify(toJSON());
        expect(text.indexOf('Player of the Series')).toBeLessThan(text.indexOf('Match 2'));
    });

    test('lists matches newest first and opens a match on press', () => {
        const { getAllByText } = render(<SeriesSummaryScreen navigation={navigation} route={route} />);

        const labels = getAllByText(/^Match [12]$/).map(n => n.props.children);
        expect(labels).toEqual(['Match 2', 'Match 1']);

        fireEvent.press(getAllByText(/^Match [12]$/)[0]);
        expect(navigation.navigate).toHaveBeenCalledWith('MatchResult', { matchData: newer });
    });

    test('matches have no delete action of their own', () => {
        const { UNSAFE_queryAllByProps } = render(<SeriesSummaryScreen navigation={navigation} route={route} />);

        // The only trash icon is the one on Delete Series
        expect(UNSAFE_queryAllByProps({ name: 'trash-outline' })).toHaveLength(1);
    });

    test('ending an active series asks for confirmation then ends it', () => {
        const { getByText } = render(<SeriesSummaryScreen navigation={navigation} route={route} />);

        fireEvent.press(getByText('End Series'));
        (Alert.alert as jest.Mock).mock.calls[0][2].find((b: any) => b.text === 'End Series').onPress();

        expect(useSeriesStore.getState().series[0].endedAt).toBeDefined();
    });

    test('an ended series has no End Series button', () => {
        act(() => useSeriesStore.setState({
            series: [{ id: 'S1', teamA: 'LIONS', teamB: 'TIGERS', createdAt: older.completedAt!, endedAt: newer.completedAt }],
            activeSeriesId: undefined,
        }));

        const { queryByText, getByText } = render(<SeriesSummaryScreen navigation={navigation} route={route} />);

        expect(queryByText('End Series')).toBeNull();
        expect(getByText(/Ended/)).toBeTruthy();
    });

    test('deleting the series removes all its matches and goes back', () => {
        const { getByText } = render(<SeriesSummaryScreen navigation={navigation} route={route} />);

        fireEvent.press(getByText('Delete Series'));
        act(() => {
            (Alert.alert as jest.Mock).mock.calls[0][2].find((b: any) => b.text === 'Delete').onPress();
        });

        expect(useMatchStore.getState().history).toHaveLength(0);
        expect(useSeriesStore.getState().series).toHaveLength(0);
        expect(navigation.goBack).toHaveBeenCalled();
    });

    test('deleting is refused while a match of the series is in progress', () => {
        act(() => useMatchStore.setState((s) => ({ state: { ...s.state, isPlaying: true, seriesId: 'S1' } })));

        const { getByText } = render(<SeriesSummaryScreen navigation={navigation} route={route} />);

        fireEvent.press(getByText('Delete Series'));
        act(() => {
            (Alert.alert as jest.Mock).mock.calls[0][2].find((b: any) => b.text === 'Delete').onPress();
        });

        expect(Alert.alert).toHaveBeenLastCalledWith('Delete Series', 'Finish or clear the match in progress before deleting this series.');
        expect(useMatchStore.getState().history).toHaveLength(2);
        expect(navigation.goBack).not.toHaveBeenCalled();
    });

    test('falls back to the matches when the series record is missing', () => {
        act(() => useSeriesStore.setState({ series: [], activeSeriesId: undefined }));

        const { getByText, queryByText } = render(<SeriesSummaryScreen navigation={navigation} route={route} />);

        expect(getByText('1 - 1')).toBeTruthy();
        expect(queryByText('End Series')).toBeNull();
    });

    test('shows a message for an unknown series', () => {
        const { getByText } = render(<SeriesSummaryScreen navigation={navigation} route={{ params: { seriesId: 'NOPE' } }} />);

        expect(getByText('Series not found')).toBeTruthy();
    });
});
