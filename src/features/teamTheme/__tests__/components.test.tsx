import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { render, within } from '@testing-library/react-native';
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

        test('shows extra content inside the picture, below the teams', () => {
            const { getByTestId, getByText } = render(
                <MatchBanner teamA="LIONS" teamB="TIGERS">
                    <Text>LIONS Wins!</Text>
                </MatchBanner>
            );

            expect(within(getByTestId('match-banner')).getByText('LIONS Wins!')).toBeTruthy();
            // The teams stay above it
            const text = JSON.stringify(render(<MatchBanner teamA="LIONS" teamB="TIGERS"><Text>RESULT-TEXT</Text></MatchBanner>).toJSON());
            expect(text.indexOf('TIGERS')).toBeLessThan(text.indexOf('RESULT-TEXT'));
            expect(getByText('TIGERS')).toBeTruthy();
        });

        test('renders no extra area when there are no children', () => {
            const { getByTestId } = render(<MatchBanner teamA="LIONS" teamB="TIGERS" />);

            // Only the team row sits inside the picture's overlay
            expect(getByTestId('match-banner')).toBeTruthy();
        });

        test('fades the picture into the page colour at the bottom', () => {
            const { getByTestId } = render(<MatchBanner teamA="LIONS" teamB="TIGERS" />);
            const layers = getByTestId('banner-fade').children as any[];
            const style = (node: any) => StyleSheet.flatten(node.props.style);
            const alpha = (node: any) => parseFloat(style(node).backgroundColor.match(/([\d.]+)\)$/)[1]);

            expect(layers.length).toBeGreaterThan(10);

            // Layers overlap (each runs down to the bottom edge) so rounding can't leave a gap
            layers.forEach(layer => expect(style(layer).bottom).toBe(0));
            const tops = layers.map(l => style(l).top);
            tops.forEach((top, i) => i > 0 && expect(top).toBeGreaterThan(tops[i - 1]));

            // Accumulated opacity at the top of each layer: starts near 0, ends at exactly 1, never decreases
            let remaining = 1;
            const accumulated = layers.map(layer => {
                remaining *= 1 - alpha(layer);
                return 1 - remaining;
            });
            expect(accumulated[0]).toBeLessThan(0.05);
            expect(accumulated[accumulated.length - 1]).toBeCloseTo(1, 5);
            accumulated.forEach((v, i) => i > 0 && expect(v).toBeGreaterThanOrEqual(accumulated[i - 1]));
        });

        test('fades into a custom colour', () => {
            const { getByTestId } = render(<MatchBanner teamA="A" teamB="B" fadeColor="#000000" />);
            const last = (getByTestId('banner-fade').children as any[]).slice(-1)[0];

            expect(StyleSheet.flatten(last.props.style).backgroundColor).toBe('rgba(0, 0, 0, 1.0000)');
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
