import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import { Alert } from 'react-native';
import MatchResultScreen from '../MatchResultScreen';
import { useMatchStore } from '../../store/useMatchStore';
import { useSeriesStore } from '../../features/series/useSeriesStore';
import { MatchState } from '../../types/match';

jest.mock('react-native-view-shot', () => {
    const React = require('react');
    return { __esModule: true, default: React.forwardRef(({ children }: any, _ref: any) => children) };
});
jest.mock('../../components/Confetti', () => ({ Confetti: () => null }));
jest.mock('../../components/ScorecardSection', () => ({ ScorecardSection: () => null }));
jest.mock('../../components/OverSummarySection', () => ({ OverSummarySection: () => null }));

jest.spyOn(Alert, 'alert');

const completedMatch = (seriesId?: string): MatchState => ({
    ...useMatchStore.getState().state,
    teamA: 'LIONS',
    teamB: 'TIGERS',
    seriesId,
    isPlaying: false,
    matchResult: { winner: 'LIONS', reason: 'Won by 10 runs', resultType: 'runs', margin: 10 },
    completedAt: '2026-04-01T10:00:00.000Z',
});

describe('MatchResultScreen with series', () => {
    const navigation = { navigate: jest.fn(), goBack: jest.fn(), reset: jest.fn(), replace: jest.fn() };

    beforeEach(() => {
        jest.clearAllMocks();
        act(() => {
            useMatchStore.getState().resetMatch();
            useMatchStore.setState({ history: [] });
            useSeriesStore.setState({ series: [], activeSeriesId: undefined });
        });
    });

    const setupSeries = (endedAt?: string) => {
        const match = completedMatch('S1');
        act(() => {
            useMatchStore.setState({ history: [match], state: match });
            useSeriesStore.setState({
                series: [{ id: 'S1', teamA: 'LIONS', teamB: 'TIGERS', createdAt: match.completedAt!, endedAt }],
                activeSeriesId: endedAt ? undefined : 'S1',
            });
        });
        return match;
    };

    test('a series match shows the series score and has no Delete Match button', () => {
        setupSeries();

        const { getByText, queryByText } = render(<MatchResultScreen navigation={navigation} route={{ params: {} }} />);

        expect(getByText('1 - 0')).toBeTruthy();
        expect(getByText('View Series')).toBeTruthy();
        expect(queryByText('Delete Match')).toBeNull();
    });

    test('also hides Delete Match when a series match is opened from history', () => {
        const match = setupSeries();

        const { queryByText } = render(
            <MatchResultScreen navigation={navigation} route={{ params: { matchData: match } }} />
        );

        expect(queryByText('Delete Match')).toBeNull();
    });

    test('offers Next Match in Series while the series is active', () => {
        setupSeries();

        const { getByText, queryByText } = render(<MatchResultScreen navigation={navigation} route={{ params: {} }} />);

        expect(getByText('Next Match in Series')).toBeTruthy();
        expect(queryByText('Start New Match')).toBeNull();

        fireEvent.press(getByText('Next Match in Series'));
        expect(navigation.reset).toHaveBeenCalledWith({ index: 0, routes: [{ name: 'HomeTabs' }] });
    });

    test('offers Start New Match once the series has ended, and no End Series', () => {
        setupSeries('2026-04-02T10:00:00.000Z');

        const { getByText, queryByText } = render(<MatchResultScreen navigation={navigation} route={{ params: {} }} />);

        expect(getByText('Start New Match')).toBeTruthy();
        expect(queryByText('End Series')).toBeNull();
    });

    test('View Series opens the series summary', () => {
        setupSeries();

        const { getByText } = render(<MatchResultScreen navigation={navigation} route={{ params: {} }} />);

        fireEvent.press(getByText('View Series'));

        expect(navigation.navigate).toHaveBeenCalledWith('SeriesSummary', { seriesId: 'S1' });
    });

    test('an individual match still shows Delete Match and no series card', () => {
        const match = completedMatch();
        act(() => useMatchStore.setState({ history: [match], state: match }));

        const { getByText, queryByText } = render(<MatchResultScreen navigation={navigation} route={{ params: {} }} />);

        expect(getByText('Delete Match')).toBeTruthy();
        expect(queryByText('View Series')).toBeNull();
        expect(getByText('Start New Match')).toBeTruthy();
    });
});
