import { model, ObjectId, Schema } from 'mongoose';

type ChannelModel = {
  title: string;
  type: 'text' | 'video';
  messages: ObjectId[];
};

const channelSchema = new Schema<ChannelModel>(
  {
    title: String,
    type: String,
    messages: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Message',
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const Channel = model<ChannelModel>('Channel', channelSchema);
