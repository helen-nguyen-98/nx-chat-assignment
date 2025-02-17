import { useState, useEffect, useRef } from 'react';
import { useChat } from '../contexts/ChatContext';
import { User, ChatMessage } from '@nx-chat-assignment/shared-models';

export function Chat() {
  const { messages, users, currentChat, currentUser, sendMessage, setCurrentChat, disconnect } =
    useChat();
  console.log("🚀 ~ Chat ~ messages:", messages)
  console.log("🚀 ~ Chat ~ currentChat:", currentChat)
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      const { scrollHeight, clientHeight } = chatContainerRef.current;
      chatContainerRef.current.scrollTop = scrollHeight - clientHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      sendMessage(newMessage.trim());
      setNewMessage('');
    }
  };

  const filteredMessages = messages.filter(
    (msg: ChatMessage) =>
      (msg.sender.username === currentUser?.username &&
        msg.receiver.username === currentChat?.username) ||
      (msg.sender.username === currentChat?.username &&
        msg.receiver.username === currentUser?.username),
  );

  return (
    <div className="grid grid-cols-[300px_1fr] h-[calc(100vh-40px)] gap-4">
      {/* Users list */}
      <div className="border-r border-gray-200 p-4">
        {/* User section */}
        <div className="mb-6 pb-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Logged in as:</h3>
              <p className="text-blue-600">{currentUser?.username}</p>
            </div>
            <button
              onClick={disconnect}
              className="px-3 py-1 text-sm text-red-600 border border-red-600 rounded-md hover:bg-red-50 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>

        <h2 className="text-xl mb-4">Users Online</h2>
        <div className="space-y-2">
          {users.map((user: User) => (
            <button
              key={user.id}
              onClick={() => setCurrentChat(user)}
              className={`w-full px-4 py-2 text-left rounded-md transition-colors ${
                currentChat?.id === user.id ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'
              }`}
            >
              <span className="flex items-center">
                {user.username}
                {user.online && <span className="ml-2 w-2 h-2 bg-green-500 rounded-full" />}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Chat area */}
      <div className="p-4 flex flex-col h-[calc(100vh-20px)]">
        {currentChat ? (
          <>
            {/* Chat header */}
            <div className="mb-4 pb-3 border-b border-gray-200">
              <div className="flex items-center">
                <span className="font-medium">{currentChat.username}</span>
                {currentChat.online && <span className="ml-2 text-sm text-green-600">online</span>}
              </div>
            </div>

            <div
              ref={chatContainerRef}
              className="flex-1 overflow-y-auto mb-4 space-y-2 min-h-0 h-[calc(100vh-350px)]"
            >
              <div className="flex flex-col space-y-2">
                {filteredMessages.map((message: ChatMessage, index) => (
                  <div
                    key={index}
                    className={`flex flex-col max-w-[70%] p-2 rounded-md ${
                      message.sender.username === currentUser?.username
                        ? 'ml-auto bg-blue-100'
                        : 'bg-gray-100'
                    }`}
                  >
                    <span>{message.message}</span>
                    <span className="text-xs text-gray-500">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </div>
            <form onSubmit={handleSend} className="flex gap-2">
              <input
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
              />
              <button
                type="submit"
                className="px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Send
              </button>
            </form>
          </>
        ) : (
          <p className="text-gray-500">Select a user to start chatting</p>
        )}
      </div>
    </div>
  );
}
