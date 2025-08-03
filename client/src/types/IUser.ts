export interface IUser {
  _id: string;
  fullName: string;
  about: string;
  email: string;
  avatar: string;
  username: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  isOnline?: boolean;
  isVerified: boolean;
  lastMessage: string;
}