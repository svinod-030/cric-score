import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useIAP, isUserCancelledError } from 'expo-iap';
import type { Purchase } from 'expo-iap';
import { Confetti } from '../../components/Confetti';
import { DONATION_PRODUCT_IDS, getAvailableTiers, isDonationProduct } from './donationProducts';

// Donations use Google Play Billing, which is Android only. Settings hides the entry elsewhere.
export default function DonateScreen() {
    const { t } = useTranslation();

    if (Platform.OS !== 'android') {
        return (
            <SafeAreaView className="flex-1 bg-gray-900 items-center justify-center p-8" edges={['bottom', 'left', 'right']}>
                <Ionicons name="heart-dislike-outline" size={48} color="#6B7280" />
                <Text className="text-gray-400 text-center mt-4">{t('common.donateAndroidOnly')}</Text>
            </SafeAreaView>
        );
    }

    return <DonateAndroid />;
}

function DonateAndroid() {
    const { t } = useTranslation();
    const [buyingId, setBuyingId] = useState<string | null>(null);
    const [thanks, setThanks] = useState(false);
    const [loaded, setLoaded] = useState(false);
    const handled = useRef(new Set<string>()); // Purchase tokens already consumed, so none is processed twice
    const lastErrorAt = useRef(0);

    // A donation is a consumable: finishing it tells Google Play it was delivered, which also
    // acknowledges it (unacknowledged purchases are refunded automatically after 3 days) and lets
    // the same supporter donate again.
    const consume = useCallback(async (purchase: Purchase, finishTransaction: (args: { purchase: Purchase; isConsumable?: boolean }) => Promise<void>) => {
        const key = purchase.purchaseToken ?? purchase.id;
        if (handled.current.has(key)) return;
        handled.current.add(key);
        try {
            await finishTransaction({ purchase, isConsumable: true });
        } catch (error) {
            handled.current.delete(key); // Try again next time
            throw error;
        }
    }, []);

    const showError = useCallback((error: unknown) => {
        if (isUserCancelledError(error)) return;
        // The flow can report the same failure through the listener and the promise
        if (Date.now() - lastErrorAt.current < 1500) return;
        lastErrorAt.current = Date.now();
        Alert.alert(t('common.error'), t('common.donateFailed'));
    }, [t]);

    // finishTransaction comes from the hook below; the success callback reads it through this ref
    const finishRef = useRef<(args: { purchase: Purchase; isConsumable?: boolean }) => Promise<void>>(async () => {});

    const {
        connected, products, fetchProducts, requestPurchase, finishTransaction,
        availablePurchases, getAvailablePurchases, reconnect,
    } = useIAP({
        onPurchaseSuccess: async (purchase) => {
            if (!isDonationProduct(purchase.productId)) return;
            setBuyingId(null);

            if (purchase.purchaseState === 'pending') {
                // Slow payment methods (e.g. cash, some UPI flows) complete later; it is delivered then.
                Alert.alert(t('common.donate'), t('common.donatePending'));
                return;
            }

            try {
                await consume(purchase, finishRef.current);
                setThanks(true);
            } catch {
                showError(new Error('consume failed'));
            }
        },
        onPurchaseError: (error) => {
            setBuyingId(null);
            showError(error);
        },
    });
    finishRef.current = finishTransaction;

    useEffect(() => {
        if (!connected) return;
        fetchProducts({ skus: DONATION_PRODUCT_IDS, type: 'in-app' })
            .catch(() => undefined)
            .finally(() => setLoaded(true));
        // Pick up a donation that went through but was never consumed (e.g. the app closed mid-way)
        getAvailablePurchases().catch(() => undefined);
    }, [connected]);

    useEffect(() => {
        availablePurchases
            .filter(p => isDonationProduct(p.productId) && p.purchaseState === 'purchased')
            .forEach(p => consume(p, finishTransaction).catch(() => undefined));
    }, [availablePurchases]);

    const donate = async (productId: string) => {
        setBuyingId(productId);
        try {
            await requestPurchase({ request: { google: { skus: [productId] } }, type: 'in-app' });
        } catch (error) {
            setBuyingId(null);
            showError(error);
        }
    };

    const tiers = getAvailableTiers(products);
    const busy = buyingId !== null;

    return (
        <SafeAreaView className="flex-1 bg-gray-900" edges={['bottom', 'left', 'right']}>
            <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
                <View className="items-center mb-6 mt-2">
                    <View className="w-20 h-20 rounded-full bg-pink-500/15 items-center justify-center mb-4">
                        <Ionicons name="heart" size={40} color="#EC4899" />
                    </View>
                    <Text className="text-white text-2xl font-bold text-center mb-2">{t('common.supportTheApp')}</Text>
                    <Text className="text-gray-400 text-center leading-5">{t('common.donateIntro')}</Text>
                </View>

                {thanks && (
                    <View testID="donate-thanks" className="bg-green-600/15 border border-green-500/40 rounded-2xl p-4 mb-5 flex-row items-center">
                        <Ionicons name="checkmark-circle" size={26} color="#22C55E" />
                        <Text className="text-green-300 font-bold ml-3 flex-1">{t('common.donateThanks')}</Text>
                    </View>
                )}

                {!connected ? (
                    <View className="items-center py-8">
                        <Text className="text-gray-400 text-center mb-4">{t('common.donateStoreUnavailable')}</Text>
                        <TouchableOpacity onPress={() => reconnect()} className="bg-blue-600 px-6 py-3 rounded-xl">
                            <Text className="text-white font-bold">{t('common.retry')}</Text>
                        </TouchableOpacity>
                    </View>
                ) : !loaded ? (
                    <ActivityIndicator size="large" color="#EC4899" className="my-8" />
                ) : tiers.length === 0 ? (
                    <Text className="text-gray-400 text-center py-8">{t('common.donateUnavailable')}</Text>
                ) : (
                    tiers.map(({ tier, product }) => (
                        <TouchableOpacity
                            key={tier.productId}
                            testID={`donate-${tier.productId}`}
                            disabled={busy}
                            onPress={() => donate(tier.productId)}
                            className={`bg-gray-800 border border-gray-700 rounded-2xl p-4 mb-3 flex-row items-center ${busy && buyingId !== tier.productId ? 'opacity-50' : ''}`}
                        >
                            <View className="w-12 h-12 rounded-full bg-pink-500/15 items-center justify-center mr-4">
                                <Ionicons name={tier.icon} size={24} color="#EC4899" />
                            </View>
                            <Text className="text-white font-bold text-base flex-1">{t(`common.${tier.labelKey}`)}</Text>
                            {buyingId === tier.productId ? (
                                <ActivityIndicator color="#EC4899" />
                            ) : (
                                <Text className="text-pink-400 font-black text-lg">{product.displayPrice}</Text>
                            )}
                        </TouchableOpacity>
                    ))
                )}

                <Text className="text-gray-500 text-xs text-center mt-4 leading-4">{t('common.donateNote')}</Text>
            </ScrollView>
            <Confetti active={thanks} />
        </SafeAreaView>
    );
}
