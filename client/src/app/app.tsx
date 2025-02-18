import { ChatProvider } from './contexts/ChatContext';
import { Login } from './components/Login';
import { Chat } from './components/Chat';
import { useChat } from './contexts/ChatContext';

function ChatApp() {
  const { currentUser } = useChat();

  return (
    <div className="min-h-screen bg-gray-50">
      {!currentUser ? (
        <div className="h-screen flex items-center justify-center p-4">
          <Login />
        </div>
      ) : (
        <Chat />
      )}
    </div>
  );
}

export function App() {
  return (
    <ChatProvider>
      <ChatApp />
    </ChatProvider>
  );
}

export default App;
