import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const licenses = [
    {
        name: 'React Native',
        version: '0.73.6', // Updated based on package.json if needed, using placeholder for now
        license: 'MIT',
        copyright: 'Copyright (c) Meta Platforms, Inc. and affiliates.',
        url: 'https://github.com/facebook/react-native/blob/main/LICENSE'
    },
    {
        name: 'Expo',
        version: '~51.0.8',
        license: 'MIT',
        copyright: 'Copyright (c) 2015-present 650 Industries, Inc. (aka Expo)',
        url: 'https://github.com/expo/expo/blob/main/LICENSE'
    },
    {
        name: 'React Navigation',
        version: '^6.x',
        license: 'MIT',
        copyright: 'Copyright (c) 2017-present, Callstack and other contributors.',
        url: 'https://github.com/react-navigation/react-navigation/blob/main/LICENSE'
    },
    {
        name: 'Zustand',
        version: '^4.5.2',
        license: 'MIT',
        copyright: 'Copyright (c) 2019 Paul Henschel',
        url: 'https://github.com/pmndrs/zustand/blob/main/LICENSE'
    },
    {
        name: 'NativeWind',
        version: '^4.0.1',
        license: 'MIT',
        copyright: 'Copyright (c) 2022 Mark Lawlor',
        url: 'https://github.com/marklawlor/nativewind/blob/main/LICENSE'
    },
    {
        name: 'Tailwind CSS',
        version: '^3.3.2',
        license: 'MIT',
        copyright: 'Copyright (c) Tailwind Labs, Inc.',
        url: 'https://github.com/tailwindlabs/tailwindcss/blob/master/LICENSE'
    },
    {
        name: 'React Native Async Storage',
        version: '^1.23.1',
        license: 'MIT',
        copyright: 'Copyright (c) 2015-present, Facebook, Inc.',
        url: 'https://github.com/react-native-async-storage/async-storage/blob/main/LICENSE'
    },
    {
        name: 'React Native Safe Area Context',
        version: '4.10.1',
        license: 'MIT',
        copyright: 'Copyright (c) 2019-present Th3rd Wave',
        url: 'https://github.com/th3rdwave/react-native-safe-area-context/blob/main/LICENSE'
    },
    {
        name: 'React Native Screens',
        version: '~3.31.1',
        license: 'MIT',
        copyright: 'Copyright (c) 2018-present Software Mansion',
        url: 'https://github.com/software-mansion/react-native-screens/blob/main/LICENSE'
    }
];

export default function LicensesScreen({ navigation }: any) {
    return (
        <SafeAreaView className="flex-1 bg-gray-900">
            <View className="flex-row items-center p-4 border-b border-gray-800">
                <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <Text className="text-white text-xl font-bold">Open Source Licenses</Text>
            </View>

            <ScrollView className="flex-1 p-4">
                <Text className="text-gray-400 mb-6">
                    The following sets forth attribution notices for third party software that may be contained in this application.
                </Text>

                {licenses.map((lib, index) => (
                    <TouchableOpacity
                        key={index}
                        className="bg-gray-800 p-4 rounded-xl mb-3 border border-gray-700"
                        onPress={() => Linking.openURL(lib.url)}
                    >
                        <View className="flex-row justify-between items-center mb-1">
                            <Text className="text-white font-bold text-lg">{lib.name}</Text>
                            <Text className="text-gray-500 text-xs">{lib.license}</Text>
                        </View>
                        <Text className="text-gray-400 text-sm mb-2">{lib.copyright}</Text>
                        <Text className="text-blue-500 text-xs">View License</Text>
                    </TouchableOpacity>
                ))}

                <View className="h-10" />
            </ScrollView>
        </SafeAreaView>
    );
}
