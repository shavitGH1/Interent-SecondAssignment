const express = require('express');
const {
  listItems,
  createItem,
  getItem,
  updateItem,
  deleteItem
} = require('../controllers/itemsController');

const router = express.Router();

router.route('/items').get(listItems).post(createItem);
router.route('/items/:id').get(getItem).put(updateItem).delete(deleteItem);

module.exports = router;
