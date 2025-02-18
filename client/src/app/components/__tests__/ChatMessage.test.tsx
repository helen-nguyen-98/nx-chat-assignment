import React from 'react';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { ChatMessage } from '../ChatMessage';

describe('ChatMessage', () => {
  const mockMessage = {
    id: '1',
    content: 'Hello world',
    timestamp: new Date().toISOString(),
    senderId: '1',
    receiverId: '2'
  };

  it('renders message content correctly', () => {
    render(<ChatMessage message={mockMessage} isCurrentUser={false} />);
    expect(screen.getByText('Hello world')).toBeInTheDocument();
  });

  it('applies correct styling for current user messages', () => {
    const { container } = render(<ChatMessage message={mockMessage} isCurrentUser={true} />);
    const messageDiv = container.firstChild as HTMLElement;
    expect(messageDiv.className).toContain('justify-end');
    expect(messageDiv.className).toContain('bg-blue-500');
  });

  it('applies correct styling for other user messages', () => {
    const { container } = render(<ChatMessage message={mockMessage} isCurrentUser={false} />);
    const messageDiv = container.firstChild as HTMLElement;
    expect(messageDiv.className).toContain('bg-gray-200');
    expect(messageDiv.className).not.toContain('justify-end');
  });
}); 