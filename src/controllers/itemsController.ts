import { Request, Response } from 'express';
import Item from '../models/Item';

export const listItems = async (req: Request, res: Response): Promise<void> => {
  const items = await Item.find().sort({ createdAt: -1 });
  res.json(items.map((item) => ({
    id: item._id.toString(),
    name: item.name,
    price: item.price
  })));
};

export const createItem = async (req: Request, res: Response): Promise<void> => {
  const { name, price } = req.body;
  
  if (!name || typeof price !== 'number') {
    res.status(400).json({ message: 'name and numeric price are required' });
    return;
  }
  
  const item = new Item({ name, price });
  await item.save();
  
  res.status(201).json({
    id: item._id.toString(),
    name: item.name,
    price: item.price
  });
};

export const getItem = async (req: Request, res: Response): Promise<void> => {
  const item = await Item.findById(req.params.id);
  
  if (!item) {
    res.status(404).json({ message: 'Item not found' });
    return;
  }
  
  res.json({
    id: item._id.toString(),
    name: item.name,
    price: item.price
  });
};

export const updateItem = async (req: Request, res: Response): Promise<void> => {
  const item = await Item.findById(req.params.id);
  
  if (!item) {
    res.status(404).json({ message: 'Item not found' });
    return;
  }

  const { name, price } = req.body;
  if (!name || typeof price !== 'number') {
    res.status(400).json({ message: 'name and numeric price are required' });
    return;
  }
  
  item.name = name;
  item.price = price;
  await item.save();
  
  res.json({
    id: item._id.toString(),
    name: item.name,
    price: item.price
  });
};

export const deleteItem = async (req: Request, res: Response): Promise<void> => {
  const item = await Item.findById(req.params.id);
  
  if (!item) {
    res.status(404).json({ message: 'Item not found' });
    return;
  }
  
  await Item.deleteOne({ _id: req.params.id });
  res.status(204).send();
};
