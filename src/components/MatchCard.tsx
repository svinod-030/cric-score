import React from 'react';
import { View, Text, Image } from 'react-native';
import { MatchState } from '../types/match';

interface MatchCardProps {
    state: MatchState;
    matchId: string;
    t: any;
}

export const MatchCard: React.FC<MatchCardProps> = ({ state, matchId, t }) => {
    if (!matchId) return <View style={{ width: 350, height: 400, backgroundColor: '#111827' }} />;
    
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${matchId}`;

    return (
        <View className="bg-gray-900 p-8 items-center w-[350px]">
            <View className="bg-blue-600/20 px-3 py-1 rounded-full mb-4">
                <Text className="text-blue-500 font-black uppercase tracking-widest text-[10px]">{t('common.liveMatch')}</Text>
            </View>

            <View className="flex-row items-center justify-between w-full mb-6">
                <View className="flex-1 items-center">
                    <Text className="text-white font-black text-xl text-center" numberOfLines={1}>{state.teamA}</Text>
                </View>
                <View className="mx-4 items-center">
                    <Text className="text-gray-700 font-black text-2xl">VS</Text>
                </View>
                <View className="flex-1 items-center">
                    <Text className="text-white font-black text-xl text-center" numberOfLines={1}>{state.teamB}</Text>
                </View>
            </View>

            <View className="bg-white p-3 rounded-2xl mb-4 shadow-xl">
                <Image
                    source={{ uri: qrUrl }}
                    style={{ width: 220, height: 220 }}
                />
            </View>

            <View className="items-center">
                <Text className="text-gray-500 text-[10px] uppercase font-bold tracking-[3px] mb-1">{t('common.matchIdLabel')}</Text>
                <Text className="text-white font-black text-3xl tracking-[6px] mb-2">{matchId}</Text>
                <Text className="text-gray-400 text-center text-[10px] px-8 leading-4">{t('common.enterMatchIdDescription')}</Text>
            </View>

            <View className="mt-10 pt-6 border-t border-gray-800 w-full items-center">
                <Text className="text-gray-600 text-[10px] font-bold uppercase tracking-widest">Cric-Score</Text>
            </View>
        </View>
    );
};
