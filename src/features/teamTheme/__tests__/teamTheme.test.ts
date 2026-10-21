import { getMatchTheme, getPlayerColor, getTeamTheme, shadeColor, TEAM_COLORS, TEAM_LOGOS } from '../teamTheme';

describe('teamTheme', () => {
    describe('getTeamTheme', () => {
        test('is stable for the same team name', () => {
            expect(getTeamTheme('LIONS')).toEqual(getTeamTheme('LIONS'));
        });

        test('ignores case and surrounding spaces', () => {
            expect(getTeamTheme('  lions ')).toEqual(getTeamTheme('LIONS'));
        });

        test('always picks a color and logo from the palettes', () => {
            ['TEAM A', 'TEAM B', 'INDIA', 'चेन्नई', '', 'X'].forEach(name => {
                const theme = getTeamTheme(name);
                expect(TEAM_COLORS).toContain(theme.color);
                expect(TEAM_LOGOS).toContain(theme.logo);
            });
        });

        test('different teams do not all look alike', () => {
            const names = ['TEAM A', 'TEAM B', 'LIONS', 'TIGERS', 'KINGS', 'QUEENS', 'INDIA', 'AUSTRALIA'];
            const colors = new Set(names.map(n => getTeamTheme(n).color));
            const logos = new Set(names.map(n => getTeamTheme(n).logo));
            expect(colors.size).toBeGreaterThan(2);
            expect(logos.size).toBeGreaterThan(2);
        });
    });

    describe('getMatchTheme', () => {
        const names = ['TEAM A', 'TEAM B', 'LIONS', 'TIGERS', 'KINGS', 'QUEENS', 'INDIA', 'AUSTRALIA', 'CSK', 'MI', 'RCB', 'KKR', 'DC', 'SRH'];

        test('never gives the two teams the same color or logo', () => {
            names.forEach(a => names.forEach(b => {
                if (a === b) return;
                const theme = getMatchTheme(a, b);
                expect(theme.teamA.color).not.toBe(theme.teamB.color);
                expect(theme.teamA.logo).not.toBe(theme.teamB.logo);
            }));
        });

        test('a team looks the same whichever side it is on', () => {
            names.forEach(a => names.forEach(b => {
                if (a === b) return;
                const forward = getMatchTheme(a, b);
                const swapped = getMatchTheme(b, a);
                expect(forward.teamA).toEqual(swapped.teamB);
                expect(forward.teamB).toEqual(swapped.teamA);
            }));
        });

        test('is stable between calls', () => {
            expect(getMatchTheme('LIONS', 'TIGERS')).toEqual(getMatchTheme('LIONS', 'TIGERS'));
        });
    });

    describe('shadeColor', () => {
        test('leaves the color alone at 0', () => {
            expect(shadeColor('#2563EB', 0)).toBe('#2563EB');
        });

        test('lightens toward white and darkens toward black', () => {
            expect(shadeColor('#000000', 1)).toBe('#FFFFFF');
            expect(shadeColor('#FFFFFF', -1)).toBe('#000000');
            expect(shadeColor('#808080', 0.5)).toBe('#C0C0C0');
            expect(shadeColor('#808080', -0.5)).toBe('#404040');
        });

        test('keeps a valid #RRGGBB format', () => {
            expect(shadeColor('#0A0B0C', 0.1)).toMatch(/^#[0-9A-F]{6}$/);
            expect(shadeColor('#0A0B0C', -0.1)).toMatch(/^#[0-9A-F]{6}$/);
        });
    });

    describe('getPlayerColor', () => {
        test('is stable for the same player', () => {
            expect(getPlayerColor('#2563EB', 'Asha')).toBe(getPlayerColor('#2563EB', 'Asha'));
        });

        test('stays a shade of the team color', () => {
            const team = '#2563EB';
            const toRgb = (hex: string) => [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16));
            ['Asha', 'Anil', 'Arun', 'TA1', 'TA2', 'TA3', 'TA4', 'TA5'].forEach(player => {
                const [r, g, b] = toRgb(getPlayerColor(team, player));
                // Blue stays the dominant channel in every shade of a blue team
                expect(b).toBeGreaterThan(r);
                expect(b).toBeGreaterThan(g);
            });
        });

        test('gives different players of a team different shades', () => {
            const shades = new Set(['TA1', 'TA2', 'TA3', 'TA4', 'TA5', 'TA6', 'TA7', 'TA8'].map(p => getPlayerColor('#2563EB', p)));
            expect(shades.size).toBeGreaterThan(1);
        });
    });
});
