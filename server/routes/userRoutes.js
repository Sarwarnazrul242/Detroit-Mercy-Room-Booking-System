const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.post('/myaccount', userController.myAccount);
router.get('/getUsers', userController.getUsers);
router.delete('/deleteUser/:id', userController.deleteUser);
router.delete('/deleteAccount', userController.deleteAccount);
router.put('/updateAccount', userController.updateAccount);
router.put('/suspendUser/:id', userController.suspendUser);

module.exports = router;
