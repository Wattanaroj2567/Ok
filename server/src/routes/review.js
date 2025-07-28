    const debug = require('debug')('app:route:review');
    const express = require('express');
    const router = express.Router();
    const reviewController = require('@/controllers/reviewController');
    const { authenticateToken } = require('@/middleware/auth/authMiddleware');

    router.post('/', authenticateToken, reviewController.createReview);
    router.get('/book/:bookId', reviewController.getBookReviews);
    router.get('/user/:userId', reviewController.getUserReviews);
    router.put('/:id', authenticateToken, reviewController.updateReview);
    router.delete('/:id', authenticateToken, reviewController.deleteReview);

    module.exports = router;
