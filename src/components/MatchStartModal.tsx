import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, Alert, StyleSheet } from 'react-native';
import { Player } from '../types/match';
import { Ionicons } from '@expo/vector-icons';
import { Dropdown as ElementDropdown } from 'react-native-element-dropdown';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '../hooks/useAppTheme';

interface MatchStartModalProps {
    visible: boolean;
    battingTeamPlayers: Player[];
    bowlingTeamPlayers: Player[];
    onStart: (strikerId: string, nonStrikerId: string, bowlerId: string) => void;
    title: string;
}

export const MatchStartModal = ({ visible, battingTeamPlayers, bowlingTeamPlayers, onStart, title }: MatchStartModalProps) => {
    const { t } = useTranslation();
    const { isDark } = useAppTheme();
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
            Alert.alert(t('common.incompleteSelection'), t('common.pleaseSelectPlayers'));
            return;
        }
        if (strikerId === nonStrikerId) {
            Alert.alert(t('common.invalidSelection'), t('common.strikerNonStrikerSame'));
            return;
        }
        onStart(strikerId, nonStrikerId, bowlerId);
    };

    const renderDropdownItem = (item: { label: string, value: string }) => {
        return (
            <View style={[styles.dropdownItem, { backgroundColor: isDark ? '#1f2937' : '#f9fafb', borderBottomColor: isDark ? '#374151' : '#e5e7eb' }]}>
                <Text style={[styles.dropdownItemText, { color: isDark ? '#ffffff' : '#111827' }]}>{item.label}</Text>
            </View>
        );
    };

    const playerToOption = (player: Player) => ({
        label: player.name,
        value: player.id
    });

    const dropdownStyle = {
        ...styles.dropdown,
        backgroundColor: isDark ? '#1f2937' : '#f3f4f6',
        borderColor: isDark ? '#374151' : '#d1d5db',
    };

    const containerStyle = {
        ...styles.containerStyle,
        backgroundColor: isDark ? '#111827' : '#ffffff',
        borderColor: isDark ? '#374151' : '#d1d5db',
    };

    const placeholderStyle = {
        ...styles.placeholderStyle,
        color: isDark ? '#6b7280' : '#9ca3af',
    };

    const selectedTextStyle = {
        ...styles.selectedTextStyle,
        color: isDark ? '#ffffff' : '#111827',
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={() => { }} // Block back button
        >
            <View className="flex-1 bg-black/90 justify-center p-4">
                <View className={`rounded-3xl p-6 border w-full max-w-lg self-center ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
                    <Text className={`text-2xl font-black mb-6 text-center ${isDark ? 'text-white' : 'text-gray-900'}`}>{title}</Text>

                    <Text className={`mb-2 font-bold uppercase text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('common.striker')}</Text>
                    <ElementDropdown
                        style={dropdownStyle}
                        placeholderStyle={placeholderStyle}
                        selectedTextStyle={selectedTextStyle}
                        containerStyle={containerStyle}
                        data={battingTeamPlayers.filter(p => p.id !== nonStrikerId).map(playerToOption)}
                        maxHeight={300}
                        labelField="label"
                        valueField="value"
                        placeholder={`${t('common.selectStriker')}...`}
                        value={strikerId}
                        onChange={item => setStrikerId(item.value)}
                        renderItem={renderDropdownItem}
                        renderRightIcon={() => (
                            <Ionicons name="chevron-down" size={20} color={isDark ? '#9ca3af' : '#6b7280'} />
                        )}
                    />

                    <Text className={`mt-4 mb-2 font-bold uppercase text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('common.nonStriker')}</Text>
                    <ElementDropdown
                        style={dropdownStyle}
                        placeholderStyle={placeholderStyle}
                        selectedTextStyle={selectedTextStyle}
                        containerStyle={containerStyle}
                        data={battingTeamPlayers.filter(p => p.id !== strikerId).map(playerToOption)}
                        maxHeight={300}
                        labelField="label"
                        valueField="value"
                        placeholder={`${t('common.selectNonStriker')}...`}
                        value={nonStrikerId}
                        onChange={item => setNonStrikerId(item.value)}
                        renderItem={renderDropdownItem}
                        renderRightIcon={() => (
                            <Ionicons name="chevron-down" size={20} color={isDark ? '#9ca3af' : '#6b7280'} />
                        )}
                    />

                    <View className={`h-[1px] my-6 ${isDark ? 'bg-gray-800' : 'bg-gray-200'}`} />

                    <Text className={`mb-2 font-bold uppercase text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('common.openingBowler')}</Text>
                    <ElementDropdown
                        style={dropdownStyle}
                        placeholderStyle={placeholderStyle}
                        selectedTextStyle={selectedTextStyle}
                        containerStyle={containerStyle}
                        data={bowlingTeamPlayers.map(playerToOption)}
                        maxHeight={300}
                        labelField="label"
                        valueField="value"
                        placeholder={`${t('common.selectBowler')}...`}
                        value={bowlerId}
                        onChange={item => setBowlerId(item.value)}
                        renderItem={renderDropdownItem}
                        renderRightIcon={() => (
                            <Ionicons name="chevron-down" size={20} color={isDark ? '#9ca3af' : '#6b7280'} />
                        )}
                    />

                    <TouchableOpacity
                        onPress={handleStart}
                        className={`mt-10 p-4 rounded-xl items-center ${(strikerId && nonStrikerId && bowlerId)
                            ? 'bg-green-600 shadow-lg shadow-green-900/50'
                            : isDark ? 'bg-gray-700' : 'bg-gray-200'
                            }`}
                        disabled={!strikerId || !nonStrikerId || !bowlerId}
                    >
                        <Text className={`text-lg font-bold ${(strikerId && nonStrikerId && bowlerId) ? 'text-white' : isDark ? 'text-gray-500' : 'text-gray-400'
                            }`}>
                            {t('common.startInnings')}
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
        borderRadius: 12,
        paddingHorizontal: 16,
        borderWidth: 1,
    },
    placeholderStyle: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    selectedTextStyle: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    containerStyle: {
        borderRadius: 12,
        borderWidth: 1,
        marginTop: 4,
        overflow: 'hidden',
    },
    dropdownItem: {
        padding: 16,
        borderBottomWidth: 1,
    },
    dropdownItemText: {
        fontWeight: '500',
    },
});
