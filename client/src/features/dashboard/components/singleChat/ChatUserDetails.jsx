export default function ChatUserDetails({user}) {
  return (
    <div className="flex items-center gap-2">
      <img
        src={user?.profilePicture || '/default-avatar.png'}
        alt={user?.name || 'User Avatar'}
        className="w-10 h-10 rounded-full"
      />
      <div>
        <h3 className="text-lg font-semibold">{user?.name || 'Unknown User'}</h3>
        <p className="text-sm text-gray-500">{user?.email || 'No email provided'}</p>
      </div>
    </div>
  );
}