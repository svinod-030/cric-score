import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, Alert, StyleSheet } from 'react-native';
import { Player } from '../types/match';
import { Ionicons } from '@expo/vector-icons';
import { Dropdown as ElementDropdown } from 'react-native-element-dropdown';

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

    const renderDropdownItem = (item: { label: string, value: string }) => {
        return (
            <View className="p-4 bg-gray-800 border-b border-gray-700">
                <Text className="text-white font-medium">{item.label}</Text>
            </View>
        );
    };

    const playerToOption = (player: Player) => ({
        label: player.name,
        value: player.id
    });

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

                    <Text className="text-gray-400 mb-2 font-bold uppercase text-xs">Striker</Text>
                    <ElementDropdown
                        style={styles.dropdown}
                        placeholderStyle={styles.placeholderStyle}
                        selectedTextStyle={styles.selectedTextStyle}
                        containerStyle={styles.containerStyle}
                        data={battingTeamPlayers.filter(p => p.id !== nonStrikerId).map(playerToOption)}
                        maxHeight={300}
                        labelField="label"
                        valueField="value"
                        placeholder="Select Striker..."
                        value={strikerId}
                        onChange={item => setStrikerId(item.value)}
                        renderItem={renderDropdownItem}
                        renderRightIcon={() => (
                            <Ionicons name="chevron-down" size={20} color="#9ca3af" />
                        )}
                    />

                    <Text className="text-gray-400 mt-4 mb-2 font-bold uppercase text-xs">Non-Striker</Text>
                    <ElementDropdown
                        style={styles.dropdown}
                        placeholderStyle={styles.placeholderStyle}
                        selectedTextStyle={styles.selectedTextStyle}
                        containerStyle={styles.containerStyle}
                        data={battingTeamPlayers.filter(p => p.id !== strikerId).map(playerToOption)}
                        maxHeight={300}
                        labelField="label"
                        valueField="value"
                        placeholder="Select Non-Striker..."
                        value={nonStrikerId}
                        onChange={item => setNonStrikerId(item.value)}
                        renderItem={renderDropdownItem}
                        renderRightIcon={() => (
                            <Ionicons name="chevron-down" size={20} color="#9ca3af" />
                        )}
                    />

                    <View className="h-[1px] bg-gray-800 my-6" />

                    <Text className="text-gray-400 mb-2 font-bold uppercase text-xs">Opening Bowler</Text>
                    <ElementDropdown
                        style={styles.dropdown}
                        placeholderStyle={styles.placeholderStyle}
                        selectedTextStyle={styles.selectedTextStyle}
                        containerStyle={styles.containerStyle}
                        data={bowlingTeamPlayers.map(playerToOption)}
                        maxHeight={300}
                        labelField="label"
                        valueField="value"
                        placeholder="Select Bowler..."
                        value={bowlerId}
                        onChange={item => setBowlerId(item.value)}
                        renderItem={renderDropdownItem}
                        renderRightIcon={() => (
                            <Ionicons name="chevron-down" size={20} color="#9ca3af" />
                        )}
                    />

                    <TouchableOpacity
                        onPress={handleStart}
                        className={`mt-10 p-4 rounded-xl items-center ${(strikerId && nonStrikerId && bowlerId)
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

const styles = StyleSheet.create({
    dropdown: {
        height: 56,
        backgroundColor: '#1f2937', // gray-800
        borderRadius: 12,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: '#374151', // gray-700
    },
    placeholderStyle: {
        fontSize: 16,
        color: '#6b7280', // gray-500
        fontWeight: 'bold',
    },
    selectedTextStyle: {
        fontSize: 16,
        color: 'white',
        fontWeight: 'bold',
    },
    containerStyle: {
        backgroundColor: '#111827', // gray-900
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#374151', // gray-700
        marginTop: 4,
        overflow: 'hidden',
    },
});
