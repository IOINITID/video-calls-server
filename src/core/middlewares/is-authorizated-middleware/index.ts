import { Request, RequestHandler } from 'express';
import { JwtPayload } from 'jsonwebtoken';
import { validateAccessToken } from '../../../modules/authorization/services/token-services';
import { ApiError } from '../../exeptions';

export const isAuthorizatedMiddleware: RequestHandler = (req: Request & { user?: string | JwtPayload }, res, next) => {
  try {
    const authorizationHeader = req.headers.authorization;

    if (!authorizationHeader) {
      return next(ApiError.UnauthorizedErrors());
    }

    const accessToken = authorizationHeader.split(' ')[1];

    if (!accessToken) {
      return next(ApiError.UnauthorizedErrors());
    }

    const userData = validateAccessToken(accessToken);

    if (!userData) {
      return next(ApiError.UnauthorizedErrors());
    }

    req.user = userData;

    next();
  } catch (error) {
    return next(ApiError.UnauthorizedErrors());
  }
};
