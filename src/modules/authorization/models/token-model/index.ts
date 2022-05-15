import { model, ObjectId, Schema } from 'mongoose';

type TokenModelDocument = {
  // NOTE: Поля которые создаются автоматически
  id: string;
};

type TokenModel = {
  user: ObjectId | string;
  refresh_token: string;
} & TokenModelDocument;

const tokenSchema = new Schema<TokenModel>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    refresh_token: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const tokenModel = model<TokenModel>('Token', tokenSchema);
