import { ChatProvider } from './contexts/ChatContext';
import { Login } from './components/Login';
import { Chat } from './components/Chat';
import { useChat } from './contexts/ChatContext';

function ChatApp() {
  const { currentUser } = useChat();

  return (
    <div className="p-4">
      {!currentUser ? <Login /> : <Chat />}
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
