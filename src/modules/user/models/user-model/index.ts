import { model, ObjectId, Schema } from 'mongoose';

type UserModelDocument = {
  // NOTE: Поля которые создаются автоматически
  id: string;
};

export type UserModel = {
  // NOTE: Поля которые созданы
  email: string;
  name: string;
  password: string;
  color: string;
  default_color: string;
  status: 'online' | 'offline';
  socket_id: string;
  image: string;
  // NOTE: Данные которые нужно обработать
  isActivated: boolean;
  activationLink: string;
  friends: ObjectId[];
  invites: ObjectId[];
  waitingForApproval: ObjectId[];
  personalMessages: ObjectId;
} & UserModelDocument;

const userSchema = new Schema<UserModel>(
  {
    email: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    default_color: {
      type: String,
      required: true,
    },
    color: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      default: 'offline',
    },
    socket_id: {
      type: String,
      default: '',
    },
    image: {
      type: String,
      default: '',
    },
    // NOTE: Данные которые нужно обработать
    // isActivated: {
    //   type: Boolean,
    //   default: false,
    // },
    // activationLink: {
    //   type: String,
    // },
    // friends: [
    //   {
    //     type: Schema.Types.ObjectId,
    //     ref: 'User',
    //   },
    // ],
    // invites: [
    //   {
    //     type: Schema.Types.ObjectId,
    //     ref: 'User',
    //   },
    // ],
    // waitingForApproval: [
    //   {
    //     type: Schema.Types.ObjectId,
    //     ref: 'User',
    //   },
    // ],
    // personalMessages: {
    //   type: Schema.Types.ObjectId,
    //   ref: 'Channel',
    // },
  },
  { timestamps: true }
);

export const userModel = model<UserModel>('User', userSchema);
