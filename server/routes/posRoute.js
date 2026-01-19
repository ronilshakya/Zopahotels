const express = require('express');
const router = express.Router();
const {auth,isAdmin} = require('../middleware/authMiddleware');
const multer = require("multer"); const path = require("path");
const {
    createCategory, 
    createSubCategory,
    deleteCategory,
    deleteSubCategory,
    getCategories,
    getSubCategories,
    updateCategory,
    updateSubCategory,
    createItem,
    getItems,
    updateItem,
    deleteItem,
    createPOSBooking,
    searchItems,
    createPOSWalkIn,
    getPOSOrders,
    getPOSOrderById,
    createPOSMember,
    getPOSOrderByUserId
} = require('../controllers/posController');

const storage = multer.diskStorage({ 
    destination: function (req, file, cb) { 
        cb(null, "uploads/pos-items"); // folder where images will be stored 
    }, 
    filename: function (req, file, cb) { 
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9); 
        cb(null, uniqueSuffix + path.extname(file.originalname)); 
    } 
});

const fileFilter = (req, file, cb) => { 
    const allowedTypes = /jpeg|jpg|png|gif/; 
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase()); 
    const mimetype = allowedTypes.test(file.mimetype); 
    if (extname && mimetype) { 
        cb(null, true); 
    } else { 
        cb(new Error("Only images are allowed")); 
    } 
};
const upload = multer({ 
    storage: storage, 
    fileFilter: fileFilter
});

router.post('/create-category',auth, isAdmin, createCategory);
router.post('/create-sub-category',auth, isAdmin, createSubCategory);
router.post('/create-item', auth, isAdmin, upload.single("image"), createItem);
router.post('/create-pos',auth, isAdmin, createPOSBooking);
router.post('/create-pos-walkin',auth, isAdmin, createPOSWalkIn);
router.post('/create-pos-member',auth, isAdmin, createPOSMember);

router.get('/search-items',auth, isAdmin, searchItems);

router.get('/get-pos-walkin',auth, isAdmin, getPOSOrders);
router.get('/get-categories',auth, isAdmin, getCategories);
router.get('/get-sub-categories/:categoryId',auth, isAdmin, getSubCategories);
router.get('/get-items/:subcategoryId',auth, isAdmin, getItems);
router.get('/get-pos-order/:orderId',auth, isAdmin, getPOSOrderById);
router.get('/get-pos-order-by-user/:userId',auth, isAdmin, getPOSOrderByUserId);

router.put('/update-category/:id',auth, isAdmin, updateCategory);
router.put('/update-sub-category/:id',auth, isAdmin, updateSubCategory);
router.put('/update-item/:itemId',auth, isAdmin,upload.single("image"), updateItem);           
router.delete('/delete-category/:id',auth, isAdmin, deleteCategory);
router.delete('/delete-sub-category/:id',auth, isAdmin, deleteSubCategory);
router.delete('/delete-item/:itemId',auth, isAdmin, deleteItem);

module.exports = router;