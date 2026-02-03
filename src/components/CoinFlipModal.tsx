import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withSequence,
    runOnJS,
    Easing
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

interface CoinFlipModalProps {
    isVisible: boolean;
    onClose: () => void;
    onResult: (winnerKey: 'teamA' | 'teamB') => void;
    teamAName: string;
    teamBName: string;
}

export const CoinFlipModal: React.FC<CoinFlipModalProps> = ({
    isVisible,
    onClose,
    onResult,
    teamAName,
    teamBName
}) => {
    const [isFlipping, setIsFlipping] = useState(false);
    const [result, setResult] = useState<'teamA' | 'teamB' | null>(null);

    const rotation = useSharedValue(0);
    const scale = useSharedValue(1);

    const handleFlip = () => {
        if (isFlipping) return;

        setIsFlipping(true);
        setResult(null);

        const winner = Math.random() > 0.5 ? 'teamA' : 'teamB';
        const rotations = 5 + Math.floor(Math.random() * 5); // 5-10 full rotations
        const finalRotation = rotations * 2 * Math.PI + (winner === 'teamA' ? 0 : Math.PI);

        rotation.value = 0;
        scale.value = 1;

        rotation.value = withTiming(finalRotation, {
            duration: 2000,
            easing: Easing.bezier(0.4, 0, 0.2, 1),
        }, (finished) => {
            if (finished) {
                runOnJS(setIsFlipping)(false);
                runOnJS(setResult)(winner);
            }
        });

        scale.value = withSequence(
            withTiming(1.5, { duration: 1000 }),
            withTiming(1, { duration: 1000 })
        );
    };

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [
                { rotateY: `${rotation.value}rad` },
                { scale: scale.value }
            ],
        };
    });

    const backAnimatedStyle = useAnimatedStyle(() => {
        return {
            transform: [
                { rotateY: `${rotation.value + Math.PI}rad` },
                { scale: scale.value }
            ],
        };
    });

    const handleDone = () => {
        if (result) {
            onResult(result);
            onClose();
        }
    };

    return (
        <Modal
            transparent
            visible={isVisible}
            animationType="fade"
            onRequestClose={onClose}
        >
            <View className="flex-1 justify-center items-center bg-black/80 p-6">
                <View className="bg-gray-900 w-full rounded-3xl p-8 border border-gray-800 items-center">
                    <Text className="text-2xl font-bold text-white mb-2">Online Toss</Text>
                    <Text className="text-gray-400 text-center mb-10">
                        Feeling lucky? Flip the digital coin to decide who wins the toss!
                    </Text>

                    <View className="h-48 justify-center items-center mb-10 w-full">
                        <View style={{ width: 120, height: 120 }}>
                            {/* Front Side */}
                            <Animated.View
                                style={[
                                    styles.coin,
                                    animatedStyle,
                                    { backfaceVisibility: 'hidden', position: 'absolute' }
                                ]}
                                className="bg-yellow-500 rounded-full items-center justify-center border-4 border-yellow-400 shadow-2xl shadow-yellow-500/50"
                            >
                                <Ionicons name="trophy" size={60} color="#92400E" />
                            </Animated.View>

                            {/* Back Side */}
                            <Animated.View
                                style={[
                                    styles.coin,
                                    backAnimatedStyle,
                                    { backfaceVisibility: 'hidden', position: 'absolute' }
                                ]}
                                className="bg-yellow-600 rounded-full items-center justify-center border-4 border-yellow-500 shadow-2xl shadow-yellow-600/50"
                            >
                                <Ionicons name="medal" size={60} color="#78350F" />
                            </Animated.View>
                        </View>
                    </View>

                    {result ? (
                        <View className="items-center mb-8">
                            <Text className="text-gray-400 text-sm mb-1 uppercase tracking-widest font-bold">Winner</Text>
                            <Text className="text-green-500 text-3xl font-black text-center">
                                {result === 'teamA' ? teamAName : teamBName}
                            </Text>
                            <Text className="text-gray-500 text-xs mt-2 italic">Congratulations!</Text>
                        </View>
                    ) : (
                        <View className="h-20" />
                    )}

                    <View className="flex-row gap-4 w-full">
                        <TouchableOpacity
                            onPress={onClose}
                            disabled={isFlipping}
                            className="flex-1 bg-gray-800 p-4 rounded-xl items-center border border-gray-700"
                        >
                            <Text className="text-gray-300 font-bold">Cancel</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={handleFlip}
                            disabled={isFlipping}
                            className={`flex-2 p-4 rounded-xl items-center shadow-lg shadow-blue-500/30 ${isFlipping ? 'bg-blue-600/50' : 'bg-blue-600'}`}
                        >
                            <Text className="text-white font-bold">{isFlipping ? 'Flipping...' : 'Flip Coin'}</Text>
                        </TouchableOpacity>

                        {result && (
                            <TouchableOpacity
                                onPress={handleDone}
                                className="flex-2 bg-green-600 p-4 rounded-xl items-center shadow-lg shadow-green-500/30"
                            >
                                <Text className="text-white font-bold">Use Result</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    coin: {
        width: 120,
        height: 120,
        backfaceVisibility: 'hidden',
    }
});
