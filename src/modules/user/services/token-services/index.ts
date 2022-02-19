import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { JWT_ACCESS_SECRET, JWT_REFRESH_SECRET } from '../../../../core/constants';
import { Token } from '../../models/token-model';

dotenv.config();

export const generateTokens = (payload: any) => {
  const accessToken = jwt.sign(payload, JWT_ACCESS_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: '30d' });

  return { accessToken, refreshToken };
};

export const saveToken = async (user: string, refreshToken: string) => {
  const tokenData = await Token.findOne({ user });

  if (tokenData) {
    tokenData.refreshToken = refreshToken;

    return tokenData.save();
  }

  const token = await Token.create({ user, refreshToken });

  return token;
};

export const validateAccessToken = (token: string) => {
  try {
    const userData = jwt.verify(token, JWT_ACCESS_SECRET);

    return userData;
  } catch (error) {
    return null;
  }
};

export const validateRefreshToken = (token: string) => {
  try {
    const userData = jwt.verify(token, JWT_REFRESH_SECRET);

    return userData;
  } catch (error) {
    return null;
  }
};

export const removeToken = async (refreshToken: string) => {
  try {
    const tokenData = await Token.deleteOne({ refreshToken });

    return tokenData;
  } catch (error) {
    throw error;
  }
};

export const findToken = async (refreshToken: string) => {
  try {
    const tokenData = await Token.findOne({ refreshToken });

    return tokenData;
  } catch (error) {
    throw error;
  }
};
