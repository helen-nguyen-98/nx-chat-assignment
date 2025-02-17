import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { User, ChatMessage } from '@nx-chat-assignment/shared-models';

interface ChatContextType {
  socket: Socket | null;
  currentUser: User | null;
  messages: ChatMessage[];
  users: User[];
  currentChat: User | null;
  connect: (username: string) => Promise<void>;
  disconnect: () => void;
  sendMessage: (content: string) => void;
  setCurrentChat: (user: User) => void;
}

interface SocketResponse<T> {
  event: string;
  data: T;
}

const CURRENT_USER_KEY = 'chat_user';
const CURRENT_USER_CHAT_KEY = 'current_user_chat';

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    // Initialize currentUser from localStorage
    const savedUser = localStorage.getItem(CURRENT_USER_KEY);
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [currentChat, setCurrentChat] = useState<User | null>(() => {
    // Initialize currentUser from localStorage
    const savedUser = localStorage.getItem(CURRENT_USER_CHAT_KEY);
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // Try to reconnect on page load
  useEffect(() => {
    console.log('Reconnecting...', currentUser?.username);

    if (currentUser?.username) {
      connect(currentUser.username);
    }

    if (currentUser && currentChat) {
      console.log('Loading chat history for:', currentUser.id, currentChat?.id);

      loadChatHistory(currentUser.username, currentChat?.username);
    }
  }, []); // Run only once on mount

  useEffect(() => {
    if (currentChat) {
      const currentChatNew = users.find((u) => u.username === currentChat?.username);
      if (currentChatNew) {
        setCurrentChat(currentChatNew);
        localStorage.setItem(CURRENT_USER_CHAT_KEY, JSON.stringify(currentChatNew));
      }
    }
  }, [users, currentChat]);

  const connect = async (username: string) => {
    try {
      // establish socket connection
      const socket = io('http://localhost:4000', {
        transports: ['websocket'],
      });

      socket.on('connect', () => {
        socket.emit('user:login', username);
      });

      socket.on('usersOnline', (response: SocketResponse<User[]>) => {
        console.log('Users online:', response);
        const user = response.data.find((u) => u.username === username);
        if (user) {
          setCurrentUser(user);
          localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
        }

        setUsers(response.data.filter((u) => u.username !== username));
      });

      socket.on('message:receive', (response: SocketResponse<ChatMessage>) => {
        console.log('🚀 ~ socket.on ~ response:', response);
        setMessages((prev) => [...prev, response.data]);
        // If this is a message for the current chat, load the updated history
        console.log('Current chat:', currentChat, 'Current user:', currentUser);

        if (
          currentChat &&
          currentUser &&
          (response.data.sender.id === currentChat.id ||
            response.data.receiver.id === currentChat.id)
        ) {
          loadChatHistory(currentUser.username, currentChat.username);
        }
      });

      socket.on('error', (error: { message: string }) => {
        console.error('Socket error:', error.message);
        // Clear stored user on error
        // localStorage.clear();
        // setCurrentUser(null);
        // setCurrentChat(null);
        return error;
      });

      setSocket(socket);
    } catch (error) {
      console.error('Connection error:', error);
      // Clear stored user on error
      localStorage.clear();
      setCurrentUser(null);
      throw error;
    }
  };

  const disconnect = async () => {
    if (socket && currentUser) {
      try {
        socket.disconnect();
        setSocket(null);
        setCurrentUser(null);
        setMessages([]);
        setUsers([]);
        localStorage.clear();
      } catch (error) {
        console.error('Logout error:', error);
      }
    }
  };

  const sendMessage = (message: string) => {
    if (socket && currentUser && currentChat) {
      const payload = {
        receiver: currentChat,
        message: message,
      };
      socket.emit('message:send', payload);
    }
  };

  const loadChatHistory = async (userId: string, receiverId: string) => {
    try {
      const response = await fetch(
        `http://localhost:4000/api/messages/history/${userId}/${receiverId}`,
      );
      if (!response.ok) {
        throw new Error('Failed to load chat history');
      }
      const history = await response.json();
      setMessages(history);
    } catch (error) {
      console.error('Failed to load chat history:', error);
    }
  };

  return (
    <ChatContext.Provider
      value={{
        socket,
        currentUser,
        messages,
        users,
        currentChat,
        connect,
        disconnect,
        sendMessage,
        setCurrentChat: (user: User) => {
          setCurrentChat(user);
          localStorage.setItem(CURRENT_USER_CHAT_KEY, JSON.stringify(user));
          if (currentUser) {
            loadChatHistory(currentUser.username, user.username);
          }
        },
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}
