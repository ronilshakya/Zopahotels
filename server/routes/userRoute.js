const express = require('express');
const router = express.Router();
const {registerUser,verifyUser,login,getAllUsers,getUserById,updateUser, deleteUser} = require('../controllers/authController');
const {auth,isAdmin,checkWP} = require('../middleware/authMiddleware');

router.post('/register',registerUser);
router.post('/login',login);
router.get("/verify/:token", verifyUser);
router.get('/:id',auth,getUserById);

router.put("/:id",auth,updateUser);
router.get("/",auth,isAdmin,getAllUsers);
router.delete("/:id",auth,isAdmin,deleteUser);

// router.put("/:id",checkWP,updateUser);
// router.get("/",checkWP,getAllUsers);
// router.delete("/:id",checkWP,deleteUser);

module.exports = router;