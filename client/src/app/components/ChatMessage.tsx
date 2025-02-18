import { ChatMessage as ChatMessageType } from '@nx-chat-assignment/shared-models';
import { memo } from 'react';
import { MessageContainer } from './styles';

interface Props {
  message: ChatMessageType;
  isCurrentUser: boolean;
}

export const ChatMessage = memo(function ChatMessage({ message, isCurrentUser }: Props) {
  return (
    <MessageContainer isCurrentUser={isCurrentUser}>
      <span className="break-words">{message.message}</span>
      <span className="text-xs text-gray-500 mt-1">
        {new Date(message.timestamp).toLocaleTimeString()}
      </span>
    </MessageContainer>
  );
}); 