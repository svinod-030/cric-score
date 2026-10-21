import { getAvatarLabel } from '../avatarLabel';

describe('getAvatarLabel', () => {
    test('uses the jersey number for generated default names', () => {
        expect(getAvatarLabel('TA1')).toBe('1');
        expect(getAvatarLabel('SRH11')).toBe('11');
        expect(getAvatarLabel('CSK7')).toBe('7');
        expect(getAvatarLabel('L2')).toBe('2');
    });

    test('uses two initials for a name with several words', () => {
        expect(getAvatarLabel('Asha Kumar')).toBe('AK');
        expect(getAvatarLabel('virat kohli')).toBe('VK');
        expect(getAvatarLabel('  Anil   Kumar  Rao ')).toBe('AK');
    });

    test('uses the first two letters of a single-word name', () => {
        expect(getAvatarLabel('Asha')).toBe('AS');
        expect(getAvatarLabel('Bala')).toBe('BA');
        expect(getAvatarLabel('Z')).toBe('Z');
    });

    test('does not mistake a real name that ends in a digit for a default name', () => {
        expect(getAvatarLabel('Raj7')).toBe('RA');
        expect(getAvatarLabel('Player 1')).toBe('P1');
    });

    test('handles non-latin names', () => {
        expect(getAvatarLabel('இந்தியா அணி')).toBe('இஅ');
        expect(getAvatarLabel('राहुल')).toHaveLength(2);
    });

    test('returns null when there is no name', () => {
        expect(getAvatarLabel(undefined)).toBeNull();
        expect(getAvatarLabel('')).toBeNull();
        expect(getAvatarLabel('   ')).toBeNull();
    });
});
