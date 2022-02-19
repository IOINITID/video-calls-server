import { model, ObjectId, Schema } from 'mongoose';

type MessageModel = {
  text: string;
  author: {
    _id: string;
    email: string;
    name: string;
    status: string;
  };
  created: Date;
  isRead: boolean;
};

const messageSchema = new Schema<MessageModel>(
  {
    text: String,
    author: {
      _id: String,
      email: String,
      name: String,
      status: String,
    },
    created: {
      type: Date,
      default: new Date(),
    },
    isRead: Boolean,
  },
  {
    timestamps: true,
  }
);

export const Message = model<MessageModel>('Message', messageSchema);
