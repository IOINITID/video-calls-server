import { Router } from 'express';
import { body } from 'express-validator';
import { userController } from '../controllers';
import { isAuthorizated } from '../middlewares';

const router = Router();

router.post('/authorization', userController.authorization);

router.get('/refresh', userController.refresh);

router.post(
  '/registration',
  body('email').isEmail(),
  body('password').isLength({ min: 8 }),
  userController.registration
);

router.get('/logout', userController.logout);

router.get('/activate/:link', userController.activate);

router.post('/users', isAuthorizated, userController.getUsers);

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

router.post('/add-personal-messages-channel', isAuthorizated, userController.addPersonalMessagesChannel);

router.post('/get-personal-messages-channels', isAuthorizated, userController.getPersonalMessagesChannels);

export const defaultRouter = router;
