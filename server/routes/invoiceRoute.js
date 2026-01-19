const express = require('express');
const router = express.Router();
const {auth,isAdmin} = require('../middleware/authMiddleware');
const {getAllInvoices, getInvoiceById, getInvoiceByBooking, applyDiscount, applyVAT, resetInvoice, paidInvoiceStatus, deleteInvoice, getInvoiceReport, exportInvoiceReport} = require('../controllers/invoiceController');

router.get('/', auth, isAdmin, getAllInvoices);
// Important: keep specific routes ABOVE "/:id" to avoid route collisions
router.get('/invoices', auth, isAdmin, getInvoiceReport);
router.get('/invoices/export', auth, isAdmin, exportInvoiceReport);
router.get('/get-invoice-by-booking/:bookingId', auth, isAdmin, getInvoiceByBooking);
router.post('/apply-discount/', auth, isAdmin, applyDiscount);
router.post('/apply-vat/', auth, isAdmin, applyVAT);
router.post('/reset-invoice/', auth, isAdmin, resetInvoice);
router.post('/finalize-invoice/:invoiceId', auth, isAdmin, paidInvoiceStatus);
router.delete('/:invoiceId', auth, isAdmin, deleteInvoice);
router.get('/:id', auth, isAdmin, getInvoiceById);

module.exports = router;