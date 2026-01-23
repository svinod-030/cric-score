import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { BatterSelectionModal } from '../BatterSelectionModal';

// Mock Modal to simply render children when visible
jest.mock('react-native/Libraries/Modal/Modal', () => {
    // Require View inside factory to avoid out-of-scope variable access error
    const { View } = require('react-native');
    const Modal = (props: any) => {
        return props.visible ? <View testID="modal">{props.children}</View> : null;
    };
    return Modal;
});

describe.skip('BatterSelectionModal', () => {
    const mockPlayers = [
        { id: 'p1', name: 'Player 1' },
        { id: 'p2', name: 'Player 2' },
        { id: 'p3', name: 'Player 3' },
    ];

    const mockOnSelect = jest.fn();
    const mockOnClose = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('renders when visible', () => {
        const { getByText } = render(
            <BatterSelectionModal
                visible={true}
                players={mockPlayers}
                onSelect={mockOnSelect}
                title="Select Batsman"
            />
        );

        expect(getByText('Select Batsman')).toBeTruthy();
    });

    test('displays player list', () => {
        const { getByText } = render(
            <BatterSelectionModal
                visible={true}
                players={mockPlayers}
                onSelect={mockOnSelect}
                title="Select Batsman"
            />
        );

        expect(getByText('Player 1')).toBeTruthy();
        expect(getByText('Player 2')).toBeTruthy();
        expect(getByText('Player 3')).toBeTruthy();
    });

    test('calls onSelect when player is selected', () => {
        const { getByText } = render(
            <BatterSelectionModal
                visible={true}
                players={mockPlayers}
                onSelect={mockOnSelect}
                title="Select Batsman"
            />
        );

        fireEvent.press(getByText('Player 1'));

        expect(mockOnSelect).toHaveBeenCalledWith('p1');
    });

    test('does not render when not visible', () => {
        const { queryByText } = render(
            <BatterSelectionModal
                visible={false}
                players={mockPlayers}
                onSelect={mockOnSelect}
                title="Select Batsman"
            />
        );

        expect(queryByText('Select Batsman')).toBeNull();
    });
});
