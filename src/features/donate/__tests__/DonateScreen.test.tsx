import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { Alert, Platform } from 'react-native';
import { useIAP } from 'expo-iap';
import DonateScreen from '../DonateScreen';
import { DONATION_PRODUCT_IDS } from '../donationProducts';

jest.mock('expo-iap', () => ({
    useIAP: jest.fn(),
    isUserCancelledError: jest.fn((error: any) => error?.code === 'user-cancelled'),
}));
jest.mock('../../../components/Confetti', () => ({ Confetti: () => null }));

jest.spyOn(Alert, 'alert');

const product = (id: string, displayPrice: string) => ({ id, displayPrice, title: id, type: 'in-app' });
const purchase = (productId: string, token: string, purchaseState = 'purchased') =>
    ({ id: token, productId, purchaseToken: token, purchaseState } as any);

describe('DonateScreen', () => {
    let iap: any;
    let options: any;

    const renderScreen = () => render(<DonateScreen />);

    beforeEach(() => {
        jest.clearAllMocks();
        Platform.OS = 'android';
        options = undefined;
        iap = {
            connected: true,
            products: [
                product('donate_chai', '₹29.00'),
                product('donate_snack', '₹79.00'),
                product('donate_meal', '₹199.00'),
                product('donate_champion', '₹499.00'),
            ],
            availablePurchases: [],
            fetchProducts: jest.fn().mockResolvedValue(undefined),
            requestPurchase: jest.fn().mockResolvedValue(null),
            finishTransaction: jest.fn().mockResolvedValue(undefined),
            getAvailablePurchases: jest.fn().mockResolvedValue(undefined),
            reconnect: jest.fn().mockResolvedValue(true),
        };
        (useIAP as jest.Mock).mockImplementation((opts: any) => {
            options = opts;
            return iap;
        });
    });

    describe('loading products', () => {
        test('asks Google Play for the donation products once connected', async () => {
            const { findByTestId } = renderScreen();
            await findByTestId('donate-donate_chai');

            expect(iap.fetchProducts).toHaveBeenCalledWith({ skus: DONATION_PRODUCT_IDS, type: 'in-app' });
        });

        test('shows each tier with the price Google Play returns, in tier order', async () => {
            const { findByText, getAllByText } = renderScreen();

            expect(await findByText('₹29.00')).toBeTruthy();
            expect(getAllByText(/₹/).map(n => n.props.children)).toEqual(['₹29.00', '₹79.00', '₹199.00', '₹499.00']);
            expect(getAllByText(/Buy us a chai|Treat us to a snack|Buy us a meal|Be a champion/)).toHaveLength(4);
        });

        test('only shows tiers that exist in Play Console', async () => {
            iap.products = [product('donate_meal', '₹199.00')];
            const { findByTestId, queryByTestId } = renderScreen();

            await findByTestId('donate-donate_meal');
            expect(queryByTestId('donate-donate_chai')).toBeNull();
        });

        test('says donations are unavailable when Play returns no products', async () => {
            iap.products = [];
            const { findByText } = renderScreen();

            expect(await findByText("Donations aren't available right now. Please try again later.")).toBeTruthy();
        });

        test('offers a retry when Google Play is not connected', () => {
            iap.connected = false;
            const { getByText } = renderScreen();

            expect(getByText(/Couldn't connect to Google Play/)).toBeTruthy();
            expect(iap.fetchProducts).not.toHaveBeenCalled();

            fireEvent.press(getByText('Retry'));
            expect(iap.reconnect).toHaveBeenCalled();
        });
    });

    describe('donating', () => {
        test('starts a Google Play purchase for the tapped tier', async () => {
            const { findByTestId } = renderScreen();

            fireEvent.press(await findByTestId('donate-donate_snack'));

            expect(iap.requestPurchase).toHaveBeenCalledWith({
                request: { google: { skus: ['donate_snack'] } },
                type: 'in-app',
            });
        });

        test('consumes the purchase and says thank you when it succeeds', async () => {
            const { findByTestId, queryByTestId } = renderScreen();
            await findByTestId('donate-donate_chai');
            expect(queryByTestId('donate-thanks')).toBeNull();

            const bought = purchase('donate_chai', 'token-1');
            await act(async () => { await options.onPurchaseSuccess(bought); });

            // Consumable: finishing it acknowledges it with Google and lets the user donate again
            expect(iap.finishTransaction).toHaveBeenCalledWith({ purchase: bought, isConsumable: true });
            expect(await findByTestId('donate-thanks')).toBeTruthy();
        });

        test('consumes a purchase only once even if it is reported twice', async () => {
            const { findByTestId } = renderScreen();
            await findByTestId('donate-donate_chai');

            const bought = purchase('donate_chai', 'token-1');
            await act(async () => {
                await options.onPurchaseSuccess(bought);
                await options.onPurchaseSuccess(bought);
            });

            expect(iap.finishTransaction).toHaveBeenCalledTimes(1);
        });

        test('does not consume or thank for a pending payment, and tells the user', async () => {
            const { findByTestId, queryByTestId } = renderScreen();
            await findByTestId('donate-donate_chai');

            await act(async () => { await options.onPurchaseSuccess(purchase('donate_chai', 'token-1', 'pending')); });

            expect(iap.finishTransaction).not.toHaveBeenCalled();
            expect(queryByTestId('donate-thanks')).toBeNull();
            expect(Alert.alert).toHaveBeenCalledWith('Donate', expect.stringContaining('pending'));
        });

        test('ignores purchases of other products', async () => {
            const { findByTestId, queryByTestId } = renderScreen();
            await findByTestId('donate-donate_chai');

            await act(async () => { await options.onPurchaseSuccess(purchase('some_other_product', 'token-9')); });

            expect(iap.finishTransaction).not.toHaveBeenCalled();
            expect(queryByTestId('donate-thanks')).toBeNull();
        });

        test('says nothing when the user cancels the payment sheet', async () => {
            const { findByTestId } = renderScreen();
            await findByTestId('donate-donate_chai');

            act(() => options.onPurchaseError({ code: 'user-cancelled', message: 'cancelled' }));

            expect(Alert.alert).not.toHaveBeenCalled();
        });

        test('shows an error for any other failure', async () => {
            const { findByTestId } = renderScreen();
            await findByTestId('donate-donate_chai');

            act(() => options.onPurchaseError({ code: 'service-error', message: 'boom' }));

            expect(Alert.alert).toHaveBeenCalledWith('Error', expect.stringContaining('could not be completed'));
        });

        test('shows an error when starting the purchase fails, and lets the user try again', async () => {
            iap.requestPurchase.mockRejectedValueOnce({ code: 'billing-unavailable' });
            const { findByTestId } = renderScreen();

            fireEvent.press(await findByTestId('donate-donate_chai'));
            await waitFor(() => expect(Alert.alert).toHaveBeenCalledTimes(1));

            fireEvent.press(await findByTestId('donate-donate_chai'));
            expect(iap.requestPurchase).toHaveBeenCalledTimes(2);
        });

        test('does not show the same failure twice when it is reported two ways', async () => {
            iap.requestPurchase.mockImplementationOnce(async () => {
                options.onPurchaseError({ code: 'service-error' });
                throw { code: 'service-error' };
            });
            const { findByTestId } = renderScreen();

            fireEvent.press(await findByTestId('donate-donate_chai'));

            await waitFor(() => expect(Alert.alert).toHaveBeenCalled());
            expect(Alert.alert).toHaveBeenCalledTimes(1);
        });

        test('keeps the purchase retryable when consuming it fails', async () => {
            iap.finishTransaction.mockRejectedValueOnce(new Error('network'));
            const { findByTestId, queryByTestId } = renderScreen();
            await findByTestId('donate-donate_chai');
            const bought = purchase('donate_chai', 'token-1');

            await act(async () => { await options.onPurchaseSuccess(bought); });
            expect(Alert.alert).toHaveBeenCalledWith('Error', expect.any(String));
            expect(queryByTestId('donate-thanks')).toBeNull();

            // A later attempt consumes it
            await act(async () => { await options.onPurchaseSuccess(bought); });
            expect(iap.finishTransaction).toHaveBeenCalledTimes(2);
            expect(await findByTestId('donate-thanks')).toBeTruthy();
        });
    });

    describe('recovering unfinished donations', () => {
        test('checks for owned purchases once connected', async () => {
            renderScreen();

            await waitFor(() => expect(iap.getAvailablePurchases).toHaveBeenCalled());
        });

        test('quietly consumes a donation that went through but was never consumed', async () => {
            const leftover = purchase('donate_meal', 'old-token');
            iap.availablePurchases = [leftover];
            const { findByTestId, queryByTestId } = renderScreen();
            await findByTestId('donate-donate_meal');

            await waitFor(() => expect(iap.finishTransaction).toHaveBeenCalledWith({ purchase: leftover, isConsumable: true }));
            expect(queryByTestId('donate-thanks')).toBeNull();
            expect(Alert.alert).not.toHaveBeenCalled();
        });

        test('leaves other products and pending purchases alone', async () => {
            iap.availablePurchases = [purchase('some_other_product', 'a'), purchase('donate_chai', 'b', 'pending')];
            const { findByTestId } = renderScreen();
            await findByTestId('donate-donate_chai');

            expect(iap.finishTransaction).not.toHaveBeenCalled();
        });
    });

    describe('platform', () => {
        test('explains that donations are Android only elsewhere, without touching billing', () => {
            Platform.OS = 'ios';
            const { getByText } = renderScreen();

            expect(getByText('Donations are available on Android only.')).toBeTruthy();
            expect(useIAP).not.toHaveBeenCalled();
        });
    });
});
