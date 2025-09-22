const express = require('express');
const router = express.Router();
const { createHotel, getHotel, updateHotel, deleteHotel } = require('../controllers/hotelController');
const { auth, isAdmin } = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // Folder to store uploaded files
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

router.post('/', auth, isAdmin, upload.single('logo'), createHotel);
router.get('/', getHotel);                            
router.put('/', auth, isAdmin, upload.single('logo'), updateHotel);   
router.delete('/', auth, isAdmin, deleteHotel);

module.exports = router;
