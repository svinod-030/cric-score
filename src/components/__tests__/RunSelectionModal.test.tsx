import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { RunSelectionModal } from '../RunSelectionModal';

// Mock Modal
jest.mock('react-native/Libraries/Modal/Modal', () => {
    const { View } = require('react-native');
    return ({ children, visible }: any) => {
        return visible ? <View testID="mock-modal">{children}</View> : null;
    };
});

// Mock Switch
jest.mock('react-native/Libraries/Components/Switch/Switch', () => {
    const { View } = require('react-native');
    return (props: any) => (
        <View
            testID="mock-switch"
            onTouchEnd={() => props.onValueChange(!props.value)}
            {...props}
        />
    );
});

describe.skip('RunSelectionModal', () => {
    const mockOnSelect = jest.fn();
    const mockOnClose = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('renders correctly when visible', () => {
        const { getByText } = render(
            <RunSelectionModal
                visible={true}
                title="Select Runs"
                onSelect={mockOnSelect}
                onClose={mockOnClose}
            />
        );

        expect(getByText('Select Runs')).toBeTruthy();
        expect(getByText('0')).toBeTruthy();
        expect(getByText('1')).toBeTruthy();
        expect(getByText('4')).toBeTruthy();
        expect(getByText('6')).toBeTruthy();
    });

    test('calls onSelect with selected runs', () => {
        const { getByText } = render(
            <RunSelectionModal
                visible={true}
                title="Select Runs"
                onSelect={mockOnSelect}
                onClose={mockOnClose}
            />
        );

        fireEvent.press(getByText('4'));
        expect(mockOnSelect).toHaveBeenCalledWith(4, false);
    });

    test('displays bye toggle when enabled', () => {
        const { getByText } = render(
            <RunSelectionModal
                visible={true}
                title="Select Runs"
                onSelect={mockOnSelect}
                onClose={mockOnClose}
                showByeToggle={true}
            />
        );

        expect(getByText('Byes (Not from Bat)')).toBeTruthy();
    });

    test('passes isBye=true when toggle is active', () => {
        const { getByText, getByTestId } = render(
            <RunSelectionModal
                visible={true}
                title="Select Runs"
                onSelect={mockOnSelect}
                onClose={mockOnClose}
                showByeToggle={true}
            />
        );

        fireEvent(getByTestId('mock-switch'), 'onTouchEnd');
        fireEvent.press(getByText('1'));

        expect(mockOnSelect).toHaveBeenCalledWith(1, true);
    });

    test('calls onClose when cancel is pressed', () => {
        const { getByText } = render(
            <RunSelectionModal
                visible={true}
                title="Select Runs"
                onSelect={mockOnSelect}
                onClose={mockOnClose}
            />
        );

        fireEvent.press(getByText('Cancel'));
        expect(mockOnClose).toHaveBeenCalled();
    });
});
