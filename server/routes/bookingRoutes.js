const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');

router.post('/cancelBooking', bookingController.cancelBooking);
router.post('/bookRoom', bookingController.bookRoom);
router.get('/getBookings', bookingController.getBookings);
router.post('/getUserBookings', bookingController.getUserBookings);
router.delete('/deleteBooking/:id', bookingController.deleteBooking);
router.delete('/cancelBooking/:bookingId', bookingController.cancelBookingById);

module.exports = router;
