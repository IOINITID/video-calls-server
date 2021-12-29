import { ApiError } from '../../exeptions';
import { User } from '../../models';
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

  public addToFriends = async (friendId: ObjectId, userId: ObjectId) => {
    try {
      const userToAdd = await User.findById(friendId);

      if (!userToAdd) {
        throw ApiError.BadRequest('Пользователь для добавления в друзья не найден.');
      }

      userToAdd.invites = userToAdd.invites.filter((inviteId) => inviteId !== userId);
      userToAdd.friends.push(userId);

      await userToAdd.save();

      const user = await User.findById(userId);

      if (!user) {
        throw ApiError.UnauthorizedErrors();
      }

      user.waitingForApproval = user.waitingForApproval.filter((waitingId) => waitingId !== friendId);
      user.friends.push(friendId);

      await user.save();

      return { userToAdd, user };
    } catch (error) {
      throw error;
    }
  };
}

export const userService = new UserService();
