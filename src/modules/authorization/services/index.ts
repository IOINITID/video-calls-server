import bcrypt from 'bcrypt';
import { ApiError } from 'core/exeptions';
import { getUserDTO } from 'modules/user/dtos';
import { userModel } from 'modules/user/models/user-model';
import {
  findToken,
  generateTokens,
  removeToken,
  saveToken,
  validateRefreshToken,
} from 'modules/user/services/token-services';
import { getAuthorizationDTO } from '../dtos';

/**
 * Service for user registration.
 */
export const registrationService = async (payload: { email: string; name: string; password: string }) => {
  try {
    // NOTE: Пользователь который уже зарегистрирован
    const isUserExist = await userModel.findOne({ email: payload.email });

    if (isUserExist) {
      throw ApiError.BadRequest(`Пользователь с почтовым адресом ${payload.email} уже существует.`);
    }

    // NOTE: Захешированный пароль для хранения в БД
    const hashedPassword = await bcrypt.hash(payload.password, 3);

    // const activationLink = nanoid();

    const user = await userModel.create({ email: payload.email, name: payload.name, password: hashedPassword });

    // TODO: Ошибка в сервисе отправки писем
    // await mailActivationService(email, `${API_URL}/api/activate/${activationLink}`);

    // NOTE: Данные для авторизации
    const authorizationDTO = getAuthorizationDTO(user);

    // NOTE: Access и refresh токены
    const tokens = generateTokens(authorizationDTO);

    await saveToken(authorizationDTO.id, tokens.refreshToken);

    return tokens;
  } catch (error) {
    throw error;
  }
};

/**
 * Service for user authorization.
 */
export const authorizationService = async (payload: { email: string; password: string }) => {
  try {
    const user = await userModel.findOne({ email: payload.email });

    if (!user) {
      throw ApiError.BadRequest('Пользователь с таким email не найден.');
    }

    const isPasswordEquals = await bcrypt.compare(payload.password, user.password);

    if (!isPasswordEquals) {
      throw ApiError.BadRequest('Пароль не верный.');
    }

    const authorizationDTO = getAuthorizationDTO(user);

    const tokens = generateTokens(authorizationDTO);

    await saveToken(authorizationDTO.id, tokens.refreshToken);

    return tokens;
  } catch (error) {
    throw error;
  }
};

/**
 * Service for user authorization refresh.
 */
export const refreshService = async (payload: { refreshToken: string }) => {
  try {
    if (!payload.refreshToken) {
      throw ApiError.UnauthorizedErrors();
    }

    // TODO: Добавить тип для id пользователя
    const authorizationData: any = validateRefreshToken(payload.refreshToken);

    const tokenFromDB = await findToken(payload.refreshToken);

    if (!authorizationData || !tokenFromDB) {
      throw ApiError.UnauthorizedErrors();
    }

    const user = await userModel.findById(authorizationData.id);

    if (!user) {
      throw ApiError.BadRequest('Пользователь не найден.');
    }

    const authorizationDTO = getAuthorizationDTO(user);

    const tokens = generateTokens(authorizationDTO);

    await saveToken(authorizationDTO.id, tokens.refreshToken);

    return tokens;
  } catch (error) {
    throw error;
  }
};

/**
 * Service for user logout.
 */
export const logoutService = async (payload: { refreshToken: string }) => {
  try {
    await removeToken(payload.refreshToken);
  } catch (error) {
    throw error;
  }
};
