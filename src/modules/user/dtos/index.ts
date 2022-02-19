import { UserModel } from '../models/user-model';

/**
 * DTO for user model.
 */
export const getUserDTO = (userModel: UserModel) => {
  return {
    id: userModel.id,
    email: userModel.email,
    name: userModel.name,
    isActivated: userModel.isActivated,
    status: userModel.status,
    socketId: userModel.socketId,
  };
};
