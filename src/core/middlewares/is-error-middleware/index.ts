import { ErrorRequestHandler } from 'express';
import { ApiError } from '../../exeptions';

export const isErrorMiddleware: ErrorRequestHandler = (err, req, res, next) => {
  console.log(err);

  if (err instanceof ApiError) {
    return res.status(err.status).json({ message: err.message, errors: err.errors });
  }

  return res.status(500).json({ message: 'Произошла ошибка сервера.' });
};
