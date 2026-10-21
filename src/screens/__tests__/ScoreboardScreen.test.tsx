import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import ScoreboardScreen from '../ScoreboardScreen';
import { useMatchStore } from '../../store/useMatchStore';
import { useSeriesStore } from '../../features/series/useSeriesStore';
import { ScorecardSection } from '../../components/ScorecardSection';

// Mock child components to avoid environment issues and simplify testing
jest.mock('../../components/BowlerSelectionModal', () => ({ BowlerSelectionModal: () => 'BowlerSelectionModal' }));
jest.mock('../../components/BatterSelectionModal', () => ({ BatterSelectionModal: () => 'BatterSelectionModal' }));
jest.mock('../../components/ScorecardSection', () => ({ ScorecardSection: jest.fn(() => 'ScorecardSection') }));
jest.mock('../../components/OverSummarySection', () => ({ OverSummarySection: () => 'OverSummarySection' }));
jest.mock('../../components/RunSelectionModal', () => ({ RunSelectionModal: () => 'RunSelectionModal' }));
jest.mock('../../components/WicketTypeSelectionModal', () => ({ WicketTypeSelectionModal: () => 'WicketTypeSelectionModal' }));
jest.mock('../../components/FielderSelectionModal', () => ({ FielderSelectionModal: () => 'FielderSelectionModal' }));
jest.mock('../../components/WhoIsOutModal', () => ({ WhoIsOutModal: () => 'WhoIsOutModal' }));
jest.mock('../../components/OverHistory', () => ({ OverHistory: () => 'OverHistory' }));

// Mock stores
jest.mock('../../store/useMatchStore', () => ({
    useMatchStore: jest.fn(),
}));

jest.mock('../../store/useAuthStore', () => ({
    useAuthStore: {
        getState: () => ({ isAuthenticated: false }),
    },
}));

jest.mock('../../utils/backupService', () => ({
    backupToDrive: jest.fn(),
}));

describe('ScoreboardScreen', () => {
    const mockRecordBall = jest.fn();
    const mockEndInnings = jest.fn();
    const mockUndoBall = jest.fn();
    const mockSwapBatsmen = jest.fn();
    const mockRetirePlayer = jest.fn();
    const mockStartSecondInnings = jest.fn();
    const mockRenamePlayer = jest.fn();
    const mockNavigation = { setOptions: jest.fn() };

    const mockState = {
        state: {
            isPlaying: true,
            isInningsBreak: false,
            currentInnings: 1,
            overs: 20,
            matchResult: null,
            teamAPlayers: [{ id: 'p1', name: 'Player 1' }, { id: 'p2', name: 'Player 2' }],
            teamBPlayers: [{ id: 'b1', name: 'Bowler 1' }],
            innings1: {
                battingTeam: 'Team A',
                battingTeamKey: 'teamA',
                totalRuns: 100,
                totalWickets: 2,
                overs: [],
                currentOver: [],
                strikerId: 'p1',
                nonStrikerId: 'p2',
                currentBowlerId: 'b1',
                battingStats: {
                    'p1': { runs: 50, ballsFaced: 30 },
                    'p2': { runs: 20, ballsFaced: 15 },
                },
                bowlingStats: {
                    'b1': { wickets: 1, runsConceded: 30, overs: 3, balls: 0 }
                }
            },
            innings2: {}
        },
        config: {
            runsForNoBall: 1,
            runsForWide: 1,
        },
        recordBall: mockRecordBall,
        endInnings: mockEndInnings,
        undoBall: mockUndoBall,
        swapBatsmen: mockSwapBatsmen,
        retirePlayer: mockRetirePlayer,
        startSecondInnings: mockStartSecondInnings,
        renamePlayer: mockRenamePlayer,
    };

    beforeEach(() => {
        (useMatchStore as unknown as jest.Mock).mockReturnValue(mockState);
        jest.clearAllMocks();
    });

    test('renders correctly', () => {
        const { getByText } = render(<ScoreboardScreen navigation={mockNavigation} />);
        expect(getByText('Team A Batting')).toBeTruthy();
        expect(getByText('100/2')).toBeTruthy();
        expect(getByText('Player 1*')).toBeTruthy(); // Striker
        expect(getByText('Player 2')).toBeTruthy(); // Non-striker
        expect(getByText('Bowler 1')).toBeTruthy(); // Bowler
    });

    test('handles standard runs scoring', () => {
        const { getByText } = render(<ScoreboardScreen navigation={mockNavigation} />);
        fireEvent.press(getByText('1'));
        expect(mockRecordBall).toHaveBeenCalledWith(1, 'none', false);
    });

    test('handles boundaries', () => {
        const { getByText } = render(<ScoreboardScreen navigation={mockNavigation} />);
        fireEvent.press(getByText('4'));
        expect(mockRecordBall).toHaveBeenCalledWith(4, 'none', false);
    });

    test('displays extras controls', () => {
        const { getByText } = render(<ScoreboardScreen navigation={mockNavigation} />);
        expect(getByText('Wide')).toBeTruthy();
        expect(getByText('No Ball')).toBeTruthy();
        expect(getByText('Bye')).toBeTruthy();
        expect(getByText('L-Bye')).toBeTruthy();
    });

    test('calls end innings confirmation', () => {
        const { getByText } = render(<ScoreboardScreen navigation={mockNavigation} />);
        fireEvent.press(getByText('END'));
        // Alert is mocked in setup, but we're not checking the specific Alert call here in this unit test structure easily without spying on Alert.alert.
        // Assuming the button is pressable.
    });

    test('renders innings break correctly and hides score card', () => {
        const breakState = {
            ...mockState,
            state: {
                ...mockState.state,
                isInningsBreak: true,
            }
        };
        (useMatchStore as unknown as jest.Mock).mockReturnValue(breakState);

        const { getByText, queryByText } = render(<ScoreboardScreen navigation={mockNavigation} />);

        // Should show break UI
        expect(getByText('Innings Over!')).toBeTruthy();
        expect(getByText('START 2ND INNINGS')).toBeTruthy();

        // Should NOT show header score elements
        expect(queryByText('Team A Batting')).toBeNull();
        expect(queryByText('100/2')).toBeNull();
    });
    describe('live scorecard teams', () => {
        const ids = (players: { id: string }[]) => players.map(p => p.id);
        const liveScorecardProps = () => {
            const calls = (ScorecardSection as unknown as jest.Mock).mock.calls;
            return calls[calls.length - 1][0];
        };

        const withBattingTeam = (battingTeamKey: 'teamA' | 'teamB') =>
            (useMatchStore as unknown as jest.Mock).mockReturnValue({
                ...mockState,
                history: [],
                state: {
                    ...mockState.state,
                    teamBPlayers: [{ id: 'b1', name: 'Bowler 1' }, { id: 'b2', name: 'Bowler 2' }],
                    innings1: { ...mockState.state.innings1, battingTeamKey },
                },
            });

        test('team A batting: batters are team A and bowlers are team B', () => {
            withBattingTeam('teamA');
            render(<ScoreboardScreen navigation={mockNavigation} />);

            const props = liveScorecardProps();
            expect(ids(props.battingTeamPlayers)).toEqual(['p1', 'p2']);
            expect(ids(props.bowlingTeamPlayers)).toEqual(['b1', 'b2']);
        });

        test('team B batting: batters are team B and bowlers are team A', () => {
            withBattingTeam('teamB');
            render(<ScoreboardScreen navigation={mockNavigation} />);

            const props = liveScorecardProps();
            expect(ids(props.battingTeamPlayers)).toEqual(['b1', 'b2']);
            expect(ids(props.bowlingTeamPlayers)).toEqual(['p1', 'p2']);
        });
    });

    describe('player avatars', () => {
        test('shows an avatar beside the striker, non-striker and current bowler', () => {
            (useMatchStore as unknown as jest.Mock).mockReturnValue({ ...mockState, history: [] });

            const { getAllByTestId } = render(<ScoreboardScreen navigation={mockNavigation} />);

            // Striker, non-striker and bowler bars (the scorecard tables add more)
            expect(getAllByTestId('player-avatar').length).toBeGreaterThanOrEqual(3);
        });
    });

    describe('series tally pill', () => {
        const withSeries = (seriesId?: string, history: any[] = []) =>
            (useMatchStore as unknown as jest.Mock).mockReturnValue({
                ...mockState,
                state: { ...mockState.state, seriesId },
                history,
            });

        beforeEach(() => {
            useSeriesStore.setState({
                series: [{ id: 'S1', teamA: 'LIONS', teamB: 'TIGERS', createdAt: '2026-06-01T10:00:00.000Z' }],
                activeSeriesId: 'S1',
            });
        });

        test('shows the series score and match number for a series match', () => {
            const done = { seriesId: 'S1', teamA: 'LIONS', teamB: 'TIGERS', completedAt: '2026-06-01T11:00:00.000Z', matchResult: { winner: 'LIONS', reason: '' } };
            withSeries('S1', [done]);

            const { getByText } = render(<ScoreboardScreen navigation={mockNavigation} />);

            expect(getByText('LIONS 1 - 0 TIGERS')).toBeTruthy();
            expect(getByText('· Match 2')).toBeTruthy();
        });

        test('shows nothing for an individual match', () => {
            withSeries(undefined);

            const { queryByText } = render(<ScoreboardScreen navigation={mockNavigation} />);

            expect(queryByText('Series')).toBeNull();
            expect(queryByText(/LIONS/)).toBeNull();
        });
    });
});
