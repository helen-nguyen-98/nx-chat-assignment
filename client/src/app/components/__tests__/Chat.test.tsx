import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { Chat } from '../Chat';

// Mock the ChatContext
const mockChatContext = {
  currentUser: { id: '1', username: 'testuser', online: true },
  messages: [],
  users: [
    { id: '2', username: 'user2', online: true },
    { id: '3', username: 'user3', online: false }
  ],
  selectedUser: null,
  sendMessage: jest.fn(),
  setSelectedUser: jest.fn(),
  disconnect: jest.fn()
};

jest.mock('../../contexts/ChatContext', () => ({
  useChat: () => mockChatContext
}));

describe('Chat Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders users list when no chat is selected', () => {
    render(<Chat />);
    expect(screen.getByText('user2')).toBeInTheDocument();
    expect(screen.getByText('user3')).toBeInTheDocument();
    expect(screen.getByText('Select a user to start chatting')).toBeInTheDocument();
  });

  it('displays chat interface when user is selected', () => {
    const selectedUser = { id: '2', username: 'user2', online: true };
    jest.spyOn(require('../../contexts/ChatContext'), 'useChat').mockImplementation(() => ({
      ...mockChatContext,
      selectedUser
    }));

    render(<Chat />);
    expect(screen.getByPlaceholderText('Type a message...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /send/i })).toBeInTheDocument();
  });

  it('handles message input and submission', () => {
    const selectedUser = { id: '2', username: 'user2', online: true };
    const mockSendMessage = jest.fn();
    
    jest.spyOn(require('../../contexts/ChatContext'), 'useChat').mockImplementation(() => ({
      ...mockChatContext,
      selectedUser,
      sendMessage: mockSendMessage
    }));

    render(<Chat />);
    
    const input = screen.getByPlaceholderText('Type a message...');
    const sendButton = screen.getByRole('button', { name: /send/i });
    
    fireEvent.change(input, { target: { value: 'Hello!' } });
    fireEvent.click(sendButton);
    
    expect(mockSendMessage).toHaveBeenCalledWith('Hello!');
  });
}); 