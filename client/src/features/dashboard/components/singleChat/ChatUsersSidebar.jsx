import {useQuery} from "@tanstack/react-query";
import {getAllUsers} from "../../../../api/userApis.js";

export default function ChatUsersSidebar({handleSelectUser}) {
  const {data: users} = useQuery({
    queryKey: ['chatUsers'],
    queryFn: getAllUsers,
  })

  return (
    <div className="chat-users-sidebar">
      <h2>Chat</h2>
      <div>
        {users && users.length > 0 ? (
          users.map((user) => (
            <div
              key={user._id}
              style={{
                display: 'flex',
                alignItems: 'start',
                padding: '10px',
                cursor: 'pointer',
                borderBottom: '1px solid #ccc',
                flexDirection: 'column',
              }}
              onClick={() => handleSelectUser(user)}
            >
              <span>{user.fullName}</span>
              <span style={{color: '#888'}}>{user.email}</span>
            </div>
          ))
        ) : (
          <p>No users available</p>
        )}
      </div>
    </div>
  );
}