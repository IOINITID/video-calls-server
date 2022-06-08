import { Router } from 'express';
import { isAuthorizatedMiddleware } from 'core/middlewares';
import { addToFriendsController, getFriendsController, removeFromFriendsController } from 'modules/friends/controllers';

/**
 * Router для модуля друзья.
 */
const friendsRouter = Router();

/**
 * Route для добавления в друзья.
 */
friendsRouter.post('/friends/add', isAuthorizatedMiddleware, addToFriendsController);

/**
 * Route для удаления из друзей.
 */
friendsRouter.post('/friends/remove', isAuthorizatedMiddleware, removeFromFriendsController);

/**
 * Route для получения списка друзей.
 */
friendsRouter.get('/friends', isAuthorizatedMiddleware, getFriendsController);

export { friendsRouter };
