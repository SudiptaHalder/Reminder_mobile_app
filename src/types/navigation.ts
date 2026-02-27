export type RootStackParamList = {
  Auth: undefined;
  RoomSetup: undefined;
  RoomDashboard: { roomId: string };
  CreateTask: { roomId: string };
  TaskDetail: { taskId: string };
};
