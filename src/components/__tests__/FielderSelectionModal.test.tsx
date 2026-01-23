import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { FielderSelectionModal } from '../FielderSelectionModal';

// Mock Modal
jest.mock('react-native/Libraries/Modal/Modal', () => {
    const { View } = require('react-native');
    return ({ children, visible }: any) => {
        return visible ? <View testID="mock-modal">{children}</View> : null;
    };
});

describe.skip('FielderSelectionModal', () => {
    const mockPlayers = [
        { id: 'p1', name: 'Fielder 1' },
        { id: 'p2', name: 'Fielder 2' },
    ];
    const mockOnSelect = jest.fn();
    const mockOnCancel = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('renders correctly when visible', () => {
        const { getByText } = render(
            <FielderSelectionModal
                visible={true}
                players={mockPlayers}
                onSelect={mockOnSelect}
                onCancel={mockOnCancel}
            />
        );

        expect(getByText('Select Fielder')).toBeTruthy();
        expect(getByText('Fielder 1')).toBeTruthy();
        expect(getByText('Cancel')).toBeTruthy();
    });

    test('renders custom title', () => {
        const { getByText } = render(
            <FielderSelectionModal
                visible={true}
                players={mockPlayers}
                onSelect={mockOnSelect}
                title="Who caught it?"
            />
        );

        expect(getByText('Who caught it?')).toBeTruthy();
    });

    test('calls onSelect when player is pressed', () => {
        const { getByText } = render(
            <FielderSelectionModal
                visible={true}
                players={mockPlayers}
                onSelect={mockOnSelect}
            />
        );

        fireEvent.press(getByText('Fielder 1'));
        expect(mockOnSelect).toHaveBeenCalledWith('p1');
    });

    test('calls onCancel when cancel button is pressed', () => {
        const { getByText } = render(
            <FielderSelectionModal
                visible={true}
                players={mockPlayers}
                onSelect={mockOnSelect}
                onCancel={mockOnCancel}
            />
        );

        fireEvent.press(getByText('Cancel'));
        expect(mockOnCancel).toHaveBeenCalled();
    });

    test('does not render cancel button if onCancel is not provided', () => {
        const { queryByText } = render(
            <FielderSelectionModal
                visible={true}
                players={mockPlayers}
                onSelect={mockOnSelect}
            />
        );

        expect(queryByText('Cancel')).toBeNull();
    });
});
