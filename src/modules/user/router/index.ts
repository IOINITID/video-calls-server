import { Router } from 'express';
import { isAuthorizatedMiddleware } from 'core/middlewares';
import { getUsersController, getUserController, updateUserController } from 'modules/user/controllers';

/**
 * Router для модуля пользователи.
 */
const userRouter = Router();

/**
 * Route для получения данных пользователя.
 */
userRouter.get('/user', isAuthorizatedMiddleware, getUserController);

/**
 * Route для обновления данных пользователя.
 */
userRouter.patch('/user', isAuthorizatedMiddleware, updateUserController);

/**
 * Route для получения списка пользователей.
 */
userRouter.get('/users', isAuthorizatedMiddleware, getUsersController);

export { userRouter };
