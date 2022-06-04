import { Router } from 'express';
import { isAuthorizatedMiddleware } from 'core/middlewares';
import { addToFriendsController, getFriendsController, removeFromFriendsController } from 'modules/friends/controllers';

/**
 * Router для модуля друзья.
 */
const freindsRouter = Router();

/**
 * Route для добавления в друзья.
 */
freindsRouter.post('/friends/add', isAuthorizatedMiddleware, addToFriendsController);

/**
 * Route для удаления из друзей.
 */
freindsRouter.post('/friends/remove', isAuthorizatedMiddleware, removeFromFriendsController);

/**
 * Route для получения списка друзей.
 */
freindsRouter.get('/friends', isAuthorizatedMiddleware, getFriendsController);

export { freindsRouter };
