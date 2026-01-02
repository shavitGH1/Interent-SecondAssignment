const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
  {
    content: { type: String, required: true },
    sender_id: { type: Number, required: true },
    post_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true }
  },
  { timestamps: true }
);

const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;
