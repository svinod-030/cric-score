import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ScorecardSection } from '../ScorecardSection';
import { InningsState } from '../../types/match';

describe('ScorecardSection', () => {
    const mockBatters = [
        { id: 'p1', name: 'Batter 1' },
        { id: 'p2', name: 'Batter 2' },
    ];
    const mockBowlers = [
        { id: 'b1', name: 'Bowler 1' },
        { id: 'b2', name: 'Bowler 2' },
    ];

    const mockInnings: InningsState = {
        battingTeam: 'team1',
        battingTeamKey: 'teamA',
        totalRuns: 120,
        totalWickets: 3,
        overs: [],
        currentOver: [],
        strikerId: 'p1',
        nonStrikerId: 'p2',
        currentBowlerId: 'b1',
        battingStats: {
            'p1': { runs: 50, ballsFaced: 30, fours: 4, sixes: 2, isOut: false, isRetired: false, battingOrder: 1, playerId: 'p1' },
            'p2': { runs: 10, ballsFaced: 10, fours: 1, sixes: 0, isOut: true, isRetired: false, battingOrder: 2, dismissal: 'bowled', bowlerId: 'b1', playerId: 'p2' }
        },
        bowlingStats: {
            'b1': { runsConceded: 20, wickets: 1, overs: 4, balls: 0, maidens: 0, playerId: 'b1' }
        },
        fallOfWickets: [],
        isLastManStanding: false,
    };

    test('renders correctly with title and total score', () => {
        const { getByText, getAllByText } = render(
            <ScorecardSection
                title="1st Innings"
                innings={mockInnings}
                battingTeamPlayers={mockBatters}
                bowlingTeamPlayers={mockBowlers}
            />
        );

        expect(getByText('1st Innings')).toBeTruthy();
        const elements = getAllByText('120/3 (0.0 Ov)');
        expect(elements.length).toBeGreaterThan(0);
    });

    test('renders batting stats correctly', () => {
        const { getByText, getAllByText } = render(
            <ScorecardSection
                title="1st Innings"
                innings={mockInnings}
                battingTeamPlayers={mockBatters}
                bowlingTeamPlayers={mockBowlers}
            />
        );

        expect(getByText('Batter 1')).toBeTruthy();
        expect(getByText('50')).toBeTruthy(); // runs
        expect(getByText('30')).toBeTruthy(); // balls
        expect(getByText('not out')).toBeTruthy();

        expect(getByText('Batter 2')).toBeTruthy();
        expect(getAllByText('10').length).toBeGreaterThan(0);
        expect(getByText('b Bowler 1')).toBeTruthy(); // dismissal info
    });

    test('renders bowling stats correctly', () => {
        const { getByText, getAllByText } = render(
            <ScorecardSection
                title="1st Innings"
                innings={mockInnings}
                battingTeamPlayers={mockBatters}
                bowlingTeamPlayers={mockBowlers}
            />
        );

        expect(getByText('Bowler 1')).toBeTruthy();
        expect(getByText('4.0')).toBeTruthy(); // overs
        expect(getByText('20')).toBeTruthy(); // runs
        expect(getAllByText('1').length).toBeGreaterThan(0); // wickets
    });

    test('collapses and expands', () => {
        const { getByText, queryByText } = render(
            <ScorecardSection
                title="1st Innings"
                innings={mockInnings}
                battingTeamPlayers={mockBatters}
                bowlingTeamPlayers={mockBowlers}
                isCollapsible={true}
                defaultExpanded={false}
            />
        );

        // Initially expanded content should be hidden (except header)
        expect(queryByText('Batter 1')).toBeNull();

        // Tap to expand
        fireEvent.press(getByText('1st Innings'));
        expect(getByText('Batter 1')).toBeTruthy();
    });
    describe('live innings before a ball has been bowled', () => {
        const players = {
            batters: [
                { id: 'p1', name: 'Batter 1' },
                { id: 'p2', name: 'Batter 2' },
                { id: 'p3', name: 'Batter 3' },
            ],
            bowlers: [
                { id: 'b1', name: 'Bowler 1' },
                { id: 'b2', name: 'Bowler 2' },
                { id: 'b3', name: 'Bowler 3' },
            ],
        };

        const freshInnings = (overrides: Partial<InningsState> = {}): InningsState => ({
            battingTeam: 'team2',
            battingTeamKey: 'teamB',
            totalRuns: 0,
            totalWickets: 0,
            overs: [],
            currentOver: [],
            strikerId: 'p1',
            nonStrikerId: 'p2',
            currentBowlerId: 'b2',
            battingStats: {},
            bowlingStats: {},
            fallOfWickets: [],
            ...overrides,
        });

        const renderSection = (innings: InningsState) => render(
            <ScorecardSection
                title="2nd Innings"
                innings={innings}
                battingTeamPlayers={players.batters}
                bowlingTeamPlayers={players.bowlers}
            />
        );

        test('shows the current bowler with zeros before they have bowled', () => {
            const { getByText, getAllByText, queryByText } = renderSection(freshInnings());

            expect(getByText('Bowler 2')).toBeTruthy();
            expect(getAllByText('0.0')).toHaveLength(2); // overs and economy
            expect(queryByText('Bowler 1')).toBeNull();
            expect(queryByText('Bowler 3')).toBeNull();
        });

        test('shows the batters at the crease before they have faced a ball', () => {
            const { getByText, queryByText, getAllByText } = renderSection(freshInnings());

            expect(getByText('Batter 1')).toBeTruthy();
            expect(getByText('Batter 2')).toBeTruthy();
            expect(getAllByText('not out')).toHaveLength(2);
            expect(queryByText('Batter 3')).toBeNull();
        });

        test('keeps real stats for players who have them and adds the current bowler after them', () => {
            const { getByText, getAllByText } = renderSection(freshInnings({
                currentBowlerId: 'b3',
                battingStats: {
                    p1: { playerId: 'p1', runs: 12, ballsFaced: 8, fours: 2, sixes: 0, isOut: false, isRetired: false, battingOrder: 1 },
                    p2: { playerId: 'p2', runs: 3, ballsFaced: 4, fours: 0, sixes: 0, isOut: false, isRetired: false, battingOrder: 2 },
                },
                bowlingStats: {
                    b2: { playerId: 'b2', overs: 1, balls: 0, maidens: 0, runsConceded: 7, wickets: 1 },
                },
            }));

            expect(getByText('12')).toBeTruthy();
            expect(getByText('7')).toBeTruthy();
            expect(getByText('Bowler 2')).toBeTruthy();
            expect(getByText('Bowler 3')).toBeTruthy(); // the new bowler, no balls yet
            expect(getAllByText('not out')).toHaveLength(2);
        });

        test('lists a batter who has not faced a ball after batters who have', () => {
            const { toJSON } = renderSection(freshInnings({
                strikerId: 'p3',
                nonStrikerId: 'p2',
                battingStats: {
                    p2: { playerId: 'p2', runs: 4, ballsFaced: 3, fours: 1, sixes: 0, isOut: false, isRetired: false, battingOrder: 1 },
                },
            }));

            const text = JSON.stringify(toJSON());
            expect(text.indexOf('Batter 2')).toBeGreaterThan(-1);
            expect(text.indexOf('Batter 3')).toBeGreaterThan(text.indexOf('Batter 2'));
        });

        test('does not show a bowler row when no bowler has been picked', () => {
            const { queryByText } = renderSection(freshInnings({ currentBowlerId: null }));

            expect(queryByText('Bowler 1')).toBeNull();
            expect(queryByText('Bowler 2')).toBeNull();
        });
    });
});
