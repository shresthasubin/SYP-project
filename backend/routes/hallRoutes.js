import express from 'express';
import { getHalls, getHallById, createHall, updateHall, deleteHall } from '../controllers/hallController.js';

const router = express.Router();

router.get('/', getHalls);
router.get('/:id', getHallById);
router.post('/', createHall);
router.put('/:id', updateHall);
router.delete('/:id', deleteHall);

export default router;
