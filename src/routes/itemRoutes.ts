import express from 'express';
import {
  listItems,
  createItem,
  getItem,
  updateItem,
  deleteItem
} from '../controllers/itemsController';

const router = express.Router();

/**
 * @openapi
 * /api/items:
 *   get:
 *     tags:
 *       - Items
 *     summary: List all items
 *     description: Retrieve a list of all items
 *     responses:
 *       200:
 *         description: Array of items
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Item'
 *   post:
 *     tags:
 *       - Items
 *     summary: Create a new item
 *     description: Create a new item in the system
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - price
 *             properties:
 *               name:
 *                 type: string
 *               price:
 *                 type: number
 *                 format: float
 *     responses:
 *       201:
 *         description: Item created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Item'
 *       400:
 *         description: Invalid input
 * /api/items/{id}:
 *   get:
 *     tags:
 *       - Items
 *     summary: Get item by ID
 *     description: Retrieve a specific item by its ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Item found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Item'
 *       404:
 *         description: Item not found
 *   put:
 *     tags:
 *       - Items
 *     summary: Update item
 *     description: Update an existing item
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               price:
 *                 type: number
 *     responses:
 *       200:
 *         description: Item updated successfully
 *       404:
 *         description: Item not found
 *   delete:
 *     tags:
 *       - Items
 *     summary: Delete item
 *     description: Delete an item by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Item deleted successfully
 *       404:
 *         description: Item not found
 */
router.route('/items').get(listItems).post(createItem);
router.route('/items/:id').get(getItem).put(updateItem).delete(deleteItem);

export default router;
