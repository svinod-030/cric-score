import { getDefaultPlayerName, getTeamInitials } from '../playerNameUtils';

describe('playerNameUtils', () => {
    describe('getTeamInitials', () => {
        test('takes the first letter of each word', () => {
            expect(getTeamInitials('Team A')).toBe('TA');
            expect(getTeamInitials('Team B')).toBe('TB');
            expect(getTeamInitials('Chennai Super Kings')).toBe('CSK');
        });

        test('uses a single letter for a one-word name', () => {
            expect(getTeamInitials('LIONS')).toBe('L');
        });

        test('uppercases the initials', () => {
            expect(getTeamInitials('team a')).toBe('TA');
        });

        test('ignores extra whitespace', () => {
            expect(getTeamInitials('  Team   A  ')).toBe('TA');
        });

        test('falls back to P for an empty name', () => {
            expect(getTeamInitials('')).toBe('P');
            expect(getTeamInitials('   ')).toBe('P');
        });

        test('handles non-latin names', () => {
            expect(getTeamInitials('இந்தியா அணி')).toBe('இஅ');
        });
    });

    describe('getDefaultPlayerName', () => {
        test('adds the player number after the initials', () => {
            expect(getDefaultPlayerName('Team A', 1)).toBe('TA1');
            expect(getDefaultPlayerName('Team B', 1)).toBe('TB1');
            expect(getDefaultPlayerName('Team A', 11)).toBe('TA11');
        });
    });
});
