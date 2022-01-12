import { model, ObjectId, Schema } from 'mongoose';

type MessageModel = {
  text: string;
  author: ObjectId;
  created: Date;
  isRead: boolean;
};

const messageSchema = new Schema<MessageModel>(
  {
    text: String,
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
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
