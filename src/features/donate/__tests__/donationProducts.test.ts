import { DONATION_PRODUCT_IDS, DONATION_TIERS, getAvailableTiers, isDonationProduct } from '../donationProducts';

describe('donationProducts', () => {
    test('product ids are valid Play Console ids and unique', () => {
        // Play Console ids: lowercase letters, numbers, underscores and periods, starting with a letter or number
        DONATION_PRODUCT_IDS.forEach(id => expect(id).toMatch(/^[a-z0-9][a-z0-9_.]*$/));
        expect(new Set(DONATION_PRODUCT_IDS).size).toBe(DONATION_PRODUCT_IDS.length);
        expect(DONATION_PRODUCT_IDS).toEqual(DONATION_TIERS.map(t => t.productId));
    });

    test('isDonationProduct only accepts the donation products', () => {
        expect(isDonationProduct('donate_chai')).toBe(true);
        expect(isDonationProduct('premium_unlock')).toBe(false);
        expect(isDonationProduct('')).toBe(false);
        expect(isDonationProduct(undefined)).toBe(false);
        expect(isDonationProduct(null)).toBe(false);
    });

    describe('getAvailableTiers', () => {
        test('keeps tier order whatever order Play returns the products in', () => {
            const products = [{ id: 'donate_meal' }, { id: 'donate_chai' }, { id: 'donate_champion' }];

            expect(getAvailableTiers(products).map(x => x.tier.productId)).toEqual(['donate_chai', 'donate_meal', 'donate_champion']);
        });

        test('skips tiers Play did not return and unknown products', () => {
            const result = getAvailableTiers([{ id: 'donate_snack' }, { id: 'something_else' }]);

            expect(result).toHaveLength(1);
            expect(result[0].product.id).toBe('donate_snack');
        });

        test('returns nothing when there are no products', () => {
            expect(getAvailableTiers([])).toEqual([]);
        });
    });
});
