import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { JWT_ACCESS_SECRET, JWT_REFRESH_SECRET } from 'core/constants';
import { pool } from 'core/utils';

dotenv.config();

// TODO: Добавить Service окончание для сервисов и обновить названия

export const generateTokens = (payload: any) => {
  const accessToken = jwt.sign(payload, JWT_ACCESS_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: '30d' });

  return { accessToken, refreshToken };
};

export const saveToken = async (user: string, refreshToken: string) => {
  const existingToken = await pool.query('SELECT * FROM tokens WHERE user_id = $1', [user]);

  if (existingToken.rows[0]) {
    const updatedToken = await pool.query(
      'UPDATE tokens SET refresh_token = $1 WHERE user_id = $2 RETURNING refresh_token',
      [refreshToken, user]
    );

    return updatedToken.rows[0];
  }

  const token = await pool.query(
    'INSERT INTO tokens (user_id, refresh_token) VALUES ($1, $2) RETURNING refresh_token',
    [user, refreshToken]
  );

  return token.rows[0];
};

export const validateAccessToken = (token: string) => {
  try {
    const authorizationData = jwt.verify(token, JWT_ACCESS_SECRET);

    return authorizationData;
  } catch (error) {
    return null;
  }
};

export const validateRefreshToken = (token: string) => {
  try {
    const authorizationData = jwt.verify(token, JWT_REFRESH_SECRET);

    return authorizationData;
  } catch (error) {
    return null;
  }
};

export const removeToken = async (refreshToken: string) => {
  try {
    const tokenData = await pool.query('DELETE FROM tokens WHERE refresh_token = $1 RETURNING refresh_token', [
      refreshToken,
    ]);

    console.log(tokenData.rows[0]);

    return tokenData.rows[0];
  } catch (error) {
    throw error;
  }
};

export const findToken = async (refreshToken: string) => {
  try {
    const tokenData = await pool.query('SELECT refresh_token FROM tokens WHERE refresh_token = $1', [refreshToken]);

    return tokenData.rows[0];
  } catch (error) {
    throw error;
  }
};
