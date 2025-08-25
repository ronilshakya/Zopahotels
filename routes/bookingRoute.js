const express = require('express');
const router = express.Router();
const {createBooking, getMyBookings, getAllBookings, getAvailableRooms} = require("../controllers/BookingController");
const {auth, isAdmin} = require("../middleware/authMiddleware");

router.post('/',auth, createBooking);
router.get('/me',auth, getMyBookings);
router.get('/',auth,isAdmin, getAllBookings);
router.get('/available',auth, getAvailableRooms);

module.exports = router;