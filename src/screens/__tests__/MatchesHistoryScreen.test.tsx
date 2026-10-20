import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import MatchesHistoryScreen from '../MatchesHistoryScreen';
import { useMatchStore } from '../../store/useMatchStore';
import { useAuthStore } from '../../store/useAuthStore';
import { restoreFromDrive } from '../../utils/backupService';
import { useSeriesStore } from '../../features/series/useSeriesStore';

// Mock dependencies
jest.mock('../../store/useMatchStore');
jest.mock('../../store/useAuthStore');
jest.mock('../../utils/backupService');
jest.mock('@react-navigation/native', () => ({
    useNavigation: () => ({
        navigate: jest.fn(),
    }),
}));

// Mock Alert
jest.spyOn(Alert, 'alert');

describe('MatchesHistoryScreen', () => {
    const mockNavigate = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();

        jest.spyOn(require('@react-navigation/native'), 'useNavigation').mockReturnValue({
            navigate: mockNavigate,
        });
    });

    describe('when no matches exist', () => {
        beforeEach(() => {
            (useMatchStore as unknown as jest.Mock).mockReturnValue({
                state: { isPlaying: false },
                history: [],
                restoreMatches: jest.fn(),
            });
            (useAuthStore as unknown as jest.Mock).mockReturnValue({
                isAuthenticated: false,
            });
        });

        test('renders without crashing', () => {
            const { getByText } = render(<MatchesHistoryScreen />);
            expect(getByText('Matches')).toBeTruthy();
        });

        test('displays empty state message', () => {
            const { getByText } = render(<MatchesHistoryScreen />);
            expect(getByText('No completed matches yet.')).toBeTruthy();
        });

        test('does not show restore button when not authenticated', () => {
            const { queryByText } = render(<MatchesHistoryScreen />);
            expect(queryByText('Restore')).toBeNull();
        });
    });

    describe('when user is authenticated', () => {
        beforeEach(() => {
            (useMatchStore as unknown as jest.Mock).mockReturnValue({
                state: { isPlaying: false },
                history: [],
                restoreMatches: jest.fn(),
            });
            (useAuthStore as unknown as jest.Mock).mockReturnValue({
                isAuthenticated: true,
            });
        });

        test('displays restore button', () => {
            const { getByText } = render(<MatchesHistoryScreen />);
            expect(getByText('Restore')).toBeTruthy();
        });

        test('shows confirmation dialog on restore button press', () => {
            const { getByText } = render(<MatchesHistoryScreen />);

            fireEvent.press(getByText('Restore'));

            expect(Alert.alert).toHaveBeenCalledWith(
                'Restore Matches',
                expect.stringContaining('merge your cloud backup'),
                expect.arrayContaining([
                    expect.objectContaining({ text: 'Cancel' }),
                    expect.objectContaining({ text: 'Restore' }),
                ])
            );
        });

        test('restores matches successfully', async () => {
            const mockRestoreMatches = jest.fn();
            const mockBackupData = JSON.stringify({ matches: [] });

            (useMatchStore as unknown as jest.Mock).mockReturnValue({
                state: { isPlaying: false },
                history: [],
                restoreMatches: mockRestoreMatches,
            });
            (restoreFromDrive as jest.Mock).mockResolvedValue(mockBackupData);

            const { getByText } = render(<MatchesHistoryScreen />);

            fireEvent.press(getByText('Restore'));

            // Get the alert and trigger restore
            const alertCall = (Alert.alert as jest.Mock).mock.calls[0];
            const restoreButton = alertCall[2].find((btn: any) => btn.text === 'Restore');

            await restoreButton.onPress();

            await waitFor(() => {
                expect(restoreFromDrive).toHaveBeenCalled();
                expect(mockRestoreMatches).toHaveBeenCalledWith(mockBackupData);
                expect(Alert.alert).toHaveBeenCalledWith('Success', 'Matches restored successfully!');
            });
        });

        test('handles restore failure when no backup found', async () => {
            (restoreFromDrive as jest.Mock).mockResolvedValue(null);

            const { getByText } = render(<MatchesHistoryScreen />);

            fireEvent.press(getByText('Restore'));

            const alertCall = (Alert.alert as jest.Mock).mock.calls[0];
            const restoreButton = alertCall[2].find((btn: any) => btn.text === 'Restore');

            await restoreButton.onPress();

            await waitFor(() => {
                expect(Alert.alert).toHaveBeenCalledWith('Not Found', 'No backup file found on Google Drive.');
            });
        });

        test('handles restore error', async () => {
            (restoreFromDrive as jest.Mock).mockRejectedValue(new Error('Network error'));

            const { getByText } = render(<MatchesHistoryScreen />);

            fireEvent.press(getByText('Restore'));

            const alertCall = (Alert.alert as jest.Mock).mock.calls[0];
            const restoreButton = alertCall[2].find((btn: any) => btn.text === 'Restore');

            await restoreButton.onPress();

            await waitFor(() => {
                expect(Alert.alert).toHaveBeenCalledWith('Error', 'Failed to restore matches. Please try again.');
            });
        });
    });

    describe('when match history exists', () => {
        const mockHistory = [
            {
                teamA: 'India',
                teamB: 'Australia',
                matchResult: {
                    winner: 'India',
                    reason: 'Won by 30 runs',
                },
                completedAt: '2026-01-22T10:00:00Z',
            },
            {
                teamA: 'England',
                teamB: 'Pakistan',
                matchResult: {
                    winner: 'Draw',
                    reason: 'Scores are tied',
                },
                completedAt: '2026-01-21T15:30:00Z',
            },
        ];

        beforeEach(() => {
            (useMatchStore as unknown as jest.Mock).mockReturnValue({
                state: { isPlaying: false },
                history: mockHistory,
                restoreMatches: jest.fn(),
            });
            (useAuthStore as unknown as jest.Mock).mockReturnValue({
                isAuthenticated: false,
            });
        });

        test('displays match history', () => {
            const { getByText } = render(<MatchesHistoryScreen />);

            expect(getByText('India')).toBeTruthy();
            expect(getByText('Australia')).toBeTruthy();
            expect(getByText('India Won by 30 runs')).toBeTruthy();
            expect(getByText('England')).toBeTruthy();
            expect(getByText('Pakistan')).toBeTruthy();
            expect(getByText('Match Drawn')).toBeTruthy();
        });

        test('navigates to match result on match item press', () => {
            const { getByText } = render(<MatchesHistoryScreen />);

            fireEvent.press(getByText('India Won by 30 runs'));

            expect(mockNavigate).toHaveBeenCalledWith('MatchResult', {
                matchData: mockHistory[0],
            });
        });
    });

    describe('when match is in progress', () => {
        const mockActiveMatch = {
            isPlaying: true,
            teamA: 'India',
            teamB: 'Australia',
            currentInnings: 1,
            innings1: {
                battingTeam: 'India',
                totalRuns: 50,
                totalWickets: 2,
                overs: [{ balls: [] }],
                currentOver: [{ isValidBall: true }, { isValidBall: true }],
            },
            innings2: {
                battingTeam: 'Australia',
                totalRuns: 0,
                totalWickets: 0,
                overs: [],
                currentOver: [],
            },
        };

        beforeEach(() => {
            (useMatchStore as unknown as jest.Mock).mockReturnValue({
                state: mockActiveMatch,
                history: [],
                restoreMatches: jest.fn(),
            });
            (useAuthStore as unknown as jest.Mock).mockReturnValue({
                isAuthenticated: false,
            });
        });

        test.skip('displays live match section', () => {
            const { getByText } = render(<MatchesHistoryScreen />);

            expect(getByText('Live Now')).toBeTruthy();
            expect(getByText('India')).toBeTruthy();
            expect(getByText('Australia')).toBeTruthy();
        });

        test('shows current score', () => {
            const { getByText } = render(<MatchesHistoryScreen />);

            expect(getByText(/50\/2/)).toBeTruthy();
        });

        test('navigates to scoreboard on resume button press', () => {
            const { getByText } = render(<MatchesHistoryScreen />);

            fireEvent.press(getByText('Resume Match'));

            expect(mockNavigate).toHaveBeenCalledWith('Scoreboard');
        });

        test('displays innings badge', () => {
            const { getByText } = render(<MatchesHistoryScreen />);

            expect(getByText('Innings 1')).toBeTruthy();
        });
    });
    describe('series in history', () => {
        const match = (overrides: any) => ({
            teamA: 'LIONS',
            teamB: 'TIGERS',
            matchResult: { winner: 'LIONS', reason: 'Won by 10 runs', resultType: 'runs', margin: 10 },
            ...overrides,
        });

        const seriesMatch1 = match({ seriesId: 'S1', completedAt: '2026-02-01T10:00:00Z' });
        const seriesMatch2 = match({
            seriesId: 'S1',
            completedAt: '2026-02-02T10:00:00Z',
            matchResult: { winner: 'TIGERS', reason: 'Won by 5 runs', resultType: 'runs', margin: 5 },
        });
        const lonelySeriesMatch = match({ seriesId: 'S2', teamA: 'KINGS', teamB: 'QUEENS', matchResult: { winner: 'Draw', reason: 'Tied' }, completedAt: '2026-02-03T10:00:00Z' });
        const individual = match({ teamA: 'INDIA', teamB: 'AUSTRALIA', completedAt: '2026-02-04T10:00:00Z', matchResult: { winner: 'INDIA', reason: 'Won by 1 run', resultType: 'runs', margin: 1 } });
        const mockDeleteMatch = jest.fn();
        const mockDeleteSeries = jest.fn(() => ({ ok: true }));

        beforeEach(() => {
            (useMatchStore as unknown as jest.Mock).mockReturnValue({
                state: { isPlaying: false },
                history: [individual, lonelySeriesMatch, seriesMatch2, seriesMatch1],
                restoreMatches: jest.fn(),
                deleteMatch: mockDeleteMatch,
            });
            (useAuthStore as unknown as jest.Mock).mockReturnValue({ isAuthenticated: false });
            useSeriesStore.setState({
                series: [
                    { id: 'S1', teamA: 'LIONS', teamB: 'TIGERS', createdAt: '2026-02-01T10:00:00Z', endedAt: '2026-02-02T10:00:00Z' },
                    { id: 'S2', teamA: 'KINGS', teamB: 'QUEENS', createdAt: '2026-02-03T10:00:00Z' },
                ],
                activeSeriesId: 'S2',
                deleteSeries: mockDeleteSeries,
            });
        });

        test('shows a series with several matches as one card with its tally', () => {
            const { getByText, getAllByText } = render(<MatchesHistoryScreen />);

            expect(getByText('Series · 2 matches')).toBeTruthy();
            // Two matches of the series, but only one card for the two teams
            expect(getAllByText('LIONS')).toHaveLength(1);
            expect(getAllByText('TIGERS')).toHaveLength(1);
        });

        test('opens the series summary when a series card is pressed', () => {
            const { getByText } = render(<MatchesHistoryScreen />);

            fireEvent.press(getByText('Series · 2 matches'));

            expect(mockNavigate).toHaveBeenCalledWith('SeriesSummary', { seriesId: 'S1' });
        });

        test('a series with a single match opens that match directly and shows a Series chip', () => {
            const { getByText } = render(<MatchesHistoryScreen />);

            expect(getByText('Series · Live')).toBeTruthy();

            fireEvent.press(getByText('KINGS'));

            expect(mockNavigate).toHaveBeenCalledWith('MatchResult', { matchData: lonelySeriesMatch });
        });

        test('an individual match still opens its match directly', () => {
            const { getByText } = render(<MatchesHistoryScreen />);

            fireEvent.press(getByText('INDIA'));

            expect(mockNavigate).toHaveBeenCalledWith('MatchResult', { matchData: individual });
        });

        test('an individual match is deleted on its own', () => {
            const { UNSAFE_getAllByProps } = render(<MatchesHistoryScreen />);

            // Newest group first: the individual match is the first row
            fireEvent.press(UNSAFE_getAllByProps({ name: 'trash-outline' })[0]);
            const buttons = (Alert.alert as jest.Mock).mock.calls[0][2];
            buttons.find((b: any) => b.text === 'Delete').onPress();

            expect(Alert.alert).toHaveBeenCalledWith('Delete Match', expect.any(String), expect.any(Array));
            expect(mockDeleteMatch).toHaveBeenCalledWith(individual.completedAt);
            expect(mockDeleteSeries).not.toHaveBeenCalled();
        });

        test('a series match can only be deleted together with its series', () => {
            const { UNSAFE_getAllByProps } = render(<MatchesHistoryScreen />);

            // Rows: individual, single-match series S2, series card S1
            fireEvent.press(UNSAFE_getAllByProps({ name: 'trash-outline' })[1]);
            expect((Alert.alert as jest.Mock).mock.calls[0][0]).toBe('Delete Series');
            (Alert.alert as jest.Mock).mock.calls[0][2].find((b: any) => b.text === 'Delete').onPress();

            expect(mockDeleteSeries).toHaveBeenCalledWith('S2');
            expect(mockDeleteMatch).not.toHaveBeenCalled();
        });

        test('deleting a series card removes the whole series', () => {
            const { UNSAFE_getAllByProps } = render(<MatchesHistoryScreen />);

            fireEvent.press(UNSAFE_getAllByProps({ name: 'trash-outline' })[2]);
            (Alert.alert as jest.Mock).mock.calls[0][2].find((b: any) => b.text === 'Delete').onPress();

            expect(mockDeleteSeries).toHaveBeenCalledWith('S1');
        });

        test('explains why a series cannot be deleted while one of its matches is in progress', () => {
            mockDeleteSeries.mockReturnValueOnce({ ok: false });
            const { UNSAFE_getAllByProps } = render(<MatchesHistoryScreen />);

            fireEvent.press(UNSAFE_getAllByProps({ name: 'trash-outline' })[2]);
            (Alert.alert as jest.Mock).mock.calls[0][2].find((b: any) => b.text === 'Delete').onPress();

            expect(Alert.alert).toHaveBeenLastCalledWith('Delete Series', 'Finish or clear the match in progress before deleting this series.');
        });
    });
});
