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
        battingTeamId: 'team1',
        bowlingTeamId: 'team2',
        totalRuns: 120,
        totalWickets: 3,
        overs: [],
        currentOver: [],
        battingStats: {
            'p1': { runs: 50, ballsFaced: 30, fours: 4, sixes: 2, isOut: false, playerId: 'p1' },
            'p2': { runs: 10, ballsFaced: 10, fours: 1, sixes: 0, isOut: true, dismissal: 'bowled', bowlerId: 'b1', playerId: 'p2' }
        },
        bowlingStats: {
            'b1': { runsConceded: 20, wickets: 1, overs: 4, balls: 0, maidens: 0, playerId: 'b1' }
        },
        fow: [],
        isCompleted: false
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
});
