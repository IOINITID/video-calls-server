import { RequestHandler } from 'express';
import { validationResult } from 'express-validator';
import { CLIENT_URL } from '../../constants';
import { ApiError } from '../../exeptions';
import { userService } from '../../services';

class UserController {
  public registration: RequestHandler = async (req, res, next) => {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return next(ApiError.BadRequest('Ошибка при валидации.', errors.array()));
      }

      const userData = await userService.registration(req.body.email, req.body.name, req.body.password);

      res.cookie('refreshToken', userData.refreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true });

      return res.json(userData);
    } catch (error) {
      next(error);
    }
  };

  public authorization: RequestHandler = async (req, res, next) => {
    try {
      const userData = await userService.authorization(req.body.email, req.body.password);

      res.cookie('refreshToken', userData.refreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true });

      return res.json(userData);
    } catch (error) {
      next(error);
    }
  };

  public logout: RequestHandler = async (req, res, next) => {
    try {
      const token = await userService.logout(req.cookies.refreshToken);

      res.clearCookie('refreshToken');

      return res.json(token);
    } catch (error) {
      next(error);
    }
  };

  public activate: RequestHandler = async (req, res, next) => {
    try {
      await userService.activate(req.params.link);

      return res.redirect(CLIENT_URL);
    } catch (error) {
      next(error);
    }
  };

  public refresh: RequestHandler = async (req, res, next) => {
    try {
      const userData = await userService.refresh(req.cookies.refreshToken);

      res.cookie('refreshToken', userData.refreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true });

      return res.json(userData);
    } catch (error) {
      next(error);
    }
  };

  public getUsers: RequestHandler = async (req, res, next) => {
    try {
      const users = await userService.getUsers();

      return res.json(users);
    } catch (error) {
      next(error);
    }
  };

  public addInviteToFriends: RequestHandler = async (req, res, next) => {
    try {
      const users = await userService.addInviteToFriends(req.body.friendId, (req as any).user.id);

      return res.json(users);
    } catch (error) {
      next(error);
    }
  };

  public addToFriends: RequestHandler = async (req, res, next) => {
    try {
      const users = await userService.addToFriends(req.body.friendId, (req as any).user.id);

      return res.json(users);
    } catch (error) {
      next(error);
    }
  };
}

export const userController = new UserController();
