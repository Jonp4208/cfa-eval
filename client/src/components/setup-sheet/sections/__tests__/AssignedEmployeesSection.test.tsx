import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { AssignedEmployeesSection } from '../AssignedEmployeesSection';

// Mock data
const mockEmployees = [
  {
    id: '1',
    name: 'John Doe',
    area: 'FOH',
    positions: ['Cashier', 'Drive Thru'],
    timeBlock: '9 - 17'
  },
  {
    id: '2',
    name: 'Jane Smith',
    area: 'BOH',
    positions: ['Cook'],
    timeBlock: '8 - 16'
  }
];

// Mock functions
const mockGetBreakStatus = jest.fn();
const mockGetRemainingBreakTime = jest.fn();
const mockHasHadBreak = jest.fn();
const mockHandleBreakClick = jest.fn();
const mockHandleReplaceClick = jest.fn();
const mockEndBreak = jest.fn();

describe('AssignedEmployeesSection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetBreakStatus.mockImplementation((id) => id === '1' ? 'active' : 'none');
    mockGetRemainingBreakTime.mockImplementation((id) => id === '1' ? 15 : 0);
    mockHasHadBreak.mockImplementation((id) => id === '2');
  });

  it('renders nothing when no employees are provided', () => {
    const { container } = render(
      <AssignedEmployeesSection
        filteredAssignedEmployees={[]}
        getBreakStatus={mockGetBreakStatus}
        getRemainingBreakTime={mockGetRemainingBreakTime}
        hasHadBreak={mockHasHadBreak}
        handleBreakClick={mockHandleBreakClick}
        handleReplaceClick={mockHandleReplaceClick}
        endBreak={mockEndBreak}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it('renders assigned employees correctly', () => {
    render(
      <AssignedEmployeesSection
        filteredAssignedEmployees={mockEmployees}
        getBreakStatus={mockGetBreakStatus}
        getRemainingBreakTime={mockGetRemainingBreakTime}
        hasHadBreak={mockHasHadBreak}
        handleBreakClick={mockHandleBreakClick}
        handleReplaceClick={mockHandleReplaceClick}
        endBreak={mockEndBreak}
      />
    );

    // Check if employee names are rendered
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();

    // Check if positions are rendered
    expect(screen.getByText('Cashier, Drive Thru')).toBeInTheDocument();
    expect(screen.getByText('Cook')).toBeInTheDocument();

    // Check if areas are rendered
    expect(screen.getByText('FOH')).toBeInTheDocument();
    expect(screen.getByText('BOH')).toBeInTheDocument();

    // Check if break status is rendered correctly
    expect(screen.getByText('On Break (15m)')).toBeInTheDocument();
    expect(screen.getByText('End Break')).toBeInTheDocument();
    expect(screen.getByText('Had Break')).toBeInTheDocument();
    expect(screen.getByText('Another Break')).toBeInTheDocument();
  });

  it('calls handleBreakClick when break button is clicked', () => {
    render(
      <AssignedEmployeesSection
        filteredAssignedEmployees={[mockEmployees[1]]} // Use employee not on break
        getBreakStatus={mockGetBreakStatus}
        getRemainingBreakTime={mockGetRemainingBreakTime}
        hasHadBreak={mockHasHadBreak}
        handleBreakClick={mockHandleBreakClick}
        handleReplaceClick={mockHandleReplaceClick}
        endBreak={mockEndBreak}
      />
    );

    const breakButton = screen.getByText('Another Break');
    fireEvent.click(breakButton);

    expect(mockHandleBreakClick).toHaveBeenCalledWith('2', 'Jane Smith');
  });

  it('calls handleReplaceClick when replace button is clicked', () => {
    render(
      <AssignedEmployeesSection
        filteredAssignedEmployees={[mockEmployees[1]]} // Use employee not on break
        getBreakStatus={mockGetBreakStatus}
        getRemainingBreakTime={mockGetRemainingBreakTime}
        hasHadBreak={mockHasHadBreak}
        handleBreakClick={mockHandleBreakClick}
        handleReplaceClick={mockHandleReplaceClick}
        endBreak={mockEndBreak}
      />
    );

    const replaceButton = screen.getByText('Replace');
    fireEvent.click(replaceButton);

    expect(mockHandleReplaceClick).toHaveBeenCalledWith('2', 'Jane Smith');
  });

  it('calls endBreak when end break button is clicked', () => {
    render(
      <AssignedEmployeesSection
        filteredAssignedEmployees={[mockEmployees[0]]} // Use employee on break
        getBreakStatus={mockGetBreakStatus}
        getRemainingBreakTime={mockGetRemainingBreakTime}
        hasHadBreak={mockHasHadBreak}
        handleBreakClick={mockHandleBreakClick}
        handleReplaceClick={mockHandleReplaceClick}
        endBreak={mockEndBreak}
      />
    );

    const endBreakButton = screen.getByText('End Break');
    fireEvent.click(endBreakButton);

    expect(mockEndBreak).toHaveBeenCalledWith('1');
  });
});
