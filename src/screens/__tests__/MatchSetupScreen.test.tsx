import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import MatchSetupScreen from '../MatchSetupScreen';
import { useMatchStore } from '../../store/useMatchStore';
import { Alert } from 'react-native';

// Mock dependencies
jest.mock('../../store/useMatchStore');
jest.mock('react-native-keyboard-aware-scroll-view', () => ({
    KeyboardAwareScrollView: ({ children }: any) => children,
}));

// Mock Alert
jest.spyOn(Alert, 'alert');

describe('MatchSetupScreen', () => {
    const mockSetConfig = jest.fn();
    const mockStartMatch = jest.fn();
    const mockLoadTeamRoster = jest.fn();
    const mockNavigation = {
        navigate: jest.fn(),
    };

    beforeEach(() => {
        jest.clearAllMocks();

        (useMatchStore as unknown as jest.Mock).mockReturnValue({
            config: {
                teamA: 'Team A',
                teamB: 'Team B',
                overs: 5,
                playersPerTeam: 11,
                runsForWide: 1,
                runsForNoBall: 1,
                reballForWide: true,
                reballForNoBall: true,
                isCustomNamesEnabled: false,
                savedTeams: {},
            },
            setConfig: mockSetConfig,
            startMatch: mockStartMatch,
            loadTeamRoster: mockLoadTeamRoster,
        });
    });

    test('renders without crashing', () => {
        const { getByText } = render(<MatchSetupScreen navigation={mockNavigation} />);
        expect(getByText('New Match')).toBeTruthy();
    });

    test('displays team name inputs', () => {
        const { getAllByPlaceholderText } = render(<MatchSetupScreen navigation={mockNavigation} />);
        expect(getAllByPlaceholderText('Team A')).toBeTruthy();
        expect(getAllByPlaceholderText('Team B')).toBeTruthy();
    });

    test('displays match settings section', () => {
        const { getByText } = render(<MatchSetupScreen navigation={mockNavigation} />);
        expect(getByText('Match Settings')).toBeTruthy();
    });

    test('updates team A name on input change', () => {
        const { getAllByPlaceholderText } = render(<MatchSetupScreen navigation={mockNavigation} />);
        const teamAInput = getAllByPlaceholderText('Team A')[0];
        fireEvent.changeText(teamAInput, 'India');
        expect(mockSetConfig).toHaveBeenCalledWith({ teamA: 'INDIA' });
    });

    test('updates team B name on input change', () => {
        const { getAllByPlaceholderText } = render(<MatchSetupScreen navigation={mockNavigation} />);
        const teamBInput = getAllByPlaceholderText('Team B')[0];
        fireEvent.changeText(teamBInput, 'Australia');
        expect(mockSetConfig).toHaveBeenCalledWith({ teamB: 'AUSTRALIA' });
    });

    test('calls startMatch and navigates when start button is pressed', () => {
        (useMatchStore as unknown as jest.Mock).mockReturnValue({
            config: {
                teamA: 'India',
                teamB: 'Australia',
                overs: 5,
                playersPerTeam: 11,
                runsForWide: 1,
                runsForNoBall: 1,
                reballForWide: true,
                reballForNoBall: true,
                tossWinner: 'teamA',
                tossDecision: 'bat',
            },
            setConfig: mockSetConfig,
            startMatch: mockStartMatch,
            loadTeamRoster: mockLoadTeamRoster,
        });

        const { getByText } = render(<MatchSetupScreen navigation={mockNavigation} />);

        fireEvent.press(getByText('Start Match'));

        expect(mockStartMatch).toHaveBeenCalled();
        expect(mockNavigation.navigate).toHaveBeenCalledWith('Scoreboard');
    });

    test('start match button is disabled if toss is incomplete', () => {
        (useMatchStore as unknown as jest.Mock).mockReturnValue({
            config: {
                teamA: 'India',
                teamB: 'Australia',
                overs: 5,
                playersPerTeam: 11,
                // No toss winner or decision
            },
            setConfig: mockSetConfig,
            startMatch: mockStartMatch,
            loadTeamRoster: mockLoadTeamRoster,
        });

        const { getByText } = render(<MatchSetupScreen navigation={mockNavigation} />);

        const startButton = getByText('Start Match');
        // Pressing it should do nothing
        fireEvent.press(startButton);

        expect(mockStartMatch).not.toHaveBeenCalled();
        // Since button is disabled, the onPress handler is not called, so Alert is not shown
        expect(Alert.alert).not.toHaveBeenCalled();
    });
});
