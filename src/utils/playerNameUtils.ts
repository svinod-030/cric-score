// Initials of each word in the team name: "Team A" -> "TA", "Chennai Super Kings" -> "CSK", "Lions" -> "L".
export const getTeamInitials = (teamName: string): string => {
    const initials = (teamName || '')
        .trim()
        .split(/\s+/)
        .map(word => Array.from(word)[0] ?? '')
        .join('')
        .toUpperCase();
    return initials || 'P';
};

// Short default player name: team initials followed by the player's number. "Team A", 1 -> "TA1".
export const getDefaultPlayerName = (teamName: string, playerNumber: number): string =>
    `${getTeamInitials(teamName)}${playerNumber}`;
