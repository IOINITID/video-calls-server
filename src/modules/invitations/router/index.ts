import { Router } from 'express';
import { isAuthorizatedMiddleware } from 'core/middlewares';
import {
  confirmInvitationController,
  declineInvitationController,
  getInvitationsController,
  sentInvitationController,
} from 'modules/invitations/controllers';

/**
 * Router для модуля приглашения в друзья.
 */
const invitationsRouter = Router();

/**
 * Route для отправки приглашения в друзья.
 */
invitationsRouter.post('/invitations/sent', isAuthorizatedMiddleware, sentInvitationController);

/**
 * Route для принятия приглашения в друзья.
 */
invitationsRouter.post('/invitations/confirm', isAuthorizatedMiddleware, confirmInvitationController);

/**
 * Route для отклонения приглашения в друзья.
 */
invitationsRouter.post('/invitations/decline', isAuthorizatedMiddleware, declineInvitationController);

/**
 * Route для получения отправленных и полученных приглашений в друзья.
 */
invitationsRouter.get('/invitations', isAuthorizatedMiddleware, getInvitationsController);

export { invitationsRouter };
