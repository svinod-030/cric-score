import { collection, doc, setDoc, onSnapshot, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../utils/firebase';
import { MatchState } from '../types/match';

const MATCHES_COLLECTION = 'matches';

// Generates a random 6-character alphanumeric match ID
const generateMatchId = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
};

export const matchSyncService = {
    /**
     * Creates a new live match document in Firestore
     * @param state The current match state
     * @returns The generated unique live match ID
     */
    createLiveMatch: async (state: MatchState): Promise<string> => {
        try {
            const matchId = generateMatchId();
            const matchRef = doc(db, MATCHES_COLLECTION, matchId);
            
            // Clean up functions or non-serializable data if any exist (though Zustand state is usually clean)
            const serializedState = JSON.parse(JSON.stringify(state));
            serializedState.lastUpdatedAt = new Date().toISOString();

            await setDoc(matchRef, serializedState);
            return matchId;
        } catch (error) {
            console.error("Error creating live match:", error);
            throw error;
        }
    },

    /**
     * Updates an existing live match document
     * @param matchId The unique match ID
     * @param state The current match state to sync
     */
    updateLiveMatch: async (matchId: string, state: MatchState): Promise<void> => {
        if (!matchId) return;
        
        try {
            const matchRef = doc(db, MATCHES_COLLECTION, matchId);
            const serializedState = JSON.parse(JSON.stringify(state));
            serializedState.lastUpdatedAt = new Date().toISOString();

            await updateDoc(matchRef, serializedState);
        } catch (error) {
            console.error("Error updating live match:", error);
        }
    },

    /**
     * Subscribes to real-time updates for a specific match
     * @param matchId The unique match ID to listen to
     * @param onUpdate Callback fired when the document changes
     * @param onError Callback fired if an error occurs
     * @returns An unsubscribe function to stop listening
     */
    subscribeToMatch: (
        matchId: string, 
        onUpdate: (state: MatchState) => void, 
        onError?: (error: any) => void
    ) => {
        const matchRef = doc(db, MATCHES_COLLECTION, matchId);
        
        return onSnapshot(
            matchRef, 
            (docSnapshot) => {
                if (docSnapshot.exists()) {
                    onUpdate(docSnapshot.data() as MatchState);
                } else {
                    if (onError) onError(new Error("Match not found"));
                }
            },
            (error) => {
                console.error("Subscription error:", error);
                if (onError) onError(error);
            }
        );
    },

    /**
     * Fetches a match state once without subscribing
     */
    getMatch: async (matchId: string): Promise<MatchState | null> => {
        try {
            const matchRef = doc(db, MATCHES_COLLECTION, matchId);
            const docSnap = await getDoc(matchRef);
            if (docSnap.exists()) {
                return docSnap.data() as MatchState;
            }
            return null;
        } catch (error) {
            console.error("Error fetching match:", error);
            throw error;
        }
    },

    /**
     * Deletes a match document from Firestore
     * @param matchId The unique match ID
     */
    deleteMatch: async (matchId: string): Promise<void> => {
        if (!matchId) return;
        try {
            const matchRef = doc(db, MATCHES_COLLECTION, matchId);
            await deleteDoc(matchRef);
        } catch (error) {
            console.error("Error deleting live match:", error);
            throw error;
        }
    }
};
