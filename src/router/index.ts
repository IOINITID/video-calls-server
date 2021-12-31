import { Router } from 'express';
import { body } from 'express-validator';
import { userController } from '../controllers';
import { isAuthorizated } from '../middlewares';

const router = Router();

router.post(
  '/registration',
  body('email').isEmail(),
  body('password').isLength({ min: 8 }),
  userController.registration
);

router.post('/authorization', userController.authorization);

router.post('/logout', userController.logout);

router.get('/activate/:link', userController.activate);

router.get('/refresh', userController.refresh);

router.get('/users', isAuthorizated, userController.getUsers);

router.get('/friends', isAuthorizated, userController.getFriends);

router.get('/invites', isAuthorizated, userController.getInvites);

router.post('/add-invite-to-friends', isAuthorizated, userController.addInviteToFriends);

router.post('/add-to-friends', isAuthorizated, userController.addToFriends);

export const defaultRouter = router;
