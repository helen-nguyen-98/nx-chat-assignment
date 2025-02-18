import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import { io, Socket } from 'socket.io-client';
import { User, ChatMessage } from '@nx-chat-assignment/shared-models';

interface ChatContextType {
  socket: Socket | null;
  currentUser: User | null;
  messages: ChatMessage[];
  users: User[];
  selectedUser: User | null;
  connect: (username: string) => Promise<void>;
  disconnect: () => void;
  sendMessage: (content: string) => void;
  setSelectedUser: (user: User | null) => void;
  socketError: string | null;
}

interface SocketResponse<T> {
  event: string;
  data: T;
}

const LOCAL_STORAGE_KEYS = {
  USER: 'user',
  SELECTED_USER: 'selected_user',
} as const;

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [socketConnection, setSocketConnection] = useState<Socket | null>(null);
  const [loggedInUser, setLoggedInUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem(LOCAL_STORAGE_KEYS.USER);
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [messageHistory, setMessageHistory] = useState<ChatMessage[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(() => {
    const savedChat = localStorage.getItem(LOCAL_STORAGE_KEYS.SELECTED_USER);
    return savedChat ? JSON.parse(savedChat) : null;
  });
  const [socketError, setSocketError] = useState<string | null>(null);

  // Try to reconnect on page load
  useEffect(() => {
    if (loggedInUser?.username) {
      handleConnect(loggedInUser.username);
    }

    if (loggedInUser && selectedUser) {
      loadChatHistory(loggedInUser.username, selectedUser?.username);
    }
  }, []); // Run only once on mount

  useEffect(() => {
    if (onlineUsers.length === 0) {
      return;
    }
    const updatedChatUser = onlineUsers.find((u) => u.username === selectedUser?.username);
    if (updatedChatUser) {
      setSelectedUser(updatedChatUser);
      localStorage.setItem(LOCAL_STORAGE_KEYS.SELECTED_USER, JSON.stringify(updatedChatUser));
    } else {
      setSelectedUser(null);
      localStorage.removeItem(LOCAL_STORAGE_KEYS.SELECTED_USER);
    }
  }, [onlineUsers, selectedUser]);

  function setupSocketListeners(socket: Socket, username: string) {
    socket.on('usersOnline', (response: SocketResponse<User[]>) => {
      const authenticatedUser = response.data.find((u) => u.username === username);
      if (authenticatedUser) {
        setLoggedInUser(authenticatedUser);
        localStorage.setItem(LOCAL_STORAGE_KEYS.USER, JSON.stringify(authenticatedUser));
      }
      setOnlineUsers(response.data.filter((u) => u.username !== username));
    });

    socket.on('message:receive', (response: SocketResponse<ChatMessage>) => {
      setMessageHistory((prevMessages) => [...prevMessages, response.data]);
      if (
        selectedUser &&
        loggedInUser &&
        (response.data.sender.username === selectedUser.username ||
          response.data.receiver.username === selectedUser.username)
      ) {
        loadChatHistory(loggedInUser.username, selectedUser.username);
      }
    });

    socket.on('error', (error: { message: string }) => {
      console.error('Socket error:', error.message);
      setSocketError(error.message);
      return error;
    });
  }

  const handleConnect = useCallback(async (username: string) => {
    setSocketError(null);
    try {
      const socket = io('http://localhost:4000', {
        transports: ['websocket'],
      });

      socket.on('connect', () => {
        socket.emit('user:login', username);
      });

      setupSocketListeners(socket, username);
      setSocketConnection(socket);
    } catch (error) {
      console.error('Connection error:', error);
      localStorage.clear();
      setLoggedInUser(null);
      setSocketError(error instanceof Error ? error.message : 'Failed to connect');
      throw error;
    }
  }, []);

  const handleDisconnect = useCallback(async () => {
    if (socketConnection && loggedInUser) {
      try {
        socketConnection.disconnect();
        setSocketConnection(null);
        setLoggedInUser(null);
        setMessageHistory([]);
        setOnlineUsers([]);
        localStorage.clear();
      } catch (error) {
        console.error('Logout error:', error);
      }
    }
  }, [socketConnection, loggedInUser]);

  const handleSendMessage = useCallback(
    (messageContent: string) => {
      if (socketConnection && loggedInUser && selectedUser) {
        const messagePayload = {
          receiver: selectedUser,
          message: messageContent,
        };
        socketConnection.emit('message:send', messagePayload);
      }
    },
    [socketConnection, loggedInUser, selectedUser],
  );

  const loadChatHistory = async (senderId: string, receiverId: string) => {
    try {
      const response = await fetch(
        `http://localhost:4000/api/messages/history/${senderId}/${receiverId}`,
      );
      if (!response.ok) {
        throw new Error('Failed to load chat history');
      }
      const history = await response.json();
      setMessageHistory(history);
    } catch (error) {
      console.error('Failed to load chat history:', error);
    }
  };

  const handleSetSelectedUser = useCallback(
    (user: User | null) => {
      setSelectedUser(user);
      localStorage.setItem(LOCAL_STORAGE_KEYS.SELECTED_USER, JSON.stringify(user));
      if (loggedInUser && user) {
        loadChatHistory(loggedInUser.username, user.username);
      }
    },
    [loggedInUser],
  );

  const contextValue = useMemo(
    () => ({
      socket: socketConnection,
      currentUser: loggedInUser,
      messages: messageHistory,
      users: onlineUsers,
      selectedUser: selectedUser,
      connect: handleConnect,
      disconnect: handleDisconnect,
      sendMessage: handleSendMessage,
      setSelectedUser: handleSetSelectedUser,
      socketError,
    }),
    [
      socketConnection,
      loggedInUser,
      messageHistory,
      onlineUsers,
      selectedUser,
      handleConnect,
      handleDisconnect,
      handleSendMessage,
      handleSetSelectedUser,
      socketError,
    ],
  );

  return <ChatContext.Provider value={contextValue}>{children}</ChatContext.Provider>;
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}
