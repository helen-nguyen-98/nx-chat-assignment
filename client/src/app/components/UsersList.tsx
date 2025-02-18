import { User } from '@nx-chat-assignment/shared-models';
import { memo } from 'react';
import { UsersListContainer } from './styles';

interface Props {
  users: User[];
  currentUser: User;
  selectedUser: User | null;
  onUserSelect: (user: User | null) => void;
  onLogout: () => void;
}

const UsersList = memo(function UsersList({
  users,
  currentUser,
  selectedUser,
  onUserSelect,
  onLogout,
}: Props) {
  return (
    <UsersListContainer>
      <div className="sticky top-0 bg-white p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h3 className="font-medium">Logged in as:</h3>
            <p className="text-blue-600">{currentUser?.username}</p>
          </div>
          <button
            onClick={onLogout}
            className="px-3 py-1 text-sm text-red-600 border border-red-600 rounded-md hover:bg-red-50 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          <h2 className="text-xl mb-4">Users Online</h2>
          <div className="space-y-2">
            {users.map((user) => (
              <button
                key={user.id}
                onClick={() => onUserSelect(user)}
                className={`w-full px-4 py-3 text-left rounded-md transition-colors ${
                  selectedUser?.id === user.id ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'
                }`}
              >
                <span className="flex items-center">
                  <span className="flex-1">{user.username}</span>
                  {user.online && <span className="ml-2 w-2 h-2 bg-green-500 rounded-full" />}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </UsersListContainer>
  );
});

export default UsersList;
