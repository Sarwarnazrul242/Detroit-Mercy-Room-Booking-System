const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/login', authController.login);
router.post('/signup', authController.signup);
router.post('/resetPassword', authController.resetPassword);
router.post('/sendemail', authController.sendEmail);

module.exports = router;
