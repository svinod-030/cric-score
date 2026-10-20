import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import MatchSetupScreen from '../MatchSetupScreen';
import { useMatchStore } from '../../store/useMatchStore';
import { useSeriesStore } from '../../features/series/useSeriesStore';
import { Alert } from 'react-native';

// Mock dependencies
jest.mock('../../store/useMatchStore');
jest.mock('react-native-keyboard-aware-scroll-view', () => ({
    KeyboardAwareScrollView: ({ children }: any) => children,
}));
jest.mock('../../components/CoinFlipModal', () => ({
    CoinFlipModal: () => null,
}));
jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual('@react-navigation/native'),
    useNavigation: () => ({
        navigate: jest.fn(),
    }),
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
        useSeriesStore.setState({ series: [], activeSeriesId: undefined });

        (useMatchStore as unknown as jest.Mock).mockReturnValue({
            state: { isPlaying: false },
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
            state: { isPlaying: false },
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
        // An individual match is never stamped with a series, even right after a series match
        expect(mockSetConfig).toHaveBeenCalledWith({ seriesId: undefined });
    });

    test('start match button is disabled if toss is incomplete', () => {
        (useMatchStore as unknown as jest.Mock).mockReturnValue({
            state: { isPlaying: false },
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
    describe('series', () => {
        const readyConfig = {
            teamA: 'LIONS',
            teamB: 'TIGERS',
            overs: 5,
            playersPerTeam: 11,
            runsForWide: 1,
            runsForNoBall: 1,
            reballForWide: true,
            reballForNoBall: true,
            tossWinner: 'teamA',
            tossDecision: 'bat',
        };

        const mockStore = (config = readyConfig, history: any[] = []) =>
            (useMatchStore as unknown as jest.Mock).mockReturnValue({
                state: { isPlaying: false },
                config,
                history,
                setConfig: mockSetConfig,
                startMatch: mockStartMatch,
                loadTeamRoster: mockLoadTeamRoster,
            });

        test('defaults to an individual match', () => {
            mockStore();
            const { getByText, queryByText } = render(<MatchSetupScreen navigation={mockNavigation} />);

            expect(getByText('Match Type')).toBeTruthy();
            expect(queryByText('End Series')).toBeNull();
        });

        test('starting with Series selected creates a series and stamps its id on the match', () => {
            mockStore();
            const { getByText } = render(<MatchSetupScreen navigation={mockNavigation} />);

            fireEvent.press(getByText('Series'));
            fireEvent.press(getByText('Start Match'));

            const { series, activeSeriesId } = useSeriesStore.getState();
            expect(series).toHaveLength(1);
            expect(series[0]).toMatchObject({ teamA: 'LIONS', teamB: 'TIGERS' });
            expect(mockSetConfig).toHaveBeenCalledWith({ seriesId: activeSeriesId });
            expect(mockStartMatch).toHaveBeenCalled();
        });

        test('does not create a series until the match is actually started', () => {
            mockStore();
            const { getByText } = render(<MatchSetupScreen navigation={mockNavigation} />);

            fireEvent.press(getByText('Series'));

            expect(useSeriesStore.getState().series).toHaveLength(0);
        });

        test('a series needs two different team names', () => {
            mockStore({ ...readyConfig, teamB: 'lions' });
            const { getByText } = render(<MatchSetupScreen navigation={mockNavigation} />);

            fireEvent.press(getByText('Series'));
            fireEvent.press(getByText('Start Match'));

            expect(Alert.alert).toHaveBeenCalledWith('Incomplete Setup', 'A series needs two different team names.');
            expect(mockStartMatch).not.toHaveBeenCalled();
            expect(useSeriesStore.getState().series).toHaveLength(0);
        });

        test('with an active series it shows the banner, locks the teams and continues the series', () => {
            mockStore();
            let id = '';
            act(() => { id = useSeriesStore.getState().startSeries('LIONS', 'TIGERS'); });

            const { getByText, getAllByPlaceholderText } = render(<MatchSetupScreen navigation={mockNavigation} />);

            expect(getByText('Match 1')).toBeTruthy();
            expect(getByText('End Series')).toBeTruthy();
            expect(getAllByPlaceholderText('Team A')[0].props.editable).toBe(false);

            fireEvent.press(getByText('Start Match'));

            expect(useSeriesStore.getState().series).toHaveLength(1);
            expect(mockSetConfig).toHaveBeenCalledWith({ seriesId: id });
        });

        test('pins the config teams to the active series', () => {
            mockStore({ ...readyConfig, teamA: 'OTHER', teamB: 'TEAM' });
            act(() => { useSeriesStore.getState().startSeries('LIONS', 'TIGERS'); });

            render(<MatchSetupScreen navigation={mockNavigation} />);

            expect(mockSetConfig).toHaveBeenCalledWith({ teamA: 'LIONS' });
            expect(mockSetConfig).toHaveBeenCalledWith({ teamB: 'TIGERS' });
            expect(mockLoadTeamRoster).toHaveBeenCalledWith('teamA', 'LIONS');
        });

        test('choosing Individual during an active series unlocks the teams and leaves the series untouched', () => {
            mockStore();
            act(() => { useSeriesStore.getState().startSeries('LIONS', 'TIGERS'); });

            const { getByText, getAllByPlaceholderText } = render(<MatchSetupScreen navigation={mockNavigation} />);

            fireEvent.press(getByText('Individual'));

            expect(getAllByPlaceholderText('Team A')[0].props.editable).toBe(true);

            fireEvent.press(getByText('Start Match'));

            expect(mockSetConfig).toHaveBeenCalledWith({ seriesId: undefined });
            expect(useSeriesStore.getState().series).toHaveLength(1);
        });

        test('ending the series asks for confirmation', () => {
            mockStore();
            act(() => { useSeriesStore.getState().startSeries('LIONS', 'TIGERS'); });

            const { getByText } = render(<MatchSetupScreen navigation={mockNavigation} />);

            fireEvent.press(getByText('End Series'));

            expect(Alert.alert).toHaveBeenCalledWith('End Series', expect.any(String), expect.any(Array));
        });
    });
});
