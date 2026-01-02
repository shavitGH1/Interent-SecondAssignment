import mongoose, { Document, Schema } from 'mongoose';

export interface IItem extends Document {
  name: string;
  price: number;
  createdAt: Date;
  updatedAt: Date;
}

const itemSchema = new Schema<IItem>(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true }
  },
  { timestamps: true }
);

const Item = mongoose.model<IItem>('Item', itemSchema);

export default Item;
