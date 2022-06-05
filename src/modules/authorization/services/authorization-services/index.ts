import bcrypt from 'bcrypt';
import { ApiError } from 'core/exeptions';
import {
  findToken,
  generateTokens,
  removeToken,
  saveToken,
  validateRefreshToken,
} from 'modules/authorization/services/token-services';
import { getAuthorizationDTO } from '../../dtos';
import { pool } from 'core/utils';
import { getDefaultColor } from 'modules/user/utils';

/**
 * Service для регистрации пользователя.
 */
export const registrationService = async (payload: { email: string; name: string; password: string }) => {
  try {
    const { email, name, password } = payload;

    // NOTE: Пользователь который уже зарегистрирован
    const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    // await pool.end();

    if (existingUser.rows[0]) {
      throw ApiError.BadRequest(`Пользователь с почтовым адресом ${email} уже существует.`);
    }

    // NOTE: Захешированный пароль для хранения в БД
    const hashedPassword = await bcrypt.hash(password, 10);

    // NOTE: Hash ссылки для активации
    // const activationLink = nanoid();

    // NOTE: Созданный пользователь
    const user = await pool.query(
      'INSERT INTO users (name, email, password, color) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, email, hashedPassword, getDefaultColor()]
    );
    // await pool.end();

    console.log({ user: user.rows[0] });

    // TODO: Ошибка в сервисе отправки писем
    // await mailActivationService(email, `${API_URL}/api/activate/${activationLink}`);

    // NOTE: Данные для авторизации, которые будут добавлены в токен
    const authorizationDTO = getAuthorizationDTO(user.rows[0]);

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

    const user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

    if (!user.rows[0]) {
      throw ApiError.BadRequest('Пользователь с таким email не найден.');
    }

    const isPasswordEquals = await bcrypt.compare(password, user.rows[0].password);

    if (!isPasswordEquals) {
      throw ApiError.BadRequest('Пароль не верный.');
    }

    const authorizationDTO = getAuthorizationDTO(user.rows[0]);

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

    const user = await pool.query('SELECT * FROM users WHERE id = $1', [authorizationData.id]);

    if (!user.rows[0]) {
      throw ApiError.BadRequest('Пользователь не найден.');
    }

    const authorizationDTO = getAuthorizationDTO(user.rows[0]);

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
