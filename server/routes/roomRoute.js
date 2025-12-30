const express = require("express");
const router = express.Router();
const {createRoom, getAllRooms, getRoomById, updateRoom, deleteRoom, updateRoomCleaningStatus} = require('../controllers/roomController');
const {auth,isAdmin} = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require("path");

const storage = multer.diskStorage({
    destination: (req,file,cb) =>{
        cb(null,"uploads/rooms/");
    },
    filename: (req,file,cb) =>{
        cb(null, Date.now() + "-" + file.originalname);
    },
})

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error("Only images are allowed"));
  }
};

const upload = multer({ storage, fileFilter });

router.get('/', getAllRooms);

router.put('/update-room-cleaning-status',auth,isAdmin,updateRoomCleaningStatus);
router.post('/', auth, isAdmin, upload.array("images"), createRoom);
router.put('/:id', auth, isAdmin,upload.array("images"), updateRoom);
router.delete('/:id',auth,isAdmin,deleteRoom);
router.get('/:id', getRoomById);

module.exports = router;