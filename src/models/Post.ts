import mongoose, { Document, Schema } from 'mongoose';

export interface IPost extends Document {
  content: string;
  sender_id: number;
  createdAt: Date;
  updatedAt: Date;
}

const postSchema = new Schema<IPost>(
  {
    content: { type: String, required: true },
    sender_id: { type: Number, required: true }
  },
  { timestamps: true }
);

const Post = mongoose.model<IPost>('Post', postSchema);

export default Post;
