import React from 'react';
import { render } from '@testing-library/react-native';
import { OverHistory } from '../OverHistory';
import { Ball } from '../../types/match';

describe('OverHistory', () => {
    const mockBalls: Ball[] = [
        {
            runs: 1,
            isWicket: false,
            wicketType: 'none',
            extraType: 'none',
            isValidBall: true,
            batsmanId: 'p1',
            bowlerId: 'b1',
        },
        {
            runs: 0,
            isWicket: true,
            wicketType: 'bowled',
            extraType: 'none',
            isValidBall: true,
            batsmanId: 'p2',
            bowlerId: 'b1',
        }
    ];

    const mockOvers = [
        { balls: mockBalls, bowlerId: 'bowler1' }
    ];

    test('renders correctly with overs', () => {
        const { getByText } = render(
            <OverHistory
                overs={mockOvers}
                runsForNoBall={1}
                runsForWide={1}
            />
        );

        expect(getByText('Previous Overs')).toBeTruthy();
        expect(getByText('Over 1')).toBeTruthy();
        expect(getByText('1')).toBeTruthy(); // Runs
        expect(getByText('W')).toBeTruthy(); // Wicket
    });

    test('does not render when no overs', () => {
        const { queryByText } = render(
            <OverHistory
                overs={[]}
                runsForNoBall={1}
                runsForWide={1}
            />
        );

        expect(queryByText('Previous Overs')).toBeNull();
    });

    test('displays extras correctly', () => {
        const extraBalls: Ball[] = [
            {
                runs: 1,
                isWicket: false,
                wicketType: 'none',
                extraType: 'wide',
                isValidBall: false,
                batsmanId: 'p1',
                bowlerId: 'b1',
            }
        ];

        const { getByText } = render(
            <OverHistory
                overs={[{ balls: extraBalls, bowlerId: 'bowler1' }]}
                runsForNoBall={1}
                runsForWide={1}
            />
        );

        expect(getByText('WD')).toBeTruthy();
    });
});
