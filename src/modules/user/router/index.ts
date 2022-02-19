import { Router } from 'express';
import { body } from 'express-validator';
import { isAuthorizatedMiddleware } from 'core/middlewares';
import {
  userUsersController,
  userLogoutController,
  userAuthorizationController,
  userRefreshController,
  userRegistrationController,
  userUserController,
} from 'modules/user/controllers';

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
  body('password').isLength({ min: 8 }),
  userRegistrationController
);

/**
 * Route for user logout.
 */
userRouter.get('/logout', userLogoutController);

/**
 * Route for getting users by name.
 */
userRouter.get('/user', isAuthorizatedMiddleware, userUserController);

/**
 * Route for getting users by name.
 */
userRouter.post('/users', isAuthorizatedMiddleware, userUsersController);

export { userRouter };
