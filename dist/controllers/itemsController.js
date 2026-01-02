"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteItem = exports.updateItem = exports.getItem = exports.createItem = exports.listItems = void 0;
const Item_1 = __importDefault(require("../models/Item"));
const listItems = async (req, res) => {
    const items = await Item_1.default.find().sort({ createdAt: -1 });
    res.json(items.map((item) => ({
        id: item._id.toString(),
        name: item.name,
        price: item.price
    })));
};
exports.listItems = listItems;
const createItem = async (req, res) => {
    const { name, price } = req.body;
    if (!name || typeof price !== 'number') {
        res.status(400).json({ message: 'name and numeric price are required' });
        return;
    }
    const item = new Item_1.default({ name, price });
    await item.save();
    res.status(201).json({
        id: item._id.toString(),
        name: item.name,
        price: item.price
    });
};
exports.createItem = createItem;
const getItem = async (req, res) => {
    const item = await Item_1.default.findById(req.params.id);
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
exports.getItem = getItem;
const updateItem = async (req, res) => {
    const item = await Item_1.default.findById(req.params.id);
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
exports.updateItem = updateItem;
const deleteItem = async (req, res) => {
    const item = await Item_1.default.findById(req.params.id);
    if (!item) {
        res.status(404).json({ message: 'Item not found' });
        return;
    }
    await Item_1.default.deleteOne({ _id: req.params.id });
    res.status(204).send();
};
exports.deleteItem = deleteItem;
