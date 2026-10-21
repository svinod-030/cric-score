import { Ionicons } from '@expo/vector-icons';
import React from 'react';

export type IconName = React.ComponentProps<typeof Ionicons>['name'];

export type TeamTheme = { color: string; logo: IconName };

export const TEAM_COLORS = [
    '#2563EB', // blue
    '#DC2626', // red
    '#16A34A', // green
    '#D97706', // amber
    '#7C3AED', // violet
    '#0891B2', // cyan
    '#DB2777', // pink
    '#EA580C', // orange
];

export const TEAM_LOGOS: IconName[] = [
    'shield', 'flash', 'flame', 'star', 'rocket', 'paw',
    'leaf', 'diamond', 'skull', 'planet', 'thunderstorm', 'trophy',
];

export const NEUTRAL_COLOR = '#4B5563';

const normalize = (name?: string) => (name ?? '').trim().toUpperCase();

// FNV-1a: small, stable 32-bit hash so a name always maps to the same look.
const hash = (value: string): number => {
    let h = 0x811c9dc5;
    for (let i = 0; i < value.length; i++) {
        h ^= value.charCodeAt(i);
        h = Math.imul(h, 0x01000193);
    }
    return h >>> 0;
};

const themeIndexes = (name: string) => {
    const h = hash(name);
    return { color: h % TEAM_COLORS.length, logo: (h >>> 8) % TEAM_LOGOS.length };
};

// A team's own look: looks random, but is stable for the same team name.
export const getTeamTheme = (teamName?: string): TeamTheme => {
    const { color, logo } = themeIndexes(normalize(teamName));
    return { color: TEAM_COLORS[color], logo: TEAM_LOGOS[logo] };
};

// Looks for the two teams of a match. Each team keeps its own look, except that the two teams
// are never given the same color or logo: when they would clash, the alphabetically later team
// is moved to the next free one, so a team looks the same whichever side it is on.
export const getMatchTheme = (teamA?: string, teamB?: string): { teamA: TeamTheme; teamB: TeamTheme } => {
    const nameA = normalize(teamA);
    const nameB = normalize(teamB);
    const [first, second] = nameA <= nameB ? [nameA, nameB] : [nameB, nameA];

    const firstIdx = themeIndexes(first);
    const secondIdx = themeIndexes(second);
    if (secondIdx.color === firstIdx.color) secondIdx.color = (secondIdx.color + 1) % TEAM_COLORS.length;
    if (secondIdx.logo === firstIdx.logo) secondIdx.logo = (secondIdx.logo + 1) % TEAM_LOGOS.length;

    const firstTheme = { color: TEAM_COLORS[firstIdx.color], logo: TEAM_LOGOS[firstIdx.logo] };
    const secondTheme = { color: TEAM_COLORS[secondIdx.color], logo: TEAM_LOGOS[secondIdx.logo] };

    return nameA <= nameB
        ? { teamA: firstTheme, teamB: secondTheme }
        : { teamA: secondTheme, teamB: firstTheme };
};

// Mixes a #RRGGBB color toward white (amount > 0) or black (amount < 0). amount is in [-1, 1].
export const shadeColor = (hex: string, amount: number): string => {
    const value = parseInt(hex.slice(1), 16);
    const target = amount >= 0 ? 255 : 0;
    const t = Math.abs(amount);
    const mix = (channel: number) => Math.round(channel + (target - channel) * t);
    const r = mix((value >> 16) & 255);
    const g = mix((value >> 8) & 255);
    const b = mix(value & 255);
    return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1).toUpperCase()}`;
};

const PLAYER_SHADES = [-0.2, -0.1, 0, 0.12, 0.24];

// Every player in a team wears the team's color, with a slightly different shade per player.
export const getPlayerColor = (teamColor: string, playerKey: string): string =>
    shadeColor(teamColor, PLAYER_SHADES[hash(playerKey) % PLAYER_SHADES.length]);
