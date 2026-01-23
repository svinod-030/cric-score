import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import MatchesHistoryScreen from '../MatchesHistoryScreen';
import { useMatchStore } from '../../store/useMatchStore';
import { useAuthStore } from '../../store/useAuthStore';
import { restoreFromDrive } from '../../utils/backupService';

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

            expect(getByText('India vs Australia')).toBeTruthy();
            expect(getByText('India Won')).toBeTruthy();
            expect(getByText('England vs Pakistan')).toBeTruthy();
            expect(getByText('Match Drawn')).toBeTruthy();
        });

        test('navigates to match result on match item press', () => {
            const { getByText } = render(<MatchesHistoryScreen />);

            fireEvent.press(getByText('India vs Australia'));

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

        test('displays live match section', () => {
            const { getByText } = render(<MatchesHistoryScreen />);

            expect(getByText('Live Now')).toBeTruthy();
            expect(getByText('India vs Australia')).toBeTruthy();
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
});
