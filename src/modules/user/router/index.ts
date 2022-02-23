import { Router } from 'express';
import { body } from 'express-validator';
import { isAuthorizatedMiddleware } from 'core/middlewares';
import {
  userUsersController,
  userLogoutController,
  userAuthorizationController,
  userRefreshController,
  userRegistrationController,
  getUserController,
  patchUserController,
} from 'modules/user/controllers';

// TODO: Сменить название для всех сервисов на patchUserService

/**
 * Router for user module.
 */
const userRouter = Router();

/**
 * Route for user authorization.
 */
userRouter.post('/authorization', userAuthorizationController);

/**
 * Route for user authorization refresh.
 */
userRouter.get('/refresh', userRefreshController);

/**
 * Route for user registration.
 */
userRouter.post(
  '/registration',
  body('email').isEmail(),
  body('name').not().isEmpty(),
  body('password').isLength({ min: 8 }),
  userRegistrationController
);

/**
 * Route for user logout.
 */
userRouter.get('/logout', userLogoutController);

/**
 * Route for getting user data.
 */
userRouter.get('/user', isAuthorizatedMiddleware, getUserController);

/**
 * Route for updating user data.
 */
userRouter.patch('/user', isAuthorizatedMiddleware, patchUserController);

/**
 * Route for getting users by name.
 */
userRouter.post('/users', isAuthorizatedMiddleware, userUsersController);

export { userRouter };
