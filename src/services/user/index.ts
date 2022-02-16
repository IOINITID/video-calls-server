import { ApiError } from '../../exeptions';
import { Channel, Message, User } from '../../models';
import bcrypt from 'bcrypt';
import { nanoid } from 'nanoid';
import { mailService, tokenService } from '..';
import { API_URL } from '../../constants';
import { UserDto } from '../../dtos';
import { ObjectId } from 'mongoose';

class UserService {
  public registration = async (email: string, name: string, password: string) => {
    try {
      const candidate = await User.findOne({ email });

      if (candidate) {
        throw ApiError.BadRequest(`Пользователь с почтовым адресом ${email} уже существует.`);
      }

      const hashPassword = await bcrypt.hash(password, 3);

      const activationLink = nanoid();

      const user = await User.create({ email, name, password: hashPassword, activationLink });

      await mailService.sendActivationMail(email, `${API_URL}/api/activate/${activationLink}`);

      const userDto = new UserDto(user);

      const tokens = tokenService.generateTokens({ ...userDto });

      await tokenService.saveToken(userDto.id, tokens.refreshToken);

      return { ...tokens, user: userDto };
    } catch (error) {
      throw error;
    }
  };

  public activate = async (activationLink: string) => {
    try {
      const user = await User.findOne({ activationLink });

      if (!user) {
        throw ApiError.BadRequest('Некорректная ссылка активации.');
      }

      user.isActivated = true;

      await user.save();
    } catch (error) {
      throw error;
    }
  };

  public authorization = async (email: string, password: string) => {
    try {
      const user = await User.findOne({ email });

      if (!user) {
        throw ApiError.BadRequest('Пользователь с таким email не найден.');
      }

      const isPasswordEquals = await bcrypt.compare(password, user.password);

      if (!isPasswordEquals) {
        throw ApiError.BadRequest('Пароль не верный.');
      }

      const userDto = new UserDto(user);

      const tokens = tokenService.generateTokens({ ...userDto });

      await tokenService.saveToken(userDto.id, tokens.refreshToken);

      return { ...tokens };
    } catch (error) {
      throw error;
    }
  };

  public logout = async (refreshToken: string) => {
    try {
      await tokenService.removeToken(refreshToken);
    } catch (error) {
      throw error;
    }
  };

  public refresh = async (refreshToken: string) => {
    try {
      if (!refreshToken) {
        throw ApiError.UnauthorizedErrors();
      }

      const userData = tokenService.validateRefreshToken(refreshToken);

      const tokenFromDB = await tokenService.findToken(refreshToken);

      if (!userData || !tokenFromDB) {
        throw ApiError.UnauthorizedErrors();
      }

      const user = await User.findById((userData as any).id); // TODO: Добавить тип для id пользователя

      const userDto = new UserDto(user);

      const tokens = tokenService.generateTokens({ ...userDto });

      await tokenService.saveToken(userDto.id, tokens.refreshToken);

      return { ...tokens };
    } catch (error) {
      throw error;
    }
  };

  public getUsers = async (searchValue: string) => {
    try {
      if (!searchValue) {
        return [];
      }

      const users = await User.find({ name: { $regex: searchValue } });

      return users;
    } catch (error) {
      throw error;
    }
  };

  public getFriends = async (userId: string) => {
    try {
      const user = await User.findById(userId);

      if (!user) {
        throw ApiError.BadRequest('Пользователь не найден.');
      }

      // Нужен Promise.all для поиска всех друзей пользователя по id
      const friends = Promise.all(
        user.friends.map(async (friend) => {
          return await User.findById(friend);
        })
      );

      return friends;
    } catch (error) {
      throw error;
    }
  };

  public getInvites = async (userId: string) => {
    try {
      const user = await User.findById(userId);

      if (!user) {
        throw ApiError.BadRequest('Пользователь не найден.');
      }

      // Нужен Promise.all для поиска приглашений в друзья по id
      const invites = Promise.all(
        user.invites.map(async (invite) => {
          return await User.findById(invite);
        })
      );

      return invites;
    } catch (error) {
      throw error;
    }
  };

  public getApprovals = async (userId: string) => {
    try {
      const user = await User.findById(userId);

      if (!user) {
        throw ApiError.BadRequest('Пользователь не найден.');
      }

      // Нужен Promise.all для поиска приглашений в друзья по id
      const approvals = Promise.all(
        user.waitingForApproval.map(async (approval) => {
          return await User.findById(approval);
        })
      );

      return approvals;
    } catch (error) {
      throw error;
    }
  };

  public addInviteToFriends = async (friendId: ObjectId, userId: ObjectId) => {
    try {
      const userToAdd = await User.findById(friendId);

      if (!userToAdd) {
        throw ApiError.BadRequest('Пользователь для добавления в друзья не найден.');
      }

      userToAdd.invites.push(userId);

      await userToAdd.save();

      const user = await User.findById(userId);

      if (!user) {
        throw ApiError.UnauthorizedErrors();
      }

      user.waitingForApproval.push(friendId);

      await user.save();

      return { userToAdd, user };
    } catch (error) {
      throw error;
    }
  };

  public removeInviteToFriends = async (friendId: ObjectId, userId: ObjectId) => {
    try {
      const userToAdd = await User.findById(friendId);

      if (!userToAdd) {
        throw ApiError.BadRequest('Пользователь для добавления в друзья не найден.');
      }

      // Добавлено удаление для полей invites и waitingForApproval, так как отклонить заявку могут оба пользователя
      await User.updateOne({ _id: friendId }, { $pull: { invites: userId, waitingForApproval: userId } }); // Удаляет все вхождения по id пользователя

      await userToAdd.save();

      const user = await User.findById(userId);

      if (!user) {
        throw ApiError.UnauthorizedErrors();
      }

      // Добавлено удаление для полей invites и waitingForApproval, так как отклонить заявку могут оба пользователя
      await User.updateOne({ _id: userId }, { $pull: { waitingForApproval: friendId, invites: friendId } }); // Удаляет все вхождения по id пользователя

      await user.save();

      return { userToAdd, user };
    } catch (error) {
      throw error;
    }
  };

  public addToFriends = async (friendId: ObjectId, userId: ObjectId) => {
    try {
      const userToAdd = await User.findById(friendId);

      if (!userToAdd) {
        throw ApiError.BadRequest('Пользователь для добавления в друзья не найден.');
      }

      await User.updateOne({ _id: friendId }, { $pull: { invites: userId } }); // Удаляет все вхождения по id пользователя

      userToAdd.friends.push(userId);

      await userToAdd.save();

      const user = await User.findById(userId);

      if (!user) {
        throw ApiError.UnauthorizedErrors();
      }

      await User.updateOne({ _id: userId }, { $pull: { waitingForApproval: friendId } }); // Удаляет все вхождения по id пользователя

      user.friends.push(friendId);

      await user.save();

      return { userToAdd, user };
    } catch (error) {
      throw error;
    }
  };

  public removeFromFriends = async (friendId: ObjectId, userId: ObjectId) => {
    try {
      const userRemoving = await User.findById(friendId); // Пользователь который удаляет из друзей

      if (!userRemoving) {
        throw ApiError.UnauthorizedErrors();
      }

      await User.updateOne({ _id: friendId }, { $pull: { friends: userId } }); // Удаляет все вхождения по id пользователя

      await userRemoving.save();

      const user = await User.findById(userId); // Пользователь которого удаяляют из друзей

      if (!user) {
        throw ApiError.BadRequest('Пользователь не найден.');
      }

      await User.updateOne({ _id: userId }, { $pull: { friends: friendId } }); // Удаляет все вхождения по id пользователя

      await user.save();

      return { userRemoving, user };
    } catch (error) {
      throw error;
    }
  };

  public addChannel = async (title: string, type: string) => {
    try {
      const isChannel = await Channel.findOne({ title });

      if (isChannel) {
        throw ApiError.BadRequest('Такой канал уже существует.');
      }

      const channel = await Channel.create({ title, type });

      return { channel };
    } catch (error) {
      throw error;
    }
  };

  public getChannels = async () => {
    try {
      const channels = await Channel.find();

      return channels;
    } catch (error) {
      throw error;
    }
  };

  public addMessageToChannel = async (channelId: string, userId: string, userMessage: string) => {
    try {
      const channel = await Channel.findById(channelId);

      if (!channel) {
        throw ApiError.BadRequest('Такого канала нет.');
      }

      const message = await Message.create({ text: userMessage, author: userId });

      // Добавляет id модели сообщения в канал
      channel.messages.push(message._id);

      await channel.save();

      return message;
    } catch (error) {
      throw error;
    }
  };

  public getChannelMessages = async (channelId: string) => {
    try {
      const channel = await Channel.findById(channelId);

      if (!channel) {
        throw ApiError.BadRequest('Такого канала нет.');
      }

      const messages = await Promise.all(
        channel.messages.map(async (messageId) => {
          return await Message.findById(messageId);
        })
      );

      return messages;
    } catch (error) {
      throw error;
    }
  };

  public addPersonalMessagesChannel = async (userId: ObjectId, friendId: ObjectId) => {
    try {
      const user = await User.findById(userId);

      if (!user) {
        throw ApiError.BadRequest('Такого пользователя нет.');
      }

      const friend = await User.findById(friendId);

      if (!friend) {
        throw ApiError.BadRequest('Такого пользователя нет.');
      }

      const personalMessagesChannel = await Channel.create({ users: [userId, friendId] });

      return personalMessagesChannel;
    } catch (error) {
      throw error;
    }
  };

  public getPersonalMessagesChannels = async (userId: ObjectId) => {
    try {
      const personalMessagesChannels = await Channel.find({ users: userId });

      if (!personalMessagesChannels) {
        throw ApiError.BadRequest('Такой комнаты нет.');
      }

      const users = await Promise.all(
        personalMessagesChannels.map(async (value) => {
          const userData = await User.findById(value.users?.find((user: any) => String(user) !== String(userId)));

          return { value, userData };
        })
      );

      return users;
    } catch (error) {
      throw error;
    }
  };
}

export const userService = new UserService();
