import { useState } from 'react';
import { matchSyncService } from '../services/matchSyncService';

export const useMatchSync = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const joinMatch = async (matchId: string) => {
        setIsLoading(true);
        setError(null);
        try {
            const matchData = await matchSyncService.getMatch(matchId);
            if (matchData) {
                return true;
            } else {
                setError("Match not found. Please check the Match ID.");
                return false;
            }
        } catch (e) {
            console.error("Join match error:", e);
            setError("Failed to connect. Please try again.");
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    return { joinMatch, isLoading, error };
};
