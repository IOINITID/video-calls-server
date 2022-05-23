import { ApiError } from 'core/exeptions';
import { UserModel, userModel } from 'modules/user/models/user-model';
import bcrypt from 'bcrypt';
import { getUserDTO, getUsersDTO } from 'modules/user/dtos';
import { nanoid } from 'nanoid';
import {
  findToken,
  generateTokens,
  removeToken,
  saveToken,
  validateRefreshToken,
} from 'modules/authorization/services/token-services';
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
 * Service для получения данных пользователя.
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
 * Service для обновления данных пользователя.
 */
export const updateUserService = async (userId: string, userData: Partial<UserModel>) => {
  try {
    const user = await userModel.findOne({ id: userId });

    if (!user) {
      throw ApiError.BadRequest('Пользователь не найден.');
    }

    if (userData.name && userData.password) {
      const isPasswordEquals = await bcrypt.compare(userData.password, user.password);

      if (!isPasswordEquals) {
        throw ApiError.BadRequest('Пароль не верный.');
      }

      // NOTE: Обновление имени пользователя
      if (userData.name) {
        user.name = userData.name;
      }
    }

    if (userData.email && userData.password) {
      const isPasswordEquals = await bcrypt.compare(userData.password, user.password);

      if (!isPasswordEquals) {
        throw ApiError.BadRequest('Пароль не верный.');
      }

      // NOTE: Обновление адреса электронной почты пользователя
      if (userData.email) {
        user.email = userData.email;
      }
    }

    // NOTE: Обновление описания пользователя
    if (userData.description) {
      user.description = userData.description;
    }

    // NOTE: Обновление цвета пользователя
    if (userData.color) {
      user.color = userData.color;
    }

    // NOTE: Обновления изображения пользователя
    if (userData.image) {
      const uploadedResponse = await cloudinary.uploader.upload(userData.image, {
        folder: 'video-calls',
        eager: { quality: '75', fetch_format: 'jpg' },
      });

      const averageColor = await getAverageColor(userData.image);

      user.image = uploadedResponse.eager[0].secure_url;
      user.color = averageColor.hex;
    } else if (userData.image === '') {
      user.image = '';
      user.color = '';
    }

    await user.save();

    return getUserDTO(user);
  } catch (error) {
    throw error;
  }
};

/**
 * Service для получения списка пользователей.
 */
export const getUsersService = async () => {
  try {
    const users = await userModel.find();
    const usersData = getUsersDTO(users);

    return usersData;
  } catch (error) {
    throw error;
  }
};

/**
 * Service для получения списка пользователей.
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
