export interface Room {
  id: string;
  createdBy: string;
  members: string[];
  inviteCode: string;
  createdAt: Date;
}

export interface CreateRoomData {
  createdBy: string;
  inviteCode: string;
}

export interface JoinRoomData {
  inviteCode: string;
  userId: string;
}

export interface RoomError {
  code: string;
  message: string;
}

export interface RoomMember {
  uid: string;
  email: string;
  joinedAt: Date;
}
