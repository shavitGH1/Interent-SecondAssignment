import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  sender_id: number;
  content: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    sender_id: { type: Number, required: true, unique: true },
    content: { type: String, default: '' },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true }
  },
  { timestamps: true }
);

const User = mongoose.model<IUser>('User', userSchema);

export default User;
