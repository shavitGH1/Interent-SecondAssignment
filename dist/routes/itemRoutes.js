"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const itemsController_1 = require("../controllers/itemsController");
const router = express_1.default.Router();
router.route('/items').get(itemsController_1.listItems).post(itemsController_1.createItem);
router.route('/items/:id').get(itemsController_1.getItem).put(itemsController_1.updateItem).delete(itemsController_1.deleteItem);
exports.default = router;
