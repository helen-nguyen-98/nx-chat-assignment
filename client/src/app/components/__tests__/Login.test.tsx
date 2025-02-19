import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Login } from '../Login';

// Mock the ChatContext
jest.mock('../../contexts/ChatContext', () => ({
  useChat: () => ({
    connect: jest.fn(),
    socketError: null
  }),
  ChatProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}));

describe('Login Component', () => {
  it('renders login form', () => {
    render(<Login />);
    
    expect(screen.getByText('Welcome to Chat App')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your username')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /join chat/i })).toBeInTheDocument();
  });

  it('handles username input', () => {
    render(<Login />);
    
    const input = screen.getByPlaceholderText('Enter your username');
    fireEvent.change(input, { target: { value: 'testuser' } });
    
    expect(input).toHaveValue('testuser');
  });

  it('submits form with username', () => {
    const mockConnect = jest.fn();
    jest.spyOn(require('../../contexts/ChatContext'), 'useChat').mockImplementation(() => ({
      connect: mockConnect,
      socketError: null
    }));

    render(<Login />);
    
    const input = screen.getByPlaceholderText('Enter your username');
    const submitButton = screen.getByRole('button', { name: /join chat/i });
    
    fireEvent.change(input, { target: { value: 'testuser' } });
    fireEvent.click(submitButton);
    
    expect(mockConnect).toHaveBeenCalledWith('testuser');
  });

  it('displays error message when socket error occurs', () => {
    jest.spyOn(require('../../contexts/ChatContext'), 'useChat').mockImplementation(() => ({
      connect: jest.fn(),
      socketError: 'Connection failed'
    }));

    render(<Login />);
    
    expect(screen.getByText('Connection failed')).toBeInTheDocument();
  });
}); 