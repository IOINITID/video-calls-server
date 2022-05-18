import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { JWT_ACCESS_SECRET, JWT_REFRESH_SECRET } from '../../../../core/constants';
import { tokenModel } from '../../models/token-model';

dotenv.config();

// TODO: Добавить Service окончание для сервисов и обновить названия

export const generateTokens = (payload: any) => {
  const accessToken = jwt.sign(payload, JWT_ACCESS_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: '30d' });

  return { accessToken, refreshToken };
};

export const saveToken = async (user: string, refreshToken: string) => {
  const existingToken = await tokenModel.findOne({ user });

  if (existingToken) {
    existingToken.refresh_token = refreshToken;

    return existingToken.save();
  }

  const token = await tokenModel.create({ user, refresh_token: refreshToken });

  return token;
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
    const tokenData = await tokenModel.deleteOne({ refresh_token: refreshToken });

    return tokenData;
  } catch (error) {
    throw error;
  }
};

export const findToken = async (refreshToken: string) => {
  try {
    const tokenData = await tokenModel.findOne({ refresh_token: refreshToken });

    return tokenData;
  } catch (error) {
    throw error;
  }
};
