import { ApiError } from 'core/exeptions';
import { UserModel, userModel } from 'modules/user/models/user-model';
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
import { v2 as cloudinary } from 'cloudinary';
import { getAverageColor } from 'fast-average-color-node';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

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
export const userRegistrationService = async ({
  email,
  name,
  password,
}: {
  email: string;
  name: string;
  password: string;
}) => {
  try {
    // NOTE: Пользователь который еще не зарегистрирован
    const candidate = await userModel.findOne({ email });

    if (candidate) {
      throw ApiError.BadRequest(`Пользователь с почтовым адресом ${email} уже существует.`);
    }

    // NOTE: Захешированный пароль для хранения в БД
    const hashedPassword = await bcrypt.hash(password, 3);

    // const activationLink = nanoid();

    // TODO: Вынести в константы
    const colors = ['#e46861', '#50c77b', '#c3e161', '#70a941', '#5c6905'];

    // NOTE: Цвет по умолчанию при регистрации
    const defaultColor = colors[Math.ceil(Math.random() * colors.length - 1)];

    const user = await userModel.create({
      email,
      name,
      password: hashedPassword,
      default_color: defaultColor,
    });

    // TODO: Ошибка в сервисе отправки писем
    // await mailActivationService(email, `${API_URL}/api/activate/${activationLink}`);

    // NOTE: Данные пользователя для отправки в ответе
    const userDto = getUserDTO(user);

    // NOTE: Access и refresh токены
    const tokens = generateTokens({ ...userDto });

    await saveToken(userDto.id, tokens.refreshToken);

    // TODO: Добавить разделение на API (registration, authorization, users)
    return tokens;
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
export const getUserService = async (userId: string) => {
  try {
    const user = await userModel.findOne({ _id: userId });

    if (!user) {
      throw ApiError.BadRequest('Пользователь не найден.');
    }

    return getUserDTO(user);
  } catch (error) {
    throw error;
  }
};

/**
 * Service for updating user data.
 */
export const patchUserService = async (userId: string, userData: Partial<UserModel>) => {
  try {
    const user = await userModel.findOne({ _id: userId });

    if (!user) {
      throw ApiError.BadRequest('Пользователь не найден.');
    }

    if (userData.color || userData.image || userData.description) {
      if (userData.color) {
        user.color = userData.color;
      }

      if (userData.image) {
        const uploadedResponse = await cloudinary.uploader.upload(userData.image, {
          folder: 'video-calls',
          eager: { quality: '75', fetch_format: 'jpg' },
        });

        const averageColor = await getAverageColor(userData.image);

        user.image = uploadedResponse.eager[0].secure_url;
        user.color = averageColor.hex;
      }

      if (userData.description) {
        user.description = userData.description;
      }

      await user.save();

      return getUserDTO(user);
    }

    if (userData.name === '') {
      throw ApiError.BadRequest('Новое имя пользователя не заполненно.');
    }

    if (userData.email === '') {
      throw ApiError.BadRequest('Новый email пользователя не заполнен.');
    }

    if (!userData.password) {
      throw ApiError.BadRequest('Пароль не заполнен.');
    }

    const isPasswordEquals = await bcrypt.compare(userData.password, user.password);

    if (!isPasswordEquals) {
      throw ApiError.BadRequest('Пароль не верный.');
    }

    if (userData.image === '' && userData.password) {
      user.image = '';
      user.color = '';
    }

    if (userData.name) {
      user.name = userData.name;
    }

    if (userData.email) {
      user.email = userData.email;
    }

    if (userData.color) {
      user.color = userData.color;
    }

    if (userData.image) {
      const uploadedResponse = await cloudinary.uploader.upload(userData.image, {
        folder: 'video-calls',
        eager: { quality: '75', fetch_format: 'jpg' },
      });

      const averageColor = await getAverageColor(userData.image);

      user.image = uploadedResponse.eager[0].secure_url;
      user.color = averageColor.hex;
    }

    await user.save();

    return getUserDTO(user);
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
