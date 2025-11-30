const express = require('express');
const multer = require('multer');
const router = express.Router();
const path = require('path');
const {registerUser,verifyUser,login,getUserById,updateUser, deleteUser, getUsers,registerAdmin,registerOfflineCustomer, forgotPassword, resetPassword, searchUsers, uploadProfileImage, uploadProfileImageAdmin} = require('../controllers/authController');
const {auth,isAdmin, verifyTurnstile} = require('../middleware/authMiddleware');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/profile-pictures/"),
  filename: (req, file, cb) =>
    cb(null, Date.now() + "-" + file.originalname)
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
    cb(null, true);
  } else {
    cb(new Error("Only JPG and PNG files are allowed"), false);
  }
};

const upload = multer({ storage, fileFilter });

router.get("/search-users",auth, isAdmin, searchUsers);
router.post('/register', verifyTurnstile,registerUser);
router.post('/login',verifyTurnstile,login);
router.post("/forgot-password",verifyTurnstile, forgotPassword);
router.get("/verify/:token", verifyUser);
router.post("/reset-password/:token", resetPassword);
router.post("/offline-register",auth, isAdmin, registerOfflineCustomer);
router.get("/",auth,isAdmin,getUsers);
router.put("/upload-profile-image",auth,upload.single("profileImage"),uploadProfileImage)
router.put("/upload-profile-image-admin/:id",auth, isAdmin ,upload.single("profileImage"),uploadProfileImageAdmin);
router.get('/:id',auth,getUserById);
router.put("/:id",auth,updateUser);
router.delete("/:id",auth,isAdmin,deleteUser);
router.post("/register-admin",auth,isAdmin,registerAdmin);

// router.put("/:id",checkWP,updateUser);
// router.get("/",checkWP,getAllUsers);
// router.delete("/:id",checkWP,deleteUser);

module.exports = router;