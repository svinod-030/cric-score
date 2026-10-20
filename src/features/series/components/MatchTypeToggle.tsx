import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';

interface MatchTypeToggleProps {
    isSeries: boolean;
    onChange: (isSeries: boolean) => void;
}

// Chooses between a single match and a series of matches between the same two teams.
export const MatchTypeToggle = ({ isSeries, onChange }: MatchTypeToggleProps) => {
    const { t } = useTranslation();

    const option = (label: string, selected: boolean, value: boolean) => (
        <TouchableOpacity
            onPress={() => onChange(value)}
            className={`flex-1 p-3 rounded-xl border ${selected ? 'bg-blue-600 border-blue-500' : 'bg-gray-700 border-gray-600'}`}
        >
            <Text className="text-white text-center font-bold">{label}</Text>
        </TouchableOpacity>
    );

    return (
        <View className="mb-6">
            <Text className="text-lg font-semibold text-gray-300 mb-2">{t('common.matchType')}</Text>
            <View className="flex-row gap-4">
                {option(t('common.individualMatch'), !isSeries, false)}
                {option(t('common.series'), isSeries, true)}
            </View>
        </View>
    );
};
