import { model, ObjectId, Schema } from 'mongoose';

type TokenModel = {
  user: ObjectId | string;
  refreshToken: string;
};

const tokenSchema = new Schema<TokenModel>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  refreshToken: {
    type: String,
    required: true,
  },
});

export const Token = model<TokenModel>('Token', tokenSchema);
