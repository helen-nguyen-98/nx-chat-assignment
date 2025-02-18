import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import UsersList from '../UsersList.tsx';

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

  it('renders user list correctly', () => {
    render(<UsersList {...defaultProps} />);
    expect(screen.getByText('user1')).toBeInTheDocument();
    expect(screen.getByText('user2')).toBeInTheDocument();
  });

  it('shows online status indicator for online users', () => {
    render(<UsersList {...defaultProps} />);
    const onlineUser = screen.getByText('user1').closest('div');
    expect(onlineUser?.querySelector('.bg-green-500')).toBeInTheDocument();
    
    const offlineUser = screen.getByText('user2').closest('div');
    expect(offlineUser?.querySelector('.bg-gray-500')).toBeInTheDocument();
  });

  it('calls onUserSelect when clicking a user', () => {
    render(<UsersList {...defaultProps} />);
    fireEvent.click(screen.getByText('user1'));
    expect(mockOnUserSelect).toHaveBeenCalledWith('1');
  });

  it('highlights selected user', () => {
    render(<UsersList {...defaultProps} selectedUser={mockUsers[0]} />);
    const selectedUser = screen.getByText('user1').closest('div');
    expect(selectedUser?.className).toContain('bg-gray-100');
  });

  it('calls onLogout when clicking logout button', () => {
    render(<UsersList {...defaultProps} />);
    fireEvent.click(screen.getByText('Logout'));
    expect(mockOnLogout).toHaveBeenCalled();
  });
}); 