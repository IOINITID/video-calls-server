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

/**
 * DTO для получения списка пользователей.
 */
export const getUsersDTO = (users: UserModel[]) => {
  return users.map((user) => {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      color: user.color,
      default_color: user.default_color,
      description: user.description,
      status: user.status,
      socket_id: user.socket_id,
      image: user.image,
    };
  });
};
