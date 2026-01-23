import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { BowlerSelectionModal } from '../BowlerSelectionModal';

// Mock Modal since it can cause issues in tests
jest.mock('react-native/Libraries/Modal/Modal', () => {
    const { View } = require('react-native');
    return ({ children, visible }: any) => {
        return visible ? <View testID="mock-modal">{children}</View> : null;
    };
});

describe.skip('BowlerSelectionModal', () => {
    const mockPlayers = [
        { id: 'p1', name: 'Bowler 1' },
        { id: 'p2', name: 'Bowler 2' },
    ];
    const mockOnSelect = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('renders correctly when visible', () => {
        const { getByText } = render(
            <BowlerSelectionModal
                visible={true}
                players={mockPlayers}
                onSelect={mockOnSelect}
            />
        );

        expect(getByText('Select Bowler')).toBeTruthy();
        expect(getByText('Bowler 1')).toBeTruthy();
        expect(getByText('Bowler 2')).toBeTruthy();
    });

    test('calls onSelect when player is pressed', () => {
        const { getByText } = render(
            <BowlerSelectionModal
                visible={true}
                players={mockPlayers}
                onSelect={mockOnSelect}
            />
        );

        fireEvent.press(getByText('Bowler 1'));
        expect(mockOnSelect).toHaveBeenCalledWith('p1');
    });

    test('does not render when not visible', () => {
        const { queryByText } = render(
            <BowlerSelectionModal
                visible={false}
                players={mockPlayers}
                onSelect={mockOnSelect}
            />
        );

        expect(queryByText('Select Bowler')).toBeNull();
    });
});
