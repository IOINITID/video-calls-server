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
    const user = await userModel.findOne({ id: userId });

    if (!user) {
      throw ApiError.BadRequest('Пользователь не найден.');
    }

    if (userData.password) {
      const isPasswordEquals = await bcrypt.compare(userData.password, user.password);

      if (isPasswordEquals) {
        if (userData.name) {
          user.name = userData.name;
        } else {
          throw ApiError.BadRequest('Новое имя пользователя не заполненно.');
        }

        if (userData.email) {
          user.email = userData.email;
        } else {
          throw ApiError.BadRequest('Новый email пользователя не заполнен.');
        }
      } else {
        throw ApiError.BadRequest('Пароль не верный.');
      }
    } else {
      if (userData.description) {
        user.description = userData.description;
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
      } else if (userData.image === '') {
        user.image = '';
        user.color = '';
      }

      // throw ApiError.BadRequest('Пароль не заполнен.');
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
