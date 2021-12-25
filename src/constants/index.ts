import dotenv from 'dotenv';
import { ModeType } from '../types';

dotenv.config();

const Mode: ModeType = 'production';

export const APPLICATION_URL =
  Mode === 'production' ? 'https://ioinitid.github.io/video-calls/' : 'http://localhost:3000';

export const PORT = process.env.PORT || 8080;
export const MONGO_USER = process.env.MONGO_USER;
export const MONGO_PASSWORD = process.env.MONGO_PASSWORD;
export const MONGO_DB = process.env.MONGO_DB;
export const MONGO_URL = `mongodb+srv://${MONGO_USER}:${MONGO_PASSWORD}@cluster0.ynqln.mongodb.net/${MONGO_DB}?retryWrites=true&w=majority`;
