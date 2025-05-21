const { bookingCollection, userCollection, buildingCollection } = require('../mongo');
const nodemailer = require('nodemailer');
const mongoose = require('mongoose');

// Cancel a booking and notify user
exports.cancelBooking = async (req, res) => {
    const { bookingId, reason } = req.body;
    try {
        const booking = await bookingCollection.findById(bookingId).populate('userId').populate('buildingId');
        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }
        booking.canceled = true;
        booking.cancelReason = reason;
        await booking.save();

        if (!booking.userId.email) {
            return res.status(500).json({ message: "User email not found" });
        }

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_PASS
            }
        });

        const mailOptions = {
            from: 'Detroit Mercy Room Booking System <no-reply@udmercy.edu>',
            to: booking.userId.email,
            subject: 'Booking Cancellation Notice',
            html: `<p>Dear ${booking.userId.name},</p>
<p>Your booking for ${booking.room} in ${booking.buildingId.name} on ${new Date(booking.date).toLocaleDateString()} has been canceled for the following reason:</p>
<p style="color: red;">${reason}</p>
<p>If you have any questions or concerns, please contact our support team.</p>
<p>To book a new room, please visit the following link:<br>
<a href="http://localhost:3000/NewBookings">Book a new room</a></p>
<p>Best regards,<br>
Detroit Mercy Room Booking System Support Team</p>`
        };

        await transporter.sendMail(mailOptions);

        res.json({ message: "Booking canceled and email sent" });
    } catch (e) {
        console.error("Error canceling booking:", e);
        res.status(500).json({ message: "Error canceling booking" });
    }
};

// Book a room
exports.bookRoom = async (req, res) => {
    try {
        const { buildingId, room, date, startTime, endTime, userEmail } = req.body;
        const user = await userCollection.findOne({ email: userEmail });
        if (!user) {
            return res.status(404).json('User not found');
        }
        // Check for booking conflicts
        const conflict = await bookingCollection.findOne({
            buildingId: new mongoose.Types.ObjectId(buildingId),
            room: room,
            date: date,
            $or: [
                { startTime: { $lt: endTime, $gte: startTime } },
                { endTime: { $lte: endTime, $gt: startTime } },
                { startTime: { $lte: startTime }, endTime: { $gte: endTime } }
            ]
        });
        if (conflict) {
            return res.json('conflict');
        }
        // Check for duplicate booking by the same user
        const duplicateBooking = await bookingCollection.findOne({
            buildingId: new mongoose.Types.ObjectId(buildingId),
            room: room,
            date: date,
            startTime: startTime,
            endTime: endTime,
            userId: user._id
        });
        if (duplicateBooking) {
            return res.json('duplicate');
        }
        const booking = new bookingCollection({
            buildingId: new mongoose.Types.ObjectId(buildingId),
            room,
            date,
            startTime,
            endTime,
            userId: user._id,
            userName: user.name,
            userEmail: user.email,
            userStatus: user.status
        });
        await booking.save();
        res.json('success');
    } catch (err) {
        console.error('Error booking room:', err);
        res.json('fail');
    }
};

// Get all bookings
exports.getBookings = async (req, res) => {
    try {
        const bookings = await bookingCollection.find({})
            .populate('buildingId')
            .populate('userId');
        res.json(bookings);
    } catch (e) {
        console.error('Error fetching bookings:', e);
        res.status(500).json("fail");
    }
};

// Get bookings for a user
exports.getUserBookings = async (req, res) => {
    try {
        const { userEmail } = req.body;
        const user = await userCollection.findOne({ email: userEmail });
        if (!user) {
            return res.status(404).json('User not found');
        }
        const bookings = await bookingCollection.find({ userId: user._id })
            .populate('buildingId');
        res.json(bookings);
    } catch (e) {
        console.error('Error fetching bookings:', e);
        res.json("fail");
    }
};

// Delete a booking by ID
exports.deleteBooking = async (req, res) => {
    try {
        await bookingCollection.findByIdAndDelete(req.params.id);
        res.json('success');
    } catch (error) {
        console.error('Error deleting booking:', error);
        res.status(500).json('fail');
    }
};

// Cancel a booking by ID
exports.cancelBookingById = async (req, res) => {
    try {
        const bookingId = req.params.bookingId;
        await bookingCollection.findByIdAndDelete(bookingId);
        res.json('success');
    } catch (e) {
        console.error('Error cancelling booking:', e);
        res.json("fail");
    }
};
