import { model, Schema } from 'mongoose';

type UserModel = {
  email: string;
  password: string;
  isActivated: boolean;
  activationLink: string;
  status: string;
  socketId: string;
};

const userSchema = new Schema<UserModel>(
  {
    email: {
      type: String,
      unique: true,
      required: true,
    },
    password: {
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
  },
  {
    timestamps: true,
  }
);

export const User = model<UserModel>('User', userSchema);
