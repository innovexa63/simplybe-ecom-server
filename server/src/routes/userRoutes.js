const express = require('express');
const router = express.Router();
const { protect, admin, superadmin } = require('../middleware/authMiddleware');
const {
    getAllUsers,
    getUserById,
    updateUserRole,
    deleteUser,
    changePassword,
    addAdmin
} = require('../controllers/userController');

router.put('/change-password', protect, changePassword);
router.post('/add-admin', protect, superadmin, addAdmin);

router.route('/').get(protect, admin, getAllUsers);
router.route('/:id')
    .get(protect, admin, getUserById)
    .delete(protect, superadmin, deleteUser);
router.put('/:id/role', protect, superadmin, updateUserRole);

module.exports = router;
