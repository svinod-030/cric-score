import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { WhoIsOutModal } from '../WhoIsOutModal';

// Mock Modal
jest.mock('react-native/Libraries/Modal/Modal', () => {
    const { View } = require('react-native');
    return ({ children, visible }: any) => {
        return visible ? <View testID="mock-modal">{children}</View> : null;
    };
});

describe.skip('WhoIsOutModal', () => {
    const mockOnSelect = jest.fn();
    const mockOnCancel = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('renders correctly when visible', () => {
        const { getByText } = render(
            <WhoIsOutModal
                visible={true}
                strikerName="Kohli"
                nonStrikerName="Rohit"
                onSelect={mockOnSelect}
                onCancel={mockOnCancel}
            />
        );

        expect(getByText('Who is out?')).toBeTruthy();
        expect(getByText('Kohli (Striker)')).toBeTruthy();
        expect(getByText('Rohit (Non-Striker)')).toBeTruthy();
        expect(getByText('Cancel')).toBeTruthy();
    });

    test('calls onSelect with striker when striker is pressed', () => {
        const { getByText } = render(
            <WhoIsOutModal
                visible={true}
                strikerName="Kohli"
                nonStrikerName="Rohit"
                onSelect={mockOnSelect}
                onCancel={mockOnCancel}
            />
        );

        fireEvent.press(getByText('Kohli (Striker)'));
        expect(mockOnSelect).toHaveBeenCalledWith('striker');
    });

    test('calls onSelect with non-striker when non-striker is pressed', () => {
        const { getByText } = render(
            <WhoIsOutModal
                visible={true}
                strikerName="Kohli"
                nonStrikerName="Rohit"
                onSelect={mockOnSelect}
                onCancel={mockOnCancel}
            />
        );

        fireEvent.press(getByText('Rohit (Non-Striker)'));
        expect(mockOnSelect).toHaveBeenCalledWith('non-striker');
    });

    test('calls onCancel when cancel is pressed', () => {
        const { getByText } = render(
            <WhoIsOutModal
                visible={true}
                strikerName="Kohli"
                nonStrikerName="Rohit"
                onSelect={mockOnSelect}
                onCancel={mockOnCancel}
            />
        );

        fireEvent.press(getByText('Cancel'));
        expect(mockOnCancel).toHaveBeenCalled();
    });
});
