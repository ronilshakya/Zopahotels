const express = require('express');
const router = express.Router();
const {auth,isAdmin} = require('../middleware/authMiddleware');
const { saveDraft, getCartByBookingAndRoom, removeDraftCart } = require('../controllers/cartController');

router.post('/save-draft',auth, isAdmin, saveDraft);
router.get('/get-cart/:bookingId/:roomBookingEntryId',auth, isAdmin, getCartByBookingAndRoom);
router.delete("/delete-cart/:bookingId/:roomBookingEntryId", auth, isAdmin, removeDraftCart);

module.exports = router;