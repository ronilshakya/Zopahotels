const express = require('express');
const router = express.Router();
const { createHotel, getHotel, updateHotel, deleteHotel, addAmenity, getAmenities, updateAmenity, deleteAmenity } = require('../controllers/hotelController');
const { auth, isAdmin, accessDisabledForStaff } = require('../middleware/authMiddleware');
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

const amenityStorage = multer.diskStorage({
  destination: "./uploads/amenities",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});


const upload = multer({ storage: storage });
const uploadAmenityIcon = multer({ storage: amenityStorage });

router.post('/', auth, isAdmin,accessDisabledForStaff, upload.single('logo'), createHotel);
router.get('/', getHotel);                            
router.put('/', auth, isAdmin,accessDisabledForStaff, upload.single('logo'), updateHotel);   
router.delete('/', auth, isAdmin,accessDisabledForStaff, deleteHotel);

router.post('/amenities', auth, isAdmin,accessDisabledForStaff, uploadAmenityIcon.single('icon'), addAmenity);
router.get('/amenities', auth, isAdmin,accessDisabledForStaff, getAmenities);
router.put('/amenities/:id', auth, isAdmin,accessDisabledForStaff, uploadAmenityIcon.single('icon'), updateAmenity);
router.delete('/amenities/:id', auth, isAdmin,accessDisabledForStaff, deleteAmenity);

module.exports = router;
