import { RequestHandler } from 'express';
import { CLIENT_URL } from 'core/constants';
import { userService } from 'core/services/user-service';

class UserController {
  public activate: RequestHandler = async (req, res, next) => {
    try {
      await userService.activate(req.params.link);

      return res.redirect(CLIENT_URL);
    } catch (error) {
      next(error);
    }
  };

  public getFriends: RequestHandler = async (req, res, next) => {
    try {
      const friends = await userService.getFriends((req as any).user.id);

      return res.json(friends);
    } catch (error) {
      next(error);
    }
  };

  public getInvites: RequestHandler = async (req, res, next) => {
    try {
      const invites = await userService.getInvites((req as any).user.id);

      return res.json(invites);
    } catch (error) {
      next(error);
    }
  };

  public getApprovals: RequestHandler = async (req, res, next) => {
    try {
      const approvals = await userService.getApprovals((req as any).user.id);

      return res.json(approvals);
    } catch (error) {
      next(error);
    }
  };

  public addInviteToFriends: RequestHandler = async (req, res, next) => {
    try {
      const users = await userService.addInviteToFriends(req.body.friendId, (req as any).user.id);

      return res.json(users);
    } catch (error) {
      next(error);
    }
  };

  public removeInviteToFriends: RequestHandler = async (req, res, next) => {
    try {
      const users = await userService.removeInviteToFriends(req.body.friendId, (req as any).user.id);

      return res.json(users);
    } catch (error) {
      next(error);
    }
  };

  public addToFriends: RequestHandler = async (req, res, next) => {
    try {
      const users = await userService.addToFriends((req as any).user.id, req.body.friendId);

      return res.json(users);
    } catch (error) {
      next(error);
    }
  };

  public removeFromFriends: RequestHandler = async (req, res, next) => {
    try {
      const users = await userService.removeFromFriends((req as any).user.id, req.body.friendId);

      return res.json(users);
    } catch (error) {
      next(error);
    }
  };

  public addChannel: RequestHandler = async (req, res, next) => {
    try {
      const channel = await userService.addChannel(req.body.title, req.body.type);

      return res.json(channel);
    } catch (error) {
      next(error);
    }
  };

  public getChannels: RequestHandler = async (req, res, next) => {
    try {
      const channels = await userService.getChannels();

      return res.json(channels);
    } catch (error) {
      next(error);
    }
  };

  public addMessageToChannel: RequestHandler = async (req, res, next) => {
    try {
      const message = await userService.addMessageToChannel(req.body.channel, (req as any).user.id, req.body.message);

      return res.json(message);
    } catch (error) {
      next(error);
    }
  };

  public getChannelMessages: RequestHandler = async (req, res, next) => {
    try {
      const messages = await userService.getChannelMessages(req.body.channel);

      return res.json(messages);
    } catch (error) {
      next(error);
    }
  };

  public addPersonalMessagesChannel: RequestHandler = async (req, res, next) => {
    try {
      const personalMessagesChannel = await userService.addPersonalMessagesChannel(
        (req as any).user.id,
        req.body.friendId
      );

      return res.json(personalMessagesChannel);
    } catch (error) {
      next(error);
    }
  };

  public getPersonalMessagesChannels: RequestHandler = async (req, res, next) => {
    try {
      const personalMessagesChannels = await userService.getPersonalMessagesChannels((req as any).user.id);

      return res.json(personalMessagesChannels);
    } catch (error) {
      next(error);
    }
  };
}

export const userController = new UserController();
