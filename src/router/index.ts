import { Router } from 'express';
import { body } from 'express-validator';
import { userController } from '../controllers';
import { isAuthorizated } from '../middlewares';
import cors from 'cors';

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

router.get('/approvals', isAuthorizated, userController.getApprovals);

router.post('/add-invite-to-friends', isAuthorizated, userController.addInviteToFriends);

router.post('/remove-invite-to-friends', isAuthorizated, userController.removeInviteToFriends);

router.post('/add-to-friends', isAuthorizated, userController.addToFriends);

router.post('/remove-from-friends', isAuthorizated, userController.removeFromFriends);

router.post('/add-channel', isAuthorizated, userController.addChannel);

router.get('/get-channels', isAuthorizated, userController.getChannels);

router.post('/add-message-to-channel', isAuthorizated, userController.addMessageToChannel);

router.post('/get-channel-messages', isAuthorizated, userController.getChannelMessages);

export const defaultRouter = router;
