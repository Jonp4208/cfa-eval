import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BreakDialog } from '../BreakDialog';

// Mock data
const mockEmployee = {
  id: '1',
  name: 'John Doe'
};

// Mock functions
const mockOnOpenChange = jest.fn();
const mockSetBreakDuration = jest.fn();
const mockHasHadBreak = jest.fn();
const mockHandleStartBreak = jest.fn();

describe('BreakDialog', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockHasHadBreak.mockImplementation((id) => false);
  });

  it('renders correctly when open', () => {
    render(
      <BreakDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        selectedEmployee={mockEmployee}
        breakDuration={30}
        setBreakDuration={mockSetBreakDuration}
        hasHadBreak={mockHasHadBreak}
        handleStartBreak={mockHandleStartBreak}
      />
    );

    // Check if dialog title is rendered
    expect(screen.getByText('Start Break')).toBeInTheDocument();
    
    // Check if employee name is rendered
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    
    // Check if break duration options are rendered
    expect(screen.getByText('30 Minutes')).toBeInTheDocument();
    expect(screen.getByText('60 Minutes')).toBeInTheDocument();
    
    // Check if buttons are rendered
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('Start Break')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(
      <BreakDialog
        open={false}
        onOpenChange={mockOnOpenChange}
        selectedEmployee={mockEmployee}
        breakDuration={30}
        setBreakDuration={mockSetBreakDuration}
        hasHadBreak={mockHasHadBreak}
        handleStartBreak={mockHandleStartBreak}
      />
    );

    // Dialog should not be visible
    expect(screen.queryByText('Start Break')).not.toBeInTheDocument();
  });

  it('shows "Has already had a break today" when employee has had a break', () => {
    mockHasHadBreak.mockImplementation((id) => true);
    
    render(
      <BreakDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        selectedEmployee={mockEmployee}
        breakDuration={30}
        setBreakDuration={mockSetBreakDuration}
        hasHadBreak={mockHasHadBreak}
        handleStartBreak={mockHandleStartBreak}
      />
    );

    expect(screen.getByText('Has already had a break today')).toBeInTheDocument();
  });

  it('calls setBreakDuration when duration option is clicked', () => {
    render(
      <BreakDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        selectedEmployee={mockEmployee}
        breakDuration={30}
        setBreakDuration={mockSetBreakDuration}
        hasHadBreak={mockHasHadBreak}
        handleStartBreak={mockHandleStartBreak}
      />
    );

    const sixtyMinutesButton = screen.getByText('60 Minutes');
    fireEvent.click(sixtyMinutesButton);

    expect(mockSetBreakDuration).toHaveBeenCalledWith(60);
  });

  it('calls handleStartBreak when Start Break button is clicked', () => {
    render(
      <BreakDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        selectedEmployee={mockEmployee}
        breakDuration={30}
        setBreakDuration={mockSetBreakDuration}
        hasHadBreak={mockHasHadBreak}
        handleStartBreak={mockHandleStartBreak}
      />
    );

    const startBreakButton = screen.getAllByText('Start Break')[1]; // Get the button, not the title
    fireEvent.click(startBreakButton);

    expect(mockHandleStartBreak).toHaveBeenCalled();
  });

  it('calls onOpenChange when Cancel button is clicked', () => {
    render(
      <BreakDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        selectedEmployee={mockEmployee}
        breakDuration={30}
        setBreakDuration={mockSetBreakDuration}
        hasHadBreak={mockHasHadBreak}
        handleStartBreak={mockHandleStartBreak}
      />
    );

    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });
});
