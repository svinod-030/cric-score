import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { WicketTypeSelectionModal } from '../WicketTypeSelectionModal';

// Mock Modal
jest.mock('react-native/Libraries/Modal/Modal', () => {
    const { View } = require('react-native');
    return ({ children, visible }: any) => {
        return visible ? <View testID="mock-modal">{children}</View> : null;
    };
});

describe.skip('WicketTypeSelectionModal', () => {
    const mockOnSelect = jest.fn();
    const mockOnClose = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('renders correctly when visible', () => {
        const { getByText } = render(
            <WicketTypeSelectionModal
                visible={true}
                onSelect={mockOnSelect}
                onClose={mockOnClose}
            />
        );

        expect(getByText('Select Mode of Out')).toBeTruthy();
        expect(getByText('Bowled')).toBeTruthy();
        expect(getByText('Caught')).toBeTruthy();
        expect(getByText('LBW')).toBeTruthy();
    });

    test('calls onSelect with correct wicket type', () => {
        const { getByText } = render(
            <WicketTypeSelectionModal
                visible={true}
                onSelect={mockOnSelect}
                onClose={mockOnClose}
            />
        );

        fireEvent.press(getByText('Bowled'));
        expect(mockOnSelect).toHaveBeenCalledWith('bowled');
    });

    test('calls onClose when cancel is pressed', () => {
        const { getByText } = render(
            <WicketTypeSelectionModal
                visible={true}
                onSelect={mockOnSelect}
                onClose={mockOnClose}
            />
        );

        fireEvent.press(getByText('Cancel'));
        expect(mockOnClose).toHaveBeenCalled();
    });
});
