import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { render } from '@testing-library/react-native';
import { MatchThemeProvider } from '../MatchThemeContext';
import { MatchBanner } from '../components/MatchBanner';
import { PlayerAvatar } from '../components/PlayerAvatar';
import { TeamLogo } from '../components/TeamLogo';
import { getMatchTheme, NEUTRAL_COLOR, getPlayerColor, getTeamTheme } from '../teamTheme';

const bg = (node: any) => StyleSheet.flatten(node.props.style).backgroundColor;

describe('teamTheme components', () => {
    describe('TeamLogo', () => {
        test('uses the team color and logo', () => {
            const { getByTestId, UNSAFE_getByProps } = render(<TeamLogo teamName="LIONS" />);
            const expected = getTeamTheme('LIONS');

            expect(bg(getByTestId('team-logo'))).toBe(expected.color);
            expect(UNSAFE_getByProps({ name: expected.logo })).toBeTruthy();
        });

        test('inside a match, the two teams get different colors', () => {
            const { getAllByTestId } = render(
                <MatchThemeProvider teamA="TEAM A" teamB="TEAM B">
                    <TeamLogo teamName="TEAM A" />
                    <TeamLogo teamName="TEAM B" />
                </MatchThemeProvider>
            );
            const [a, b] = getAllByTestId('team-logo');
            const theme = getMatchTheme('TEAM A', 'TEAM B');

            expect(bg(a)).toBe(theme.teamA.color);
            expect(bg(b)).toBe(theme.teamB.color);
            expect(bg(a)).not.toBe(bg(b));
        });
    });

    describe('PlayerAvatar', () => {
        test('uses the colour of the player\'s team inside a match (A.. = team A, B.. = team B)', () => {
            const { getAllByTestId } = render(
                <MatchThemeProvider teamA="LIONS" teamB="TIGERS">
                    <PlayerAvatar playerId="A3" seed="Asha" />
                    <PlayerAvatar playerId="B2" seed="Bala" />
                </MatchThemeProvider>
            );
            const theme = getMatchTheme('LIONS', 'TIGERS');
            const [a, b] = getAllByTestId('player-avatar');

            expect(bg(a)).toBe(getPlayerColor(theme.teamA.color, 'Asha'));
            expect(bg(b)).toBe(getPlayerColor(theme.teamB.color, 'Bala'));
        });

        test('can be coloured by team name, for awards that are keyed by name', () => {
            const { getByTestId } = render(
                <MatchThemeProvider teamA="LIONS" teamB="TIGERS">
                    <PlayerAvatar teamName="tigers" seed="Bala" />
                </MatchThemeProvider>
            );

            expect(bg(getByTestId('player-avatar'))).toBe(getPlayerColor(getMatchTheme('LIONS', 'TIGERS').teamB.color, 'Bala'));
        });

        test('is neutral grey outside a match theme', () => {
            const { getByTestId } = render(<PlayerAvatar playerId="A1" />);

            expect(bg(getByTestId('player-avatar'))).toBe(NEUTRAL_COLOR);
        });
    });

    describe('MatchBanner', () => {
        test('shows both team names, their logos and VS by default', () => {
            const { getByText, getAllByTestId, getByTestId } = render(<MatchBanner teamA="LIONS" teamB="TIGERS" />);

            expect(getByTestId('match-banner')).toBeTruthy();
            expect(getByText('LIONS')).toBeTruthy();
            expect(getByText('TIGERS')).toBeTruthy();
            expect(getByText('VS')).toBeTruthy();
            expect(getAllByTestId('team-logo')).toHaveLength(2);
        });

        test('shows custom centre content instead of VS', () => {
            const { getByText, queryByText } = render(
                <MatchBanner teamA="LIONS" teamB="TIGERS" center={<Text>2 - 1</Text>} />
            );

            expect(getByText('2 - 1')).toBeTruthy();
            expect(queryByText('VS')).toBeNull();
        });
    });
});
