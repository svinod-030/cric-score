import { Ionicons } from '@expo/vector-icons';
import React from 'react';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

export type DonationTier = {
    productId: string; // Must match the in-app product ID created in Google Play Console
    icon: IconName;
    labelKey: string; // i18n key under "common"
};

// One-time, consumable in-app products, so a supporter can donate again later.
// The price of each one is set in Play Console (and shown to the user in their own currency);
// the app only knows the product IDs. Order here is the order on screen (smallest first).
export const DONATION_TIERS: DonationTier[] = [
    { productId: 'donate_chai', icon: 'cafe', labelKey: 'donateTierChai' },
    { productId: 'donate_snack', icon: 'fast-food', labelKey: 'donateTierSnack' },
    { productId: 'donate_meal', icon: 'pizza', labelKey: 'donateTierMeal' },
    { productId: 'donate_champion', icon: 'trophy', labelKey: 'donateTierChampion' },
];

export const DONATION_PRODUCT_IDS = DONATION_TIERS.map(tier => tier.productId);

export const isDonationProduct = (productId?: string | null): boolean =>
    !!productId && DONATION_PRODUCT_IDS.includes(productId);

// Tiers that Play actually returned a product for, in tier order.
export const getAvailableTiers = <P extends { id: string }>(products: P[]): { tier: DonationTier; product: P }[] =>
    DONATION_TIERS.flatMap(tier => {
        const product = products.find(p => p.id === tier.productId);
        return product ? [{ tier, product }] : [];
    });
