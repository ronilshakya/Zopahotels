const express = require("express");
const router = express.Router();
const {createRoom, getAllRooms, getRoomById, updateRoom, deleteRoom} = require('../controllers/roomController');
const {auth,isAdmin} = require('../middleware/authMiddleware');

router.post('/', auth, isAdmin, createRoom);
router.put('/:id', auth, isAdmin, updateRoom);
router.delete('/:id',auth,isAdmin,deleteRoom);
router.get('/', getAllRooms);
router.get('/:id', getRoomById);

module.exports = router;