import { ApiError } from '../../exeptions';
import { User } from '../../models';
import bcrypt from 'bcrypt';
import { nanoid } from 'nanoid';
import { mailService, tokenService } from '..';
import { API_URL } from '../../constants';
import { UserDto } from '../../dtos';
import { ObjectId, Types } from 'mongoose';

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

      return { ...tokens, user: userDto };
    } catch (error) {
      throw error;
    }
  };

  public logout = async (refreshToken: string) => {
    try {
      const token = await tokenService.removeToken(refreshToken);

      return token;
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

      return { ...tokens, user: userDto };
    } catch (error) {
      throw error;
    }
  };

  public getUsers = async () => {
    try {
      const users = await User.find();

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
}

export const userService = new UserService();
