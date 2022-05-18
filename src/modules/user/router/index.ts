import { Router } from 'express';
import { isAuthorizatedMiddleware } from 'core/middlewares';
import { getUsersController, getUserController, updateUserController } from 'modules/user/controllers';

// TODO: Сменить название для всех сервисов на patchUserService

/**
 * Router for user module.
 */
const userRouter = Router();

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
