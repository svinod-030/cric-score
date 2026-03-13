import React, { useEffect, useMemo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withDelay,
    withSequence,
    Easing,
    interpolate,
    Extrapolate
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const CONFETTI_COLORS = [
    '#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5',
    '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4caf50',
    '#8bc34a', '#cddc39', '#ffeb3b', '#ffc107', '#ff9800',
    '#ff5722', '#795548', '#9e9e9e', '#607d8b'
];

const NUM_CONFETTI = 150;

interface ConfettiPieceProps {
    index: number;
}

const ConfettiPiece: React.FC<ConfettiPieceProps> = ({ index }) => {
    // Start from bottom center area
    const originX = SCREEN_WIDTH / 2 + (Math.random() - 0.5) * 100;
    const originY = SCREEN_HEIGHT + 20;

    const translateX = useSharedValue(originX);
    const translateY = useSharedValue(originY);
    const rotation = useSharedValue(Math.random() * 360);
    const scale = useSharedValue(Math.random() * 0.5 + 0.5);

    const color = useMemo(() => CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)], []);
    const size = useMemo(() => Math.random() * 10 + 6, []);
    
    // Variance in target X to create a spread effect
    const targetX = originX + (Math.random() - 0.5) * (SCREEN_WIDTH * 1.5);
    const peakY = SCREEN_HEIGHT * (0.1 + Math.random() * 0.3); // High peak between 10% and 40% of screen height

    useEffect(() => {
        const upDuration = 800 + Math.random() * 400;
        const downDuration = 2000 + Math.random() * 1000;
        const delay = Math.random() * 800;

        translateX.value = withDelay(delay, withTiming(targetX, {
            duration: upDuration + downDuration,
            easing: Easing.linear
        }));

        translateY.value = withDelay(delay, withSequence(
            withTiming(peakY, {
                duration: upDuration,
                easing: Easing.out(Easing.quad)
            }),
            withTiming(SCREEN_HEIGHT + 50, {
                duration: downDuration,
                easing: Easing.in(Easing.quad)
            })
        ));

        rotation.value = withDelay(delay, withTiming(rotation.value + 1440, {
            duration: upDuration + downDuration,
            easing: Easing.linear
        }));
    }, []);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [
                { translateX: translateX.value },
                { translateY: translateY.value },
                { rotate: `${rotation.value}deg` },
                { scale: scale.value }
            ],
            opacity: interpolate(
                translateY.value,
                [SCREEN_HEIGHT - 100, SCREEN_HEIGHT],
                [1, 0],
                Extrapolate.CLAMP
            )
        };
    });

    return (
        <Animated.View
            style={[
                styles.confetti,
                {
                    backgroundColor: color,
                    width: size,
                    height: size * (Math.random() > 0.5 ? 1.5 : 1),
                    borderRadius: Math.random() > 0.6 ? size : 2,
                },
                animatedStyle
            ]}
        />
    );
};

export const Confetti: React.FC = () => {
    return (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
            {Array.from({ length: NUM_CONFETTI }).map((_, i) => (
                <ConfettiPiece key={i} index={i} />
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    confetti: {
        position: 'absolute',
        top: 0,
        left: 0,
    }
});
