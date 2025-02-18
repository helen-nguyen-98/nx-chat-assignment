import React from 'react';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { ChatMessage } from '../ChatMessage';

describe('ChatMessage', () => {
  const mockMessage = {
    message: 'Hello world',
    timestamp: new Date().toISOString(),
    sender: { id: '1', username: 'sender', online: true },
    receiver: { id: '2', username: 'receiver', online: true }
  };

  it('renders message content correctly', () => {
    render(<ChatMessage message={mockMessage} isCurrentUser={false} />);
    const messageElement = screen.getByText('Hello world');
    expect(messageElement).toBeInTheDocument();
  });

  it('applies correct styling for current user messages', () => {
    const { container } = render(<ChatMessage message={mockMessage} isCurrentUser={true} />);
    const messageDiv = container.firstChild;
    expect(messageDiv).toBeInTheDocument();
    expect(messageDiv).toHaveStyle('margin-left: auto');
  });

  it('applies correct styling for other user messages', () => {
    const { container } = render(<ChatMessage message={mockMessage} isCurrentUser={false} />);
    const messageDiv = container.firstChild;
    expect(messageDiv).toBeInTheDocument();
    expect(messageDiv).toHaveStyle('margin-left: 0');
  });
}); 