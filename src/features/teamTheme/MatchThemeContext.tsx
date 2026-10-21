import React, { createContext, useContext, useMemo } from 'react';
import { getMatchTheme, getTeamTheme, TeamTheme } from './teamTheme';

type MatchThemeValue = {
    teamA: string;
    teamB: string;
    theme: { teamA: TeamTheme; teamB: TeamTheme };
};

const MatchThemeContext = createContext<MatchThemeValue | null>(null);

// Gives everything below it the look (color + logo) of the two teams in a match,
// so scorecards, awards and pickers can colour players without passing props around.
export const MatchThemeProvider = ({ teamA, teamB, children }: { teamA?: string; teamB?: string; children: React.ReactNode }) => {
    const value = useMemo(
        () => ({ teamA: teamA ?? '', teamB: teamB ?? '', theme: getMatchTheme(teamA, teamB) }),
        [teamA, teamB]
    );
    return <MatchThemeContext.Provider value={value}>{children}</MatchThemeContext.Provider>;
};

export const useMatchTheme = () => useContext(MatchThemeContext);

const sameName = (a: string, b: string) => a.trim().toUpperCase() === b.trim().toUpperCase();

// Theme of a team by name. Falls back to the team's own look outside a provider.
export const resolveTeamTheme = (ctx: MatchThemeValue | null, teamName?: string): TeamTheme => {
    if (ctx && teamName !== undefined) {
        if (sameName(teamName, ctx.teamA)) return ctx.theme.teamA;
        if (sameName(teamName, ctx.teamB)) return ctx.theme.teamB;
    }
    return getTeamTheme(teamName);
};

// Match-local player ids start with the side: A1.. = team A, B1.. = team B.
export const resolvePlayerTheme = (ctx: MatchThemeValue | null, playerId?: string): TeamTheme | undefined => {
    if (!ctx || !playerId) return undefined;
    if (playerId.startsWith('A')) return ctx.theme.teamA;
    if (playerId.startsWith('B')) return ctx.theme.teamB;
    return undefined;
};
