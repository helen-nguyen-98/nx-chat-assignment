import { useState, useEffect, useRef, useCallback } from 'react';
import { useChat } from '../contexts/ChatContext';
import { ChatMessage } from './ChatMessage';
import UsersList from './UsersList';
import { ChatContainer, InputContainer, ChatMainContainer, ChatHeader } from './styles';

export function Chat() {
  // Rename for clarity
  const {
    messages: chatHistory,
    users: onlineUsers,
    selectedUser,
    currentUser,
    sendMessage: sendChatMessage,
    setSelectedUser,
    disconnect: handleLogout,
  } = useChat();

  const [messageInput, setMessageInput] = useState('');
  const chatMessagesRef = useRef<HTMLDivElement>(null);
  const [isNearBottom, setIsNearBottom] = useState(true);

  const scrollToBottom = useCallback(
    (forceScroll = false) => {
      if (chatMessagesRef.current && (isNearBottom || forceScroll)) {
        const container = chatMessagesRef.current;
        const { scrollHeight, clientHeight } = container;
        container.scrollTop = scrollHeight - clientHeight;
      }
    },
    [isNearBottom],
  );

  const handleScrollChange = useCallback(() => {
    if (chatMessagesRef.current) {
      const { scrollHeight, clientHeight, scrollTop } = chatMessagesRef.current;
      const scrollThreshold = 100; // pixels from bottom
      const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
      setIsNearBottom(distanceFromBottom < scrollThreshold);
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory, scrollToBottom]);

  useEffect(() => {
    const messagesContainer = chatMessagesRef.current;
    if (messagesContainer) {
      messagesContainer.addEventListener('scroll', handleScrollChange);
      return () => messagesContainer.removeEventListener('scroll', handleScrollChange);
    }
  }, [handleScrollChange]);

  useEffect(() => {
    scrollToBottom(true);
    setIsNearBottom(true);
  }, [selectedUser, scrollToBottom]);

  const handleSubmitMessage = useCallback(
    (event: React.FormEvent) => {
      event.preventDefault();
      const trimmedMessage = messageInput.trim();
      if (trimmedMessage) {
        sendChatMessage(trimmedMessage);
        setMessageInput('');
        // Force scroll to bottom after sending with small delay to ensure message is rendered
        setTimeout(() => scrollToBottom(true), 100);
      }
    },
    [messageInput, sendChatMessage, scrollToBottom],
  );

  const handleBackNavigation = useCallback(() => {
    setSelectedUser(null);
  }, [setSelectedUser]);

  const filteredMessages = chatHistory.filter(
    (msg) =>
      (msg.sender.username === currentUser?.username &&
        msg.receiver.username === selectedUser?.username) ||
      (msg.sender.username === selectedUser?.username &&
        msg.receiver.username === currentUser?.username),
  );

  if (!currentUser) return null;

  return (
    <ChatContainer>
      {/* Users list - only visible on mobile when no chat is selected */}
      <div
        className={`fixed md:relative w-full md:w-auto h-full ${
          selectedUser ? 'hidden md:block' : 'block'
        }`}
      >
        <UsersList
          users={onlineUsers}
          currentUser={currentUser}
          currentChat={selectedUser}
          onUserSelect={setSelectedUser}
          onLogout={handleLogout}
        />
      </div>

      {/* Chat area - only visible on mobile when a chat is selected */}
      <ChatMainContainer
        className={`fixed md:relative w-full h-full ${!selectedUser ? 'hidden md:block' : 'block'}`}
      >
        {selectedUser ? (
          <>
            <ChatHeader>
              <div className="flex items-center">
                <button
                  className="md:hidden mr-2 p-2 hover:bg-gray-100 rounded-full"
                  onClick={handleBackNavigation}
                  aria-label="Back to users list"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>
                <div>
                  <span className="font-medium">{selectedUser.username}</span>
                  {selectedUser.online && (
                    <span className="ml-2 text-sm text-green-600">online</span>
                  )}
                </div>
              </div>
            </ChatHeader>

            <div
              ref={chatMessagesRef}
              className="flex-1 overflow-y-auto space-y-2 px-4 pb-4"
              onScroll={handleScrollChange}
            >
              <div className="flex flex-col space-y-2 max-w-3xl mx-auto w-full pt-4">
                {filteredMessages.map((message, index) => (
                  <ChatMessage
                    key={index}
                    message={message}
                    isCurrentUser={message.sender.username === currentUser?.username}
                  />
                ))}
              </div>
            </div>

            <InputContainer>
              <form onSubmit={handleSubmitMessage}>
                <input
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder="Type a message..."
                />
                <button
                  type="submit"
                  className="px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 whitespace-nowrap"
                >
                  Send
                </button>
              </form>
            </InputContainer>
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500 text-center">Select a user to start chatting</p>
          </div>
        )}
      </ChatMainContainer>
    </ChatContainer>
  );
}
