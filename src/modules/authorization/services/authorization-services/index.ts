import bcrypt from 'bcrypt';
import { ApiError } from 'core/exeptions';
import { userModel } from 'modules/user/models/user-model';
import {
  findToken,
  generateTokens,
  removeToken,
  saveToken,
  validateRefreshToken,
} from 'modules/authorization/services/token-services';
import { getAuthorizationDTO } from '../../dtos';

/**
 * Service для регистрации пользователя.
 */
export const registrationService = async (payload: { email: string; name: string; password: string }) => {
  try {
    const { email, name, password } = payload;

    console.log({ email, name, password });

    // NOTE: Пользователь который уже зарегистрирован
    const existingUser = await userModel.findOne({ email });

    if (existingUser) {
      throw ApiError.BadRequest(`Пользователь с почтовым адресом ${email} уже существует.`);
    }

    // NOTE: Захешированный пароль для хранения в БД
    const hashedPassword = await bcrypt.hash(password, 10);

    // NOTE: Hash ссылки для активации
    // const activationLink = nanoid();

    // NOTE: Созданный пользователь
    const user = await userModel.create({ email, name, password: hashedPassword });

    // TODO: Ошибка в сервисе отправки писем
    // await mailActivationService(email, `${API_URL}/api/activate/${activationLink}`);

    // NOTE: Данные для авторизации, которые будут добавлены в токен
    const authorizationDTO = getAuthorizationDTO(user);

    // NOTE: Access и refresh токены
    const tokens = generateTokens(authorizationDTO);

    // NOTE: Сохранение токена в БД
    await saveToken(authorizationDTO.id, tokens.refreshToken);

    return tokens;
  } catch (error) {
    throw error;
  }
};

/**
 * Service для авторизации пользователя.
 */
export const authorizationService = async (payload: { email: string; password: string }) => {
  try {
    const { email, password } = payload;

    const user = await userModel.findOne({ email });

    if (!user) {
      throw ApiError.BadRequest('Пользователь с таким email не найден.');
    }

    const isPasswordEquals = await bcrypt.compare(password, user.password);

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
 * Service для обновления токенов.
 */
export const refreshService = async (payload: { refreshToken: string }) => {
  try {
    const { refreshToken } = payload;

    if (!refreshToken) {
      throw ApiError.UnauthorizedErrors();
    }

    // TODO: Добавить тип для id пользователя
    const authorizationData: any = validateRefreshToken(refreshToken);

    const tokenFromDB = await findToken(refreshToken);

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
 * Service для выхода из аккаунта.
 */
export const logoutService = async (payload: { refreshToken: string }) => {
  try {
    const { refreshToken } = payload;

    await removeToken(refreshToken);
  } catch (error) {
    throw error;
  }
};
