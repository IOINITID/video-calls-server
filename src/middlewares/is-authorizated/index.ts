import { Request, RequestHandler } from 'express';
import { JwtPayload } from 'jsonwebtoken';
import { ApiError } from '../../exeptions';
import { tokenService } from '../../services';

export const isAuthorizated: RequestHandler = (req: Request & { user?: string | JwtPayload }, res, next) => {
  try {
    const authorizationHeader = req.headers.authorization;

    if (!authorizationHeader) {
      return next(ApiError.UnauthorizedErrors());
    }

    const accessToken = authorizationHeader.split(' ')[1];

    if (!accessToken) {
      return next(ApiError.UnauthorizedErrors());
    }

    const userData = tokenService.validateAccessToken(accessToken);

    if (!userData) {
      return next(ApiError.UnauthorizedErrors());
    }

    req.user = userData;

    next();
  } catch (error) {
    return next(ApiError.UnauthorizedErrors());
  }
};
