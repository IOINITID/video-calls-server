import dotenv from 'dotenv';

dotenv.config();

export const PORT = process.env.PORT || 8080;
export const MONGO_USER = process.env.MONGO_USER;
export const MONGO_PASSWORD = process.env.MONGO_PASSWORD;
export const MONGO_DB = process.env.MONGO_DB;
// NOTE: Server Atlas база данных
// export const MONGO_URL = `mongodb+srv://${MONGO_USER}:${MONGO_PASSWORD}@cluster0.ynqln.mongodb.net/${MONGO_DB}?retryWrites=true&w=majority`;
// NOTE: Локальная база данных в Docker
// export const MONGO_URL = `mongodb://${MONGO_USER}:${MONGO_PASSWORD@localhost:27017/${MONGO_DB}?authSource=admin`;
export const API_URL: string = process.env.API_URL || '';
export const CLIENT_URL: string = process.env.CLIENT_URL || '';
export const SMTP_HOST: string = process.env.SMTP_HOST || '';
export const SMTP_PORT: number = Number(process.env.SMTP_PORT) || 587;
export const SMTP_USER: string = process.env.SMTP_USER || '';
export const SMTP_PASSWORD: string = process.env.SMTP_PASSWORD || '';
export const JWT_SECRET: string = process.env.JWT_SECRET || '';
export const JWT_ACCESS_SECRET: string = process.env.JWT_ACCESS_SECRET || '';
export const JWT_REFRESH_SECRET: string = process.env.JWT_REFRESH_SECRET || '';
export const CORS_ORIGIN: string = process.env.CORS_ORIGIN || '';
export const POSTGRES_USER = process.env.POSTGRES_USER || '';
export const POSTGRES_HOST = process.env.POSTGRES_HOST || '';
export const POSTGRES_DATABASE = process.env.POSTGRES_DATABASE || '';
export const POSTGRES_PASSWORD = process.env.POSTGRES_PASSWORD || '';
export const POSTGRES_PORT = Number(process.env.POSTGRES_PORT) || 5432;
