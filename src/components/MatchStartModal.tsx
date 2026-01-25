import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, Alert } from 'react-native';
import { Player } from '../types/match';
import { Ionicons } from '@expo/vector-icons';

interface MatchStartModalProps {
    visible: boolean;
    battingTeamPlayers: Player[];
    bowlingTeamPlayers: Player[];
    onStart: (strikerId: string, nonStrikerId: string, bowlerId: string) => void;
    title: string;
}

export const MatchStartModal = ({ visible, battingTeamPlayers, bowlingTeamPlayers, onStart, title }: MatchStartModalProps) => {
    const [strikerId, setStrikerId] = useState<string | null>(battingTeamPlayers[0].id);
    const [nonStrikerId, setNonStrikerId] = useState<string | null>(battingTeamPlayers[1].id);
    const [bowlerId, setBowlerId] = useState<string | null>(bowlingTeamPlayers[0].id);

    // Reset state when modal becomes visible
    useEffect(() => {
        if (visible) {
            setStrikerId(battingTeamPlayers[0].id);
            setNonStrikerId(battingTeamPlayers[1].id);
            setBowlerId(bowlingTeamPlayers[0].id);
        }
    }, [visible]);

    const handleStart = () => {
        if (!strikerId || !nonStrikerId || !bowlerId) {
            Alert.alert("Incomplete Selection", "Please select Striker, Non-Striker, and Bowler.");
            return;
        }
        if (strikerId === nonStrikerId) {
            Alert.alert("Invalid Selection", "Striker and Non-Striker cannot be the same player.");
            return;
        }
        onStart(strikerId, nonStrikerId, bowlerId);
    };

    const Dropdown = ({
        label,
        options,
        selectedId,
        onSelect,
        disabledIds = []
    }: {
        label: string,
        options: Player[],
        selectedId: string | null,
        onSelect: (id: string) => void,
        disabledIds?: string[]
    }) => {
        const [isOpen, setIsOpen] = useState(false);
        const selectedOption = options.find(p => p.id === selectedId);

        return (
            <View className="mb-4 z-10">
                <Text className="text-gray-400 mb-2 font-bold uppercase text-xs">{label}</Text>

                <TouchableOpacity
                    onPress={() => setIsOpen(!isOpen)}
                    className={` bg-gray-800 border border-gray-700 p-4 rounded-xl flex-row justify-between items-center ${isOpen ? 'border-blue-500' : ''}`}
                >
                    <Text className={`font-bold ${selectedId ? 'text-white' : 'text-gray-500'}`}>
                        {selectedOption ? selectedOption.name : "Select Player..."}
                    </Text>
                    <Ionicons name={isOpen ? "chevron-up" : "chevron-down"} size={20} color="#9ca3af" />
                </TouchableOpacity>

                {isOpen && (
                    <View className="bg-gray-800 border border-gray-700 rounded-xl mt-2 overflow-hidden max-h-60 absolute top-full w-full z-20 shadow-xl shadow-black">
                        <ScrollView nestedScrollEnabled={true}>
                            {options.map(player => {
                                const isDisabled = disabledIds.includes(player.id);
                                if (isDisabled) return null; // Don't show already selected players

                                return (
                                    <TouchableOpacity
                                        key={player.id}
                                        onPress={() => {
                                            onSelect(player.id);
                                            setIsOpen(false);
                                        }}
                                        className="p-4 border-b border-gray-700 active:bg-gray-700"
                                    >
                                        <Text className="text-white font-medium">{player.name}</Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>
                    </View>
                )}
            </View>
        );
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={() => { }} // Block back button
        >
            <View className="flex-1 bg-black/90 justify-center p-4">
                <View className="bg-gray-900 rounded-3xl p-6 border border-gray-800 w-full max-w-lg self-center">
                    <Text className="text-white text-2xl font-black mb-6 text-center">{title}</Text>

                    {/* Using z-index to ensure dropdowns stack correctly */}
                    <View style={{ zIndex: 30 }}>
                        <Dropdown
                            label="Striker"
                            options={battingTeamPlayers}
                            selectedId={strikerId}
                            onSelect={setStrikerId}
                            disabledIds={nonStrikerId ? [nonStrikerId] : []}
                        />
                    </View>

                    <View style={{ zIndex: 20 }}>
                        <Dropdown
                            label="Non-Striker"
                            options={battingTeamPlayers}
                            selectedId={nonStrikerId}
                            onSelect={setNonStrikerId}
                            disabledIds={strikerId ? [strikerId] : []}
                        />
                    </View>

                    <View className="h-[1px] bg-gray-800 my-4" />

                    <View style={{ zIndex: 10 }}>
                        <Dropdown
                            label="Opening Bowler"
                            options={bowlingTeamPlayers}
                            selectedId={bowlerId}
                            onSelect={setBowlerId}
                        />
                    </View>

                    <TouchableOpacity
                        onPress={handleStart}
                        className={`mt-8 p-4 rounded-xl items-center ${(strikerId && nonStrikerId && bowlerId)
                            ? 'bg-green-600 shadow-lg shadow-green-900/50'
                            : 'bg-gray-700'
                            }`}
                        disabled={!strikerId || !nonStrikerId || !bowlerId}
                    >
                        <Text className={`text-lg font-bold ${(strikerId && nonStrikerId && bowlerId) ? 'text-white' : 'text-gray-500'
                            }`}>
                            Start Innings
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};
