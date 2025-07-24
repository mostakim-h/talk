export const getChatRoomId = (currentUserId, selectedUserId) => {
  return [currentUserId, selectedUserId].sort().join('_');
};
