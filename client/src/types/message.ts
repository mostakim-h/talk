export interface IMessage {
  _id: string;
  roomId: string;
  senderId: string;
  content: {
    message: string;
    media: [],
  },
  deletionStatus: 'none' | 'sender' | 'receiver' | 'both';
  status: 'sent' | 'delivered' | 'read';
  type: 'text' | 'image' | 'video' | 'file' | 'voice';
  reactions?: {
    [userId: string]: string; // userId mapped to reaction type (e.g., "like", "love")
  };
  createdAt: Date;
  updatedAt: Date;
}