import express from 'express';
import {
  listItems,
  createItem,
  getItem,
  updateItem,
  deleteItem
} from '../controllers/itemsController';

const router = express.Router();

router.route('/items').get(listItems).post(createItem);
router.route('/items/:id').get(getItem).put(updateItem).delete(deleteItem);

export default router;
