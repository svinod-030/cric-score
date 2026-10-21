// Generated default names are the team's initials plus the player number ("TA1", "SRH11").
const DEFAULT_NAME = /^[A-Z]{1,6}(\d{1,3})$/;

// Short text for a player's avatar: the jersey number for a default name ("SRH11" -> "11"),
// otherwise the initials of a real name ("Asha Kumar" -> "AK", "Asha" -> "AS").
// Returns null when there is nothing to show, so the avatar can fall back to an icon.
export const getAvatarLabel = (name?: string): string | null => {
    const trimmed = (name ?? '').trim();
    if (!trimmed) return null;

    const defaultName = DEFAULT_NAME.exec(trimmed);
    if (defaultName) return String(parseInt(defaultName[1], 10));

    const words = trimmed.split(/\s+/);
    const letters = words.length > 1
        ? words.slice(0, 2).map(word => Array.from(word)[0])
        : Array.from(words[0]).slice(0, 2);

    return letters.join('').toUpperCase();
};
