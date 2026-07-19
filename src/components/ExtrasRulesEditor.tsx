import React from 'react';
import { View, Text, TouchableOpacity, Switch } from 'react-native';
import { useTranslation } from 'react-i18next';

export interface ExtrasRulesValues {
    runsForWide: number;
    runsForNoBall: number;
    reballForWide: boolean;
    reballForNoBall: boolean;
}

interface ExtrasRulesEditorProps {
    values: ExtrasRulesValues;
    onChange: (patch: Partial<ExtrasRulesValues>) => void;
}

const Stepper = ({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) => (
    <View className="flex-row justify-between items-center mb-4">
        <Text className="text-gray-300 flex-1 pr-2">{label}</Text>
        <View className="flex-row items-center gap-3">
            <TouchableOpacity
                onPress={() => onChange(Math.max(0, value - 1))}
                className="w-8 h-8 bg-gray-700 rounded-full items-center justify-center"
            >
                <Text className="text-white text-xl">-</Text>
            </TouchableOpacity>
            <Text className="text-white text-lg font-bold w-6 text-center">{value}</Text>
            <TouchableOpacity
                onPress={() => onChange(value + 1)}
                className="w-8 h-8 bg-blue-600 rounded-full items-center justify-center"
            >
                <Text className="text-white text-xl">+</Text>
            </TouchableOpacity>
        </View>
    </View>
);

// Shared editor for extras rules: lets the user pick any run value for Wide/No Ball
// (default 1, but common junior/box-cricket rules use 2 or more) and whether an
// extra/re-ball is bowled for each. Reused by both the pre-match setup screen and
// the mid-match "Match Settings" editor so the two stay in sync visually.
export const ExtrasRulesEditor = ({ values, onChange }: ExtrasRulesEditorProps) => {
    const { t } = useTranslation();
    return (
        <View>
            <Stepper
                label={t('common.runForWide')}
                value={values.runsForWide}
                onChange={(v) => onChange({ runsForWide: v })}
            />
            <Stepper
                label={t('common.runForNoBall')}
                value={values.runsForNoBall}
                onChange={(v) => onChange({ runsForNoBall: v })}
            />
            <View className="flex-row justify-between items-center mb-4">
                <Text className="text-gray-300">{t('common.reballForWide')}</Text>
                <Switch
                    value={values.reballForWide}
                    onValueChange={(v) => onChange({ reballForWide: v })}
                    trackColor={{ false: "#374151", true: "#2563EB" }}
                    thumbColor="#fff"
                />
            </View>
            <View className="flex-row justify-between items-center">
                <Text className="text-gray-300">{t('common.reballForNoBall')}</Text>
                <Switch
                    value={values.reballForNoBall}
                    onValueChange={(v) => onChange({ reballForNoBall: v })}
                    trackColor={{ false: "#374151", true: "#2563EB" }}
                    thumbColor="#fff"
                />
            </View>
        </View>
    );
};
