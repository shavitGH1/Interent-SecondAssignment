const Item = require('../models/Item');

const listItems = async (req, res) => {
  const items = await Item.find().sort({ createdAt: -1 });
  res.json(items.map((item) => ({
    id: item._id,
    name: item.name,
    price: item.price
  })));
};

const createItem = async (req, res) => {
  const { name, price } = req.body;
  if (!name || typeof price !== 'number') {
    return res.status(400).json({ message: 'name and numeric price are required' });
  }
  
  const item = new Item({ name, price });
  await item.save();
  
  res.status(201).json({
    id: item._id,
    name: item.name,
    price: item.price
  });
};

const getItem = async (req, res) => {
  const item = await Item.findById(req.params.id);
  if (!item) return res.status(404).json({ message: 'Item not found' });
  
  res.json({
    id: item._id,
    name: item.name,
    price: item.price
  });
};

const updateItem = async (req, res) => {
  const item = await Item.findById(req.params.id);
  if (!item) return res.status(404).json({ message: 'Item not found' });

  const { name, price } = req.body;
  if (!name || typeof price !== 'number') {
    return res.status(400).json({ message: 'name and numeric price are required' });
  }
  
  item.name = name;
  item.price = price;
  await item.save();
  
  res.json({
    id: item._id,
    name: item.name,
    price: item.price
  });
};

const deleteItem = async (req, res) => {
  const item = await Item.findById(req.params.id);
  if (!item) return res.status(404).json({ message: 'Item not found' });
  
  await Item.deleteOne({ _id: req.params.id });
  res.status(204).send();
};

module.exports = { listItems, createItem, getItem, updateItem, deleteItem };
