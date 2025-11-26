const express = require('express');
const router = express.Router();
const {registerUser,verifyUser,login,getUserById,updateUser, deleteUser, getUsers,registerAdmin,registerOfflineCustomer, forgotPassword, resetPassword, searchUsers} = require('../controllers/authController');
const {auth,isAdmin, verifyTurnstile} = require('../middleware/authMiddleware');

router.get("/search-users",auth, isAdmin, searchUsers);
router.post('/register', verifyTurnstile,registerUser);
router.post('/login',verifyTurnstile,login);
router.get("/verify/:token", verifyUser);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.post("/offline-register",auth, isAdmin, registerOfflineCustomer);
router.get("/",auth,isAdmin,getUsers);
router.get('/:id',auth,getUserById);
router.put("/:id",auth,updateUser);
router.delete("/:id",auth,isAdmin,deleteUser);
router.post("/register-admin",auth,isAdmin,registerAdmin);

// router.put("/:id",checkWP,updateUser);
// router.get("/",checkWP,getAllUsers);
// router.delete("/:id",checkWP,deleteUser);

module.exports = router;