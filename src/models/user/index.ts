import { model, ObjectId, Schema } from 'mongoose';

type UserModel = {
  email: string;
  name: string;
  password: string;
  isActivated: boolean;
  activationLink: string;
  status: string;
  socketId: string;
  friends: ObjectId[];
  invites: ObjectId[];
  waitingForApproval: ObjectId[];
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
  },
  {
    timestamps: true,
  }
);

export const User = model<UserModel>('User', userSchema);