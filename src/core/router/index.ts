import { Router } from 'express';
import { userController } from '../controllers';
import { isAuthorizatedMiddleware } from '../middlewares';

const router = Router();

router.get('/activate/:link', userController.activate);

router.get('/friends', isAuthorizatedMiddleware, userController.getFriends);

router.get('/invites', isAuthorizatedMiddleware, userController.getInvites);

router.get('/approvals', isAuthorizatedMiddleware, userController.getApprovals);

router.post('/add-invite-to-friends', isAuthorizatedMiddleware, userController.addInviteToFriends);

router.post('/remove-invite-to-friends', isAuthorizatedMiddleware, userController.removeInviteToFriends);

router.post('/add-to-friends', isAuthorizatedMiddleware, userController.addToFriends);

router.post('/remove-from-friends', isAuthorizatedMiddleware, userController.removeFromFriends);

router.post('/add-channel', isAuthorizatedMiddleware, userController.addChannel);

router.get('/get-channels', isAuthorizatedMiddleware, userController.getChannels);

router.post('/add-message-to-channel', isAuthorizatedMiddleware, userController.addMessageToChannel);

router.post('/get-channel-messages', isAuthorizatedMiddleware, userController.getChannelMessages);

router.post('/add-personal-messages-channel', isAuthorizatedMiddleware, userController.addPersonalMessagesChannel);

router.post('/get-personal-messages-channels', isAuthorizatedMiddleware, userController.getPersonalMessagesChannels);

export const defaultRouter = router;
