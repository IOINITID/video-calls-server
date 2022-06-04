import { RequestHandler } from 'express';
import {
  confirmInvitationService,
  declineInvitationService,
  getInvitationsService,
  sentInvitationService,
} from '../services';

/**
 * Controller для отправки приглашения в друзья.
 */
export const sentInvitationController: RequestHandler = async (req, res, next) => {
  try {
    // NOTE: ID пользователя которому отправили приглашение в друзья
    const { friend_id } = req.body;

    // NOTE: Список пользователей которым отправленны и от которых полученны приглашение в друзья
    const { invitations } = await sentInvitationService({ user_id: (req as any).user.id, friend_id });

    // NOTE: Отправка списка пользователей
    return res.status(200).json({ invitations });
  } catch (error) {
    next(error);
  }
};

/**
 * Controller для принятия приглашения в друзья.
 */
export const confirmInvitationController: RequestHandler = async (req, res, next) => {
  try {
    // NOTE: ID пользователя который отправил приглашение в друзья
    const { friend_id } = req.body;

    // NOTE: Список пользователей которым отправленны и от которых полученны приглашение в друзья
    const { invitations } = await confirmInvitationService({ user_id: (req as any).user.id, friend_id });

    // NOTE: Отправка списка пользователей
    return res.status(200).json({ invitations });
  } catch (error) {
    next(error);
  }
};

/**
 * Controller для отклонения приглашения в друзья.
 */
export const declineInvitationController: RequestHandler = async (req, res, next) => {
  try {
    // NOTE: ID пользователя который отправил приглашение в друзья
    const { friend_id } = req.body;

    // NOTE: Список пользователей которым отправленны и от которых полученны приглашение в друзья
    const { invitations } = await declineInvitationService({ user_id: (req as any).user.id, friend_id });

    // NOTE: Отправка списка пользователей
    return res.status(200).json({ invitations });
  } catch (error) {
    next(error);
  }
};

/**
 * Controller для получения отправленных и полученных приглашений в друзья.
 */
export const getInvitationsController: RequestHandler = async (req, res, next) => {
  try {
    // NOTE: Список пользователей которым отправленны и от которых полученны приглашение в друзья
    const { invitations } = await getInvitationsService({ user_id: (req as any).user.id });

    // NOTE: Отправка списка пользователей
    return res.status(200).json({ invitations });
  } catch (error) {
    next(error);
  }
};
