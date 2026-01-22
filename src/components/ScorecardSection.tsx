import React from 'react';
import { View, Text } from 'react-native';
import { InningsState, Player } from '../types/match';

// Helper to calc extras
const calculateExtras = (innings: InningsState) => {
    let wide = 0, noBall = 0, bye = 0, legBye = 0;
    const allBalls = [...innings.overs.flatMap(o => o.balls), ...innings.currentOver];

    allBalls.forEach(ball => {
        switch (ball.extraType) {
            case 'wide': wide += ball.runs; break;
            case 'no-ball': noBall += ball.runs; break;
            case 'bye': bye += ball.runs; break;
            case 'leg-bye': legBye += ball.runs; break;
        }
    });

    return { wide, noBall, bye, legBye, total: wide + noBall + bye + legBye };
};

export const ScorecardSection = ({
    title,
    innings,
    battingTeamPlayers,
    bowlingTeamPlayers
}: {
    title: string,
    innings: InningsState,
    battingTeamPlayers: Player[],
    bowlingTeamPlayers: Player[]
}) => {
    const validBalls = innings.currentOver.filter(b => b.isValidBall).length;
    const totalOvers = `${innings.overs.length}.${validBalls}`;

    return (
        <View className="mb-6 bg-gray-800 rounded-xl overflow-hidden">
            <View className="bg-gray-700 p-3 flex-row justify-between items-center">
                <Text className="text-white font-bold text-lg">{title}</Text>
                <Text className="text-gray-300 font-bold">{innings.totalRuns}/{innings.totalWickets} ({totalOvers} Ov)</Text>
            </View>

            {/* Batting Header */}
            <View className="flex-row bg-gray-800 p-2 border-b border-gray-700">
                <Text className="flex-[3] text-gray-400 text-xs uppercase font-bold">Batter</Text>
                <Text className="flex-1 text-gray-400 text-xs uppercase font-bold text-center">R</Text>
                <Text className="flex-1 text-gray-400 text-xs uppercase font-bold text-center">B</Text>
                <Text className="flex-1 text-gray-400 text-xs uppercase font-bold text-center">4s</Text>
                <Text className="flex-1 text-gray-400 text-xs uppercase font-bold text-center">6s</Text>
                <Text className="flex-1 text-gray-400 text-xs uppercase font-bold text-center">SR</Text>
            </View>

            {battingTeamPlayers.map(player => {
                const stats = innings.battingStats[player.id];
                if (!stats && !innings.battingStats[player.id]) return null;
                if (!stats) return null;

                const sr = stats.ballsFaced > 0 ? ((stats.runs / stats.ballsFaced) * 100).toFixed(0) : "0";
                return (
                    <View key={player.id} className="flex-row p-3 border-b border-gray-700/50">
                        <View className="flex-[3] pr-2">
                            <Text className="text-white font-medium">{player.name}</Text>
                            {stats.isOut ? (
                                <Text className="text-gray-500 text-[10px] leading-tight mt-0.5">
                                    {stats.dismissal === 'bowled' && `b ${bowlingTeamPlayers.find(p => p.id === stats.bowlerId)?.name || 'Bowler'}`}
                                    {stats.dismissal === 'caught' && `c ${bowlingTeamPlayers.find(p => p.id === stats.fielderId)?.name || 'Fielder'} b ${bowlingTeamPlayers.find(p => p.id === stats.bowlerId)?.name || 'Bowler'}`}
                                    {stats.dismissal === 'lbw' && `lbw b ${bowlingTeamPlayers.find(p => p.id === stats.bowlerId)?.name || 'Bowler'}`}
                                    {stats.dismissal === 'run-out' && `run out (${bowlingTeamPlayers.find(p => p.id === stats.fielderId)?.name || 'Fielder'})`}
                                    {stats.dismissal === 'stumped' && `st ${bowlingTeamPlayers.find(p => p.id === stats.fielderId)?.name || 'Fielder'} b ${bowlingTeamPlayers.find(p => p.id === stats.bowlerId)?.name || 'Bowler'}`}
                                    {stats.dismissal === 'retired-hurt' && 'retired hurt'}
                                    {stats.dismissal === 'other' && 'out'}
                                    {(!stats.dismissal || stats.dismissal === 'none') && 'out'}
                                </Text>
                            ) : (
                                <Text className="text-blue-400 text-[10px] font-bold mt-0.5">not out</Text>
                            )}
                        </View>
                        <Text className="flex-1 text-white font-bold text-center">{stats.runs}</Text>
                        <Text className="flex-1 text-gray-400 text-center">{stats.ballsFaced}</Text>
                        <Text className="flex-1 text-gray-400 text-center">{stats.fours}</Text>
                        <Text className="flex-1 text-gray-400 text-center">{stats.sixes}</Text>
                        <Text className="flex-1 text-gray-400 text-center">{sr}</Text>
                    </View>
                );
            })}

            {/* Extras Row */}
            {(() => {
                const extras = calculateExtras(innings);
                return (
                    <View className="flex-row justify-between p-3 border-b border-gray-700 bg-gray-600/20">
                        <Text className="text-gray-300 font-bold">Extras</Text>
                        <Text className="text-white">
                            {extras.total} (wd {extras.wide}, nb {extras.noBall}, b {extras.bye}, lb {extras.legBye})
                        </Text>
                    </View>
                );
            })()}

            {/* Total Row */}
            <View className="flex-row justify-between p-3 border-b border-gray-700 bg-gray-900/40">
                <Text className="text-white font-black text-lg">Total</Text>
                <Text className="text-white font-black text-lg">
                    {innings.totalRuns}/{innings.totalWickets} <Text className="text-base text-gray-400 font-normal">({totalOvers} Ov)</Text>
                </Text>
            </View>

            {/* Bowling Header */}
            <View className="flex-row bg-gray-700 p-2 mt-4">
                <Text className="flex-[3] text-gray-300 text-xs uppercase font-bold">Bowler</Text>
                <Text className="flex-1 text-gray-300 text-xs uppercase font-bold text-center">O</Text>
                <Text className="flex-1 text-gray-300 text-xs uppercase font-bold text-center">M</Text>
                <Text className="flex-1 text-gray-300 text-xs uppercase font-bold text-center">R</Text>
                <Text className="flex-1 text-gray-300 text-xs uppercase font-bold text-center">W</Text>
                <Text className="flex-1 text-gray-300 text-xs uppercase font-bold text-center">Eco</Text>
            </View>

            {bowlingTeamPlayers.map(player => {
                const stats = innings.bowlingStats[player.id];
                if (!stats) return null;

                const economy = stats.overs > 0
                    ? (stats.runsConceded / (stats.overs + (stats.balls % 6) / 6)).toFixed(1)
                    : "0.0";

                const oversDisplay = `${stats.overs}.${stats.balls % 6}`;

                return (
                    <View key={player.id} className="flex-row p-3 border-b border-gray-700/50">
                        <Text className="flex-[3] text-white font-medium">{player.name}</Text>
                        <Text className="flex-1 text-gray-400 text-center">{oversDisplay}</Text>
                        <Text className="flex-1 text-gray-400 text-center">{stats.maidens}</Text>
                        <Text className="flex-1 text-gray-400 text-center">{stats.runsConceded}</Text>
                        <Text className="flex-1 text-white font-bold text-center">{stats.wickets}</Text>
                        <Text className="flex-1 text-gray-400 text-center">{economy}</Text>
                    </View>
                );
            })}
        </View>
    );
};
