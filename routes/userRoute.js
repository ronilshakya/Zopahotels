const express = require('express');
const router = express.Router();
const {registerUser,verifyUser,login,getAllUsers,getUserById,updateUser, deleteUser} = require('../controllers/authController');
const {auth,isAdmin} = require('../middleware/authMiddleware');

router.post('/register',registerUser);
router.post('/login',login);
router.get("/verify/:token", verifyUser);
router.get("/",auth,isAdmin,getAllUsers);
router.get('/:id',auth,getUserById);
router.put("/:id",auth,updateUser);
router.delete("/:id",auth,isAdmin,deleteUser);

module.exports = router;