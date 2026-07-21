const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const { getAllOrders, getMyOrders, requestReturn, updateReturnStatus, getOrderById, createOrder, updateOrderStatus, updatePaymentStatus, deleteOrder } = require('../controllers/orderController');
router.route('/')
    .get(protect, admin, getAllOrders)
    .post(protect, createOrder);
    router.get('/myorders', protect, getMyOrders);

    router.put('/:id/return', protect, requestReturn);
    router.put('/:id/return-status', protect, admin, updateReturnStatus);

router.route('/:id')
    .get(protect, admin, getOrderById)
    .delete(protect, admin, deleteOrder);

router.put('/:id/status', protect, admin, updateOrderStatus);
router.put('/:id/pay', protect, admin, updatePaymentStatus);

module.exports = router;
