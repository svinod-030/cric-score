import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { OverSummarySection } from '../OverSummarySection';
import { InningsState, Ball } from '../../types/match';

describe('OverSummarySection', () => {
    const mockBall: Ball = {
        runs: 1,
        isWicket: false,
        timestamp: 123,
        isExtra: false,
        extraType: 'none',
        isByeForNoBall: false,
        isValidBall: true,
        overNumber: 1,
        ballNumber: 1
    };

    const mockWicketBall: Ball = {
        ...mockBall,
        runs: 0,
        isWicket: true,
        wicketType: 'bowled'
    };

    const mockInnings: InningsState = {
        battingTeamId: 'team1',
        bowlingTeamId: 'team2',
        totalRuns: 10,
        totalWickets: 1,
        overs: [
            { balls: [mockBall, mockBall, mockBall, mockBall, mockBall, mockBall], bowlerId: 'b1' } // 6 runs
        ],
        currentOver: [mockWicketBall], // 0 runs, 1 wicket
        battingStats: {},
        bowlingStats: {},
        fow: [],
        isCompleted: false
    };

    test('renders correctly with title', () => {
        const { getByText } = render(
            <OverSummarySection
                title="Match Log"
                innings={mockInnings}
                defaultExpanded={true}
            />
        );

        expect(getByText('Match Log')).toBeTruthy();
    });

    test('displays overs correctly when expanded', () => {
        const { getByText } = render(
            <OverSummarySection
                title="Match Log"
                innings={mockInnings}
                defaultExpanded={true}
            />
        );

        // Over 1 (historic)
        expect(getByText('Over 1')).toBeTruthy();
        expect(getByText('6 runs')).toBeTruthy();

        // Current Over (Over 2)
        expect(getByText('Over 2')).toBeTruthy();
        expect(getByText('0 runs')).toBeTruthy();
        expect(getByText('1 wkt')).toBeTruthy();
    });

    test('collapses and expands', () => {
        const { getByText, queryByText } = render(
            <OverSummarySection
                title="Match Log"
                innings={mockInnings}
                defaultExpanded={false}
            />
        );

        // Initially hidden
        expect(queryByText('Over 1')).toBeNull();

        // Tap to expand
        fireEvent.press(getByText('Match Log'));
        expect(getByText('Over 1')).toBeTruthy();
    });
});
