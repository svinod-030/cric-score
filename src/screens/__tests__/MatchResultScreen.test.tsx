import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Linking, Platform } from 'react-native';
import MatchResultScreen from '../MatchResultScreen';
import { useMatchStore } from '../../store/useMatchStore';

// Mock dependencies
jest.mock('../../store/useMatchStore');
jest.mock('../../components/ScorecardSection', () => ({
    ScorecardSection: () => null,
}));
jest.mock('../../components/OverSummarySection', () => ({
    OverSummarySection: () => null,
}));

// Mock Linking
jest.spyOn(Linking, 'openURL').mockImplementation(() => Promise.resolve(true));

describe('MatchResultScreen', () => {
    const mockNavigation = {
        navigate: jest.fn(),
        goBack: jest.fn(),
        reset: jest.fn(),
    };

    const mockRoute = {
        params: {},
    };

    const mockMatchState = {
        teamA: 'India',
        teamB: 'Australia',
        teamAPlayers: [
            { id: 'p1', name: 'Player 1' },
            { id: 'p2', name: 'Player 2' },
        ],
        teamBPlayers: [
            { id: 'p3', name: 'Player 3' },
            { id: 'p4', name: 'Player 4' },
        ],
        matchResult: {
            winner: 'India',
            reason: 'Won by 30 runs',
        },
        innings1: {
            battingTeam: 'India',
            battingTeamKey: 'teamA',
            totalRuns: 150,
            totalWickets: 5,
            overs: [],
            currentOver: [],
            strikerId: 'p1',
            nonStrikerId: 'p2',
            currentBowlerId: 'p3',
            battingStats: {},
            bowlingStats: {},
            fallOfWickets: [],
        },
        innings2: {
            battingTeam: 'Australia',
            battingTeamKey: 'teamB',
            totalRuns: 120,
            totalWickets: 10,
            overs: [],
            currentOver: [],
            strikerId: 'p3',
            nonStrikerId: 'p4',
            currentBowlerId: 'p1',
            battingStats: {},
            bowlingStats: {},
            fallOfWickets: [],
        },
    };

    const mockResetMatch = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();

        (useMatchStore as unknown as jest.Mock).mockReturnValue({
            state: mockMatchState,
            resetMatch: mockResetMatch,
        });
    });

    describe('when match result exists', () => {
        test('renders match result correctly', () => {
            const { getByText } = render(
                <MatchResultScreen navigation={mockNavigation} route={mockRoute} />
            );

            expect(getByText('India Wins!')).toBeTruthy();
            expect(getByText('Won by 30 runs')).toBeTruthy();
        });

        test('displays draw result correctly', () => {
            const drawState = {
                ...mockMatchState,
                matchResult: {
                    winner: 'Draw',
                    reason: 'Scores are tied',
                },
            };

            (useMatchStore as unknown as jest.Mock).mockReturnValue({
                state: drawState,
                resetMatch: mockResetMatch,
            });

            const { getByText } = render(
                <MatchResultScreen navigation={mockNavigation} route={mockRoute} />
            );

            expect(getByText('Match Drawn')).toBeTruthy();
            expect(getByText('Scores are tied')).toBeTruthy();
        });

        test('displays Rate App button', () => {
            const { getByText } = render(
                <MatchResultScreen navigation={mockNavigation} route={mockRoute} />
            );

            expect(getByText('Rate App')).toBeTruthy();
        });

        test('displays Start New Match button when not in history view', () => {
            const { getByText } = render(
                <MatchResultScreen navigation={mockNavigation} route={mockRoute} />
            );

            expect(getByText('Start New Match')).toBeTruthy();
        });

        test('does not display Start New Match button in history view', () => {
            const historyRoute = {
                params: {
                    matchData: mockMatchState,
                },
            };

            const { queryByText } = render(
                <MatchResultScreen navigation={mockNavigation} route={historyRoute} />
            );

            expect(queryByText('Start New Match')).toBeNull();
        });

        test('opens Android store URL when Rate App pressed on Android', () => {
            Platform.OS = 'android';

            const { getByText } = render(
                <MatchResultScreen navigation={mockNavigation} route={mockRoute} />
            );

            fireEvent.press(getByText('Rate App'));

            expect(Linking.openURL).toHaveBeenCalledWith(
                expect.stringContaining('market://details?id=')
            );
        });

        test('opens iOS store URL when Rate App pressed on iOS', () => {
            Platform.OS = 'ios';

            const { getByText } = render(
                <MatchResultScreen navigation={mockNavigation} route={mockRoute} />
            );

            fireEvent.press(getByText('Rate App'));

            expect(Linking.openURL).toHaveBeenCalledWith(
                expect.stringContaining('itms-apps://')
            );
        });

        test('resets match and navigation on Start New Match button press', () => {
            const { getByText } = render(
                <MatchResultScreen navigation={mockNavigation} route={mockRoute} />
            );

            fireEvent.press(getByText('Start New Match'));

            expect(mockResetMatch).toHaveBeenCalled();
            expect(mockNavigation.reset).toHaveBeenCalledWith({
                index: 0,
                routes: [{ name: 'HomeTabs' }],
            });
        });
    });

    describe('when match result is null', () => {
        beforeEach(() => {
            (useMatchStore as unknown as jest.Mock).mockReturnValue({
                state: {
                    ...mockMatchState,
                    matchResult: null,
                },
                resetMatch: mockResetMatch,
            });
        });

        test('renders no result message', () => {
            const { getByText } = render(
                <MatchResultScreen navigation={mockNavigation} route={mockRoute} />
            );

            expect(getByText('No Result Yet')).toBeTruthy();
        });

        test('displays go back button', () => {
            const { getByText } = render(
                <MatchResultScreen navigation={mockNavigation} route={mockRoute} />
            );

            expect(getByText('Go Back')).toBeTruthy();
        });

        test('navigates back on Go Back button press', () => {
            const { getByText } = render(
                <MatchResultScreen navigation={mockNavigation} route={mockRoute} />
            );

            fireEvent.press(getByText('Go Back'));

            expect(mockNavigation.goBack).toHaveBeenCalled();
        });
    });

    describe('history view with passed match data', () => {
        test('uses passed match data from route params', () => {
            const customMatchData = {
                ...mockMatchState,
                matchResult: {
                    winner: 'Australia',
                    reason: 'Won by 5 wickets',
                },
            };

            const historyRoute = {
                params: {
                    matchData: customMatchData,
                },
            };

            const { getByText } = render(
                <MatchResultScreen navigation={mockNavigation} route={historyRoute} />
            );

            expect(getByText('Australia Wins!')).toBeTruthy();
            expect(getByText('Won by 5 wickets')).toBeTruthy();
        });
    });

    describe('innings display logic', () => {
        test('shows 2nd innings when it has data', () => {
            const { getByText } = render(
                <MatchResultScreen navigation={mockNavigation} route={mockRoute} />
            );

            // Match result section should show
            expect(getByText('Match Result')).toBeTruthy();
        });

        test('does not crash when innings2 has no data', () => {
            const stateWithNoInnings2 = {
                ...mockMatchState,
                innings2: {
                    ...mockMatchState.innings2,
                    totalRuns: 0,
                    overs: [],
                    currentOver: [],
                },
            };

            (useMatchStore as unknown as jest.Mock).mockReturnValue({
                state: stateWithNoInnings2,
                resetMatch: mockResetMatch,
            });

            const { getByText } = render(
                <MatchResultScreen navigation={mockNavigation} route={mockRoute} />
            );

            // Should still render the screen
            expect(getByText('India Wins!')).toBeTruthy();
        });
    });
});
