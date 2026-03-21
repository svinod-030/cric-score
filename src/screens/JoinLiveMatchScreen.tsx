import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    TouchableWithoutFeedback,
    Keyboard,
    Alert,
    StyleSheet,
    Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useMatchSync } from '../hooks/useMatchSync';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';

export default function JoinLiveMatchScreen({ navigation }: any) {
    const { t } = useTranslation();
    const [matchIdInput, setMatchIdInput] = useState('');
    const { joinMatch, isLoading, error } = useMatchSync();

    const [permission, requestPermission] = useCameraPermissions();
    const [scanned, setScanned] = useState(false);
    const [isScanning, setIsScanning] = useState(false);

    const handleRequestPermission = async () => {
        if (permission?.granted) {
            setIsScanning(true);
            setScanned(false);
            return;
        }

        const result = await requestPermission();
        if (result.granted) {
            setIsScanning(true);
            setScanned(false);
        } else {
            // Small delay to prevent "not attached to an Activity" warning on Android
            setTimeout(() => {
                Alert.alert(t('common.error'), t('common.allowCameraPermission'));
            }, 300);
        }
    };

    const handleBarCodeScanned = ({ type, data }: { type: string; data: string }) => {
        setScanned(true);
        setIsScanning(false);
        setMatchIdInput(data);
        // Automatically try to join if data looks like a match ID
        if (data && data.length >= 6) {
            handleJoin(data);
        }
    };

    const handleJoin = async (idToJoin?: string) => {
        const id = idToJoin || matchIdInput;
        if (!id.trim()) return;

        const success = await joinMatch(id.trim());
        if (success) {
            navigation.navigate('LiveViewer', { matchId: id.trim() });
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-900" edges={['bottom', 'left', 'right']}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1"
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="p-6">
                        <View className="items-center mt-10 mb-10">
                            <View className="bg-blue-600/20 p-6 rounded-full mb-6 shadow-2xl">
                                <Ionicons name="radio" size={60} color="#3b82f6" />
                            </View>
                            <Text className="text-white text-3xl font-black text-center uppercase tracking-widest">{t('common.joinLiveMatch')}</Text>
                            <Text className="text-gray-400 text-center mt-4 text-lg leading-6 px-4 font-medium italic">
                                {t('common.enterMatchIdDescription')}
                            </Text>
                        </View>

                        <View className="bg-gray-800 p-8 rounded-[40px] border border-gray-700 shadow-2xl mb-6">
                            <Text className="text-gray-500 text-[10px] font-black uppercase mb-4 tracking-[4px] ml-1">{t('common.matchIdLabel')}</Text>
                            <TextInput
                                value={matchIdInput}
                                onChangeText={setMatchIdInput}
                                placeholder="e.g. MATCH-123456"
                                placeholderTextColor="#4b5563"
                                className="bg-gray-900 text-white p-6 rounded-3xl border border-gray-700 font-black text-2xl mb-8 tracking-widest"
                                autoCapitalize="characters"
                                autoCorrect={false}
                                selectionColor="#3b82f6"
                            />

                            <View className="gap-4">
                                <TouchableOpacity
                                    onPress={() => handleJoin()}
                                    disabled={isLoading || !matchIdInput.trim()}
                                    className={`p-6 rounded-3xl items-center flex-row justify-center shadow-lg ${isLoading || !matchIdInput.trim() ? 'bg-blue-600/30' : 'bg-blue-600 active:bg-blue-700 shadow-blue-500/20'}`}
                                >
                                    {isLoading ? (
                                        <ActivityIndicator color="white" />
                                    ) : (
                                        <>
                                            <Ionicons name="play" size={24} color="#fff" />
                                            <Text className="text-white font-black ml-3 uppercase tracking-widest text-lg">{t('common.join')}</Text>
                                        </>
                                    )}
                                </TouchableOpacity>

                                <TouchableOpacity
                                    onPress={handleRequestPermission}
                                    className="p-6 rounded-3xl items-center flex-row justify-center border-2 border-dashed border-gray-600 bg-gray-900/50 active:bg-gray-700"
                                >
                                    <Ionicons name="qr-code-outline" size={24} color="#3b82f6" />
                                    <Text className="text-blue-500 font-black ml-3 uppercase tracking-widest text-lg">{t('common.scanToJoin')}</Text>
                                </TouchableOpacity>
                            </View>

                            {error && (
                                <View className="mt-8 bg-red-500/10 p-4 rounded-2xl border border-red-500/20 flex-row items-center justify-center">
                                    <Ionicons name="alert-circle" size={20} color="#ef4444" />
                                    <Text className="text-red-500 font-bold ml-2 text-sm">{error}</Text>
                                </View>
                            )}
                        </View>

                        <View className="flex-1 justify-end items-center mb-10">
                            <Text className="text-gray-700 text-[10px] font-bold uppercase tracking-[5px]">Cric-Score Live</Text>
                        </View>

                        {/* QR Scanner Overlay */}
                        {isScanning && (
                            <Modal
                                animationType="slide"
                                transparent={false}
                                visible={isScanning}
                                onRequestClose={() => setIsScanning(false)}
                            >
                                <View style={styles.scannerContainer}>
                                    <CameraView
                                        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
                                        style={StyleSheet.absoluteFillObject}
                                        barcodeScannerSettings={{
                                            barcodeTypes: ["qr"],
                                        }}
                                    />
                                    <View style={styles.overlay}>
                                        <View style={styles.header}>
                                            <TouchableOpacity
                                                onPress={() => setIsScanning(false)}
                                                className="p-4 rounded-full bg-black/40"
                                            >
                                                <Ionicons name="close" size={30} color="#fff" />
                                            </TouchableOpacity>
                                        </View>

                                        <View style={styles.scanFrame}>
                                            <View style={styles.cornerTopLeft} />
                                            <View style={styles.cornerTopRight} />
                                            <View style={styles.cornerBottomLeft} />
                                            <View style={styles.cornerBottomRight} />
                                        </View>

                                        <Text style={styles.scanText}>{t('common.scanToJoin')}</Text>
                                        <Text style={styles.scanSubText}>Align the QR code within the frame</Text>
                                    </View>
                                </View>
                            </Modal>
                        )}

                    </ScrollView>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    scannerContainer: {
        flex: 1,
        backgroundColor: '#000',
    },
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        position: 'absolute',
        top: 60,
        right: 20,
        zIndex: 10,
    },
    scanFrame: {
        width: 280,
        height: 280,
        backgroundColor: 'transparent',
    },
    cornerTopLeft: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: 40,
        height: 40,
        borderTopWidth: 4,
        borderLeftWidth: 4,
        borderColor: '#3b82f6',
        borderTopLeftRadius: 20,
    },
    cornerTopRight: {
        position: 'absolute',
        top: 0,
        right: 0,
        width: 40,
        height: 40,
        borderTopWidth: 4,
        borderRightWidth: 4,
        borderColor: '#3b82f6',
        borderTopRightRadius: 20,
    },
    cornerBottomLeft: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: 40,
        height: 40,
        borderBottomWidth: 4,
        borderLeftWidth: 4,
        borderColor: '#3b82f6',
        borderBottomLeftRadius: 20,
    },
    cornerBottomRight: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 40,
        height: 40,
        borderBottomWidth: 4,
        borderRightWidth: 4,
        borderColor: '#3b82f6',
        borderBottomRightRadius: 20,
    },
    scanText: {
        color: '#fff',
        fontSize: 22,
        fontWeight: '900',
        marginTop: 60,
        textAlign: 'center',
        textTransform: 'uppercase',
        letterSpacing: 2,
    },
    scanSubText: {
        color: '#9ca3af',
        fontSize: 14,
        marginTop: 10,
        textAlign: 'center',
        fontWeight: 'bold',
    }
});
