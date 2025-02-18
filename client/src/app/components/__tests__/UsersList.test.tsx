import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import UsersList from '../UsersList';

describe('UsersList', () => {
  const mockUsers = [
    { id: '1', username: 'user1', online: true },
    { id: '2', username: 'user2', online: false }
  ];

  const mockCurrentUser = { id: '3', username: 'currentUser', online: true };
  const mockOnUserSelect = jest.fn();
  const mockOnLogout = jest.fn();

  const defaultProps = {
    users: mockUsers,
    currentUser: mockCurrentUser,
    selectedUser: null,
    onUserSelect: mockOnUserSelect,
    onLogout: mockOnLogout
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders user list correctly', () => {
    render(<UsersList {...defaultProps} />);
    expect(screen.getByText('user1')).toBeInTheDocument();
    expect(screen.getByText('user2')).toBeInTheDocument();
  });

  it('shows online status indicator', () => {
    render(<UsersList {...defaultProps} />);
    const onlineUsers = screen.getAllByText(/.*/).filter(element => 
      element.parentElement?.querySelector('.bg-green-500')
    );
    expect(onlineUsers.length).toBeGreaterThan(0);
  });

  it('calls onUserSelect when clicking a user', () => {
    render(<UsersList {...defaultProps} />);
    fireEvent.click(screen.getByText('user1'));
    expect(mockOnUserSelect).toHaveBeenCalledWith(mockUsers[0]);
  });

  it('highlights selected user', () => {
    render(<UsersList {...defaultProps} selectedUser={mockUsers[0]} />);
    const selectedUserButton = screen.getByText('user1').closest('button');
    expect(selectedUserButton).toHaveClass('bg-blue-500');
  });

  it('calls onLogout when clicking logout button', () => {
    render(<UsersList {...defaultProps} />);
    fireEvent.click(screen.getByText('Logout'));
    expect(mockOnLogout).toHaveBeenCalled();
  });
}); 