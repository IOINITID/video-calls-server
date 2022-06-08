import { ApiError } from 'core/exeptions';
import { UserModel } from 'modules/user/models/user-model';
import bcrypt from 'bcrypt';
import { getUserDTO, getUsersDTO } from 'modules/user/dtos';
import { v2 as cloudinary } from 'cloudinary';
import { getAverageColor } from 'fast-average-color-node';
import { pool } from 'core/utils';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Service для получения данных пользователя.
 */
export const getUserService = async (payload: { userId: string }) => {
  try {
    const { userId } = payload;

    const user = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);

    if (!user.rows[0]) {
      throw ApiError.BadRequest('Пользователь не найден.');
    }

    return getUserDTO(user.rows[0]);
  } catch (error) {
    throw error;
  }
};

/**
 * Service для обновления данных пользователя.
 */
export const updateUserService = async (payload: { userId: string; userData: Partial<UserModel> }) => {
  try {
    const { userId, userData } = payload;

    const user = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);

    if (!user.rows[0]) {
      throw ApiError.BadRequest('Пользователь не найден.');
    }

    if (userData.name && userData.password) {
      const isPasswordEquals = await bcrypt.compare(userData.password, user.rows[0].password);

      if (!isPasswordEquals) {
        throw ApiError.BadRequest('Пароль не верный.');
      }

      // NOTE: Обновление имени пользователя
      if (userData.name) {
        await pool.query('UPDATE users SET name = $1 WHERE id = $2', [userData.name, userId]);
      }
    }

    if (userData.email && userData.password) {
      const isPasswordEquals = await bcrypt.compare(userData.password, user.rows[0].password);

      if (!isPasswordEquals) {
        throw ApiError.BadRequest('Пароль не верный.');
      }

      // NOTE: Обновление адреса электронной почты пользователя
      if (userData.email) {
        await pool.query('UPDATE users SET email = $1 WHERE id = $2', [userData.email, userId]);
      }
    }

    // NOTE: Обновление описания пользователя
    if (userData.description) {
      await pool.query('UPDATE users SET description = $1 WHERE id = $2', [userData.description, userId]);
    }

    // NOTE: Обновление цвета пользователя
    if (userData.color) {
      await pool.query('UPDATE users SET color = $1  WHERE id = $2', [userData.color, userId]);
    }

    // NOTE: Обновления изображения пользователя
    if (userData.image) {
      const uploadedResponse = await cloudinary.uploader.upload(userData.image, {
        folder: 'video-calls',
        eager: { quality: '75', fetch_format: 'jpg' },
      });

      const averageColor = await getAverageColor(userData.image);

      await pool.query('UPDATE users SET image = $1 WHERE id = $2', [uploadedResponse.eager[0].secure_url, userId]);
      await pool.query('UPDATE users SET color = $1 WHERE id = $2', [averageColor.hex, userId]);
    } else if (userData.image === '') {
      await pool.query('UPDATE users SET image = $1 WHERE id = $2', ['', userId]);
      await pool.query('UPDATE users SET color = $1 WHERE id = $2', ['', userId]);
    }

    const udpatedUser = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);

    return getUserDTO(udpatedUser.rows[0]);
  } catch (error) {
    throw error;
  }
};

/**
 * Service для получения списка пользователей.
 */
export const getUsersService = async (payload: { user_id: string }) => {
  try {
    const { user_id } = payload;

    const users = await pool.query(
      "SELECT * FROM users WHERE id != $1 ORDER BY CASE WHEN users.status = 'online' THEN 1 WHEN users.status = 'offline' THEN 2 END, created_at ASC",
      [user_id]
    );
    const usersData = getUsersDTO(users.rows);

    return usersData;
  } catch (error) {
    throw error;
  }
};
