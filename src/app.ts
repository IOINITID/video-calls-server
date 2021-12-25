import express, { json } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import { MONGO_URL, PORT } from './constants';
import { defaultRouter } from './router';
import { isError } from './middlewares';

dotenv.config();

const app = express();

app.use(json());
app.use(cookieParser());
app.use(
  cors({
    credentials: true, // Разрешает cookies
    origin: 'http://localhost:3000',
  })
);
app.use('/api', defaultRouter);
app.use(isError);

const startServer = async () => {
  try {
    await mongoose.connect(MONGO_URL);

    app.listen(PORT, () => {
      console.log(`Server start on port ${PORT}...`);
    });
  } catch (error) {
    console.log('Some error...');
    console.log(error);
  }
};

startServer();
