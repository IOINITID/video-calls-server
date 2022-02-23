import { model, ObjectId, Schema } from 'mongoose';

// TODO: Добавить цвет профля пользователя по умолчанию набор из нескольких случайных
// TODO: Добавить ссылку на изображение
export type UserModel = {
  id: string;
  email: string;
  name: string;
  password: string;
  color: string;
  image: string;
  isActivated: boolean;
  activationLink: string;
  status: string;
  socketId: string;
  friends: ObjectId[];
  invites: ObjectId[];
  waitingForApproval: ObjectId[];
  personalMessages: ObjectId;
};

const userSchema = new Schema<UserModel>(
  {
    email: {
      type: String,
      unique: true,
      required: true,
    },
    name: {
      type: String,
      default: '',
    },
    password: {
      type: String,
      required: true,
    },
    color: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    isActivated: {
      type: Boolean,
      default: false,
    },
    activationLink: {
      type: String,
    },
    status: {
      type: String,
      default: 'offline',
    },
    socketId: {
      type: String,
      default: '',
    },
    friends: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    invites: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    waitingForApproval: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    personalMessages: {
      type: Schema.Types.ObjectId,
      ref: 'Channel',
    },
  },
  {
    timestamps: true,
  }
);

export const userModel = model<UserModel>('User', userSchema);
