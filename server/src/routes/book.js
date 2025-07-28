const debug = require('debug')('app:route:book');
const express = require('express');
const router = express.Router();
const bookController = require('@/controllers/bookController');

router.get('/', bookController.getBookList);
router.get('/:id', bookController.getBookDetail);

module.exports = router;
