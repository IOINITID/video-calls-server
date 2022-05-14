import { UserModel } from 'modules/user/models/user-model';

/**
 * DTO for authorization.
 */
export const getAuthorizationDTO = (userModel: UserModel) => {
  return {
    id: userModel.id,
  };
};
