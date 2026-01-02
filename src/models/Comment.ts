import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IComment extends Document {
  content: string;
  sender_id: number;
  post_id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const commentSchema = new Schema<IComment>(
  {
    content: { type: String, required: true },
    sender_id: { type: Number, required: true },
    post_id: { type: Schema.Types.ObjectId, ref: 'Post', required: true }
  },
  { timestamps: true }
);

const Comment = mongoose.model<IComment>('Comment', commentSchema);

export default Comment;
