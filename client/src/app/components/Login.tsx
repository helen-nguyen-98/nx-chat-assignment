import { useState } from 'react';
import { useChat } from '../contexts/ChatContext';

export function Login() {
  const [inputUsername, setInputUsername] = useState('');
  const { connect } = useChat();

  const handleSubmit = async (e: React.FormEvent) => {
    console.log('handleSubmit');

    e.preventDefault();
    if (inputUsername.trim()) {
      try {
        await connect(inputUsername.trim());
      } catch (error) {
        console.error('Error connecting to chat:', error);
      }
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8">
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter your username"
          value={inputUsername}
          onChange={(e) => setInputUsername(e.target.value)}
        />
        <button
          type="submit"
          className="w-full px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Join Chat
        </button>
      </form>
    </div>
  );
}
