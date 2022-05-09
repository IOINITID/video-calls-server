import { UserModel } from '../models/user-model';

/**
 * DTO for user model.
 */
export const getUserDTO = (userModel: UserModel) => {
  return {
    id: userModel.id,
    email: userModel.email,
    name: userModel.name,
    color: userModel.color,
    default_color: userModel.default_color,
    description: userModel.description,
    status: userModel.status,
    socket_id: userModel.socket_id,
    image: userModel.image,
  };
};
