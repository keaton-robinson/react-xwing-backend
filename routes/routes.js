const express = require('express');
const squadRouter = require('./squads');
const userRouter = require('./users');

const router = express.Router();

router.use('/squads', squadRouter);
router.use('/users', userRouter);

module.exports = router;