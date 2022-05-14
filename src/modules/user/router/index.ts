import { Router } from 'express';
import { body } from 'express-validator';
import { isAuthorizatedMiddleware } from 'core/middlewares';
import { getUsersController, getUserController, updateUserController } from 'modules/user/controllers';
import {
  authorizationController,
  logoutController,
  refreshController,
  registrationController,
} from 'modules/authorization/controllers';

// TODO: Сменить название для всех сервисов на patchUserService

/**
 * Router for user module.
 */
const userRouter = Router();

/**
 * Route for user registration.
 */
userRouter.post(
  '/registration',
  body('email').isEmail(),
  body('name').not().isEmpty(),
  body('password').isLength({ min: 8 }),
  registrationController
);

/**
 * Route for user authorization.
 */
userRouter.post('/authorization', authorizationController);

/**
 * Route for user authorization refresh.
 */
userRouter.get('/refresh', refreshController);

/**
 * Route for user logout.
 */
userRouter.get('/logout', logoutController);

/**
 * Route for getting user data.
 */
userRouter.get('/user', isAuthorizatedMiddleware, getUserController);

/**
 * Route for updating user data.
 */
userRouter.patch('/user', isAuthorizatedMiddleware, updateUserController);

/**
 * Route for getting users by name.
 */
userRouter.post('/users', isAuthorizatedMiddleware, getUsersController);

export { userRouter };
