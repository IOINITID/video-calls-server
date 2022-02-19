import { ApiError } from 'core/exeptions';
import { userModel } from 'modules/user/models/user-model';
import bcrypt from 'bcrypt';
import { getUserDTO } from 'modules/user/dtos';
import { nanoid } from 'nanoid';
import {
  findToken,
  generateTokens,
  removeToken,
  saveToken,
  validateRefreshToken,
} from 'modules/user/services/token-services';
import { API_URL } from 'core/constants';
import { mailActivationService } from 'modules/user/services/mail-services';

/**
 * Service for user authorization.
 */
export const userAuthorizationService = async (email: string, password: string) => {
  try {
    const user = await userModel.findOne({ email });

    if (!user) {
      throw ApiError.BadRequest('Пользователь с таким email не найден.');
    }

    const isPasswordEquals = await bcrypt.compare(password, user.password);

    if (!isPasswordEquals) {
      throw ApiError.BadRequest('Пароль не верный.');
    }

    const userDTO = getUserDTO(user);

    const tokens = generateTokens({ ...userDTO });

    await saveToken(userDTO.id, tokens.refreshToken);

    return { ...tokens };
  } catch (error) {
    throw error;
  }
};

/**
 * Service for user authorization refresh.
 */
export const userRefreshService = async (refreshToken: string) => {
  try {
    if (!refreshToken) {
      throw ApiError.UnauthorizedErrors();
    }

    const userData = validateRefreshToken(refreshToken);

    const tokenFromDB = await findToken(refreshToken);

    if (!userData || !tokenFromDB) {
      throw ApiError.UnauthorizedErrors();
    }

    const user = await userModel.findById((userData as any).id); // TODO: Добавить тип для id пользователя

    if (!user) {
      throw ApiError.BadRequest('Пользователь не найден.');
    }

    const userDTO = getUserDTO(user);

    const tokens = generateTokens({ ...userDTO });

    await saveToken(userDTO.id, tokens.refreshToken);

    return { ...tokens };
  } catch (error) {
    throw error;
  }
};

/**
 * Service for user registration.
 */
export const userRegistrationService = async (email: string, name: string, password: string) => {
  try {
    const candidate = await userModel.findOne({ email });

    if (candidate) {
      throw ApiError.BadRequest(`Пользователь с почтовым адресом ${email} уже существует.`);
    }

    const hashPassword = await bcrypt.hash(password, 3);

    const activationLink = nanoid();

    const user = await userModel.create({ email, name, password: hashPassword, activationLink });

    await mailActivationService(email, `${API_URL}/api/activate/${activationLink}`);

    const userDto = getUserDTO(user);

    const tokens = generateTokens({ ...userDto });

    await saveToken(userDto.id, tokens.refreshToken);

    return { ...tokens, user: userDto };
  } catch (error) {
    throw error;
  }
};

/**
 * Service for user logout.
 */
export const userLogoutService = async (refreshToken: string) => {
  try {
    await removeToken(refreshToken);
  } catch (error) {
    throw error;
  }
};

/**
 * Service for getting user data.
 */
export const userUserService = async (userId: string) => {
  try {
    const user = await userModel.findOne({ id: userId });

    return user && getUserDTO(user);
  } catch (error) {
    throw error;
  }
};

/**
 * Service for getting users by name.
 */
export const userUsersService = async (searchValue: string) => {
  try {
    if (!searchValue) {
      return [];
    }

    const users = await userModel.find({ name: { $regex: searchValue } });

    return users;
  } catch (error) {
    throw error;
  }
};
