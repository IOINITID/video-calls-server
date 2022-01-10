import { model, Schema } from 'mongoose';

type ChannelModel = {
  title: string;
  type: 'text' | 'video';
};

const channelSchema = new Schema<ChannelModel>(
  {
    title: String,
    type: String,
  },
  {
    timestamps: true,
  }
);

export const Channel = model<ChannelModel>('Channel', channelSchema);
