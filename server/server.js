const cors = require('cors');
const bcrypt = require('bcryptjs');
const express = require('express');
const nodemailer = require('nodemailer');
const multer = require('multer');
const mongoose = require('mongoose');
const path = require('path');
const { userCollection, buildingCollection, bookingCollection } = require('./mongo');
require('dotenv').config();

const PORT = process.env.PORT || 8000;
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());
// app.use('/uploads', express.static('uploads'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); 

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

// const upload = multer({ storage: storage });
const upload = multer({ storage });

app.get("/", cors(), (req, res) => {
    res.send("Server is running");
});

app.post("/myaccount", async (req, res) => {
    try {
        const email = req.body.cookieValue;
        const user = await userCollection.findOne({ email: email });
        res.json({
            name: user.name,
            phoneNumber: user.phoneNumber,
            email: user.email,
            status: user.status,
            isSuspended: user.isSuspended
        });
    } catch (e) {
        res.json("fail");
    }
});


app.get('/getBookings', async (req, res) => {
    try {
        const bookings = await bookingCollection.find({})
            .populate('buildingId')
            .populate('userId'); // Changed from userEmail to userId
        res.json(bookings);
    } catch (e) {
        console.error('Error fetching bookings:', e);
        res.status(500).json("fail");
    }
});


app.post("/sendemail", async (req, res) => {
    try {
        const { email, otp, type } = req.body;

        const check = await userCollection.findOne({ email: email });
        if (type === 'verify') {
            if (check) {
                res.json("Exists");
                return;
            }
        } else if (type === 'reset') {
            if (!check) {
                res.json("notexist");
                return;
            }
        }

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            host: "smtp.gmail.com",
            port: 587,
            secure: false,
            ignoreTLSVerify: true,
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_PASS
            }
        });

        let subject = '';
        let html = '';

        if (type === 'verify') {
            subject = "Email Verification";
            html = `<p>Dear User,</p>
<p>We received a request to verify your email for the Detroit Mercy Room Booking System. Please use the following One-Time Password (OTP) to verify your email:</p>
<p style="font-size: 20px; font-weight: bold; color: blue;">OTP: ${otp}</p>
<p>This OTP is valid for the next 10 minutes. If you did not request this verification, please ignore this email or contact our support team immediately.</p>
<p>Thank you for using our services.</p>
<p>Best regards,<br>
Detroit Mercy Room Booking System<br>
Support Team</p>`;
        } else if (type === 'reset') {
            subject = "Password Reset Request";
            html = `<p>Dear User,</p>
<p>We received a request to reset your password for the Detroit Mercy Room Booking System. Please use the following One-Time Password (OTP) to reset your password:</p>
<p style="font-size: 20px; font-weight: bold; color: blue;">OTP: ${otp}</p>
<p>This OTP is valid for the next 10 minutes. If you did not request a password reset, please ignore this email or contact our support team immediately.</p>
<p>Thank you for using our services.</p>
<p>Best regards,<br>
Detroit Mercy Room Booking System<br>
Support Team</p>`;
        }

        const mailOptions = {
            from: "Detroit Mercy Room Booking System <no-reply@udmercy.edu>",
            to: email,
            subject: subject,
            html: html
        };

        const sendEmail = async (transporter, mailOptions) => {
            try {
                await transporter.sendMail(mailOptions);
                res.json("pass");
            } catch (e) {
                console.error(e);
                res.json("fail");
            }
        };

        sendEmail(transporter, mailOptions);
    } catch (e) {
        console.error(e);
        res.json("fail");
    }
});


app.post('/cancelBooking', async (req, res) => {
    const { bookingId, reason } = req.body;

    try {
        const booking = await bookingCollection.findById(bookingId).populate('userId').populate('buildingId');
        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }

        booking.canceled = true;
        booking.cancelReason = reason;
        await booking.save();

        // Ensure the email is defined
        if (!booking.userId.email) {
            return res.status(500).json({ message: "User email not found" });
        }

        // Send email to user with the cancellation reason
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
});



app.post("/signup", async (req, res) => {
    const form = req.body.form;
    const data = {
        name: form.name,
        email: `${form.email}@udmercy.edu`,
        phoneNumber: form.phoneNumber,
        status: form.status,
        password: await bcrypt.hash(form.password, 10) // Hash the password before storing
    };

    try {
        const check = await userCollection.findOne({ email: data.email });
        if (check) {
            return res.json("Exists");
        } else {
            await userCollection.insertMany([data]);
            return res.json("Dontexist");
        }
    } catch (e) {
        console.error(e);
        return res.json("Error");
    }
});

app.post("/resetPassword", async (req, res) => {
    const cookieValue = req.body.cookieValue;
    const password = req.body.password;
    try {
        const newPass = await bcrypt.hash(password, 10);
        await userCollection.updateOne(
            { email: cookieValue },
            { $set: { password: newPass } }
        );

        res.json("pass");
    } catch (e) {
        console.error(e);
        res.json("fail");
    }
});

app.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await userCollection.findOne({ email: `${email}@udmercy.edu` });
        if (!user) {
            return res.json("nouser");
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.json("loginFail");
        }

        return res.json("loginPass");
    } catch (e) {
        console.error(e);
        return res.json("fail");
    }
});

app.put('/updateAccount', async (req, res) => {
    const { email, name, phoneNumber, oldPassword, password } = req.body;
    try {
        const user = await userCollection.findOne({ email });

        // Check if the old password matches
        if (password && !(await bcrypt.compare(oldPassword, user.password))) {
            return res.json({ success: false, message: "Old password is incorrect" });
        }

        const updateData = { name, phoneNumber };
        if (password) {
            updateData.password = await bcrypt.hash(password, 10);
        }

        await userCollection.updateOne(
            { email },
            { $set: updateData }
        );
        res.json({ success: true, message: "Account updated successfully" });
    } catch (e) {
        console.error(e);
        res.json({ success: false, message: "Failed to update account" });
    }
});


// Add this to the server.js file
app.get('/getUsers', async (req, res) => {
    try {
        const users = await userCollection.find({});
        res.json(users);
    } catch (e) {
        console.error('Error fetching users:', e);
        res.status(500).json("fail");
    }
});

app.delete('/deleteUser/:id', async (req, res) => {
    try {
        await userCollection.findByIdAndDelete(req.params.id);
        res.json('success');
    } catch (e) {
        console.error('Error deleting user:', e);
        res.status(500).json("fail");
    }
});

app.delete('/deleteAccount', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await userCollection.findOne({ email });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: 'Incorrect password' });
        }

        // Unset the userId in bookings
        await bookingCollection.updateMany(
            { userId: user._id },
            { $unset: { userId: "" } }
        );

        await userCollection.deleteOne({ email });

        res.json({ success: true, message: 'Account deleted successfully' });
    } catch (e) {
        console.error('Error deleting account:', e);
        res.status(500).json({ success: false, message: 'Error deleting account' });
    }
});




app.post('/addBuilding', upload.single('image'), async (req, res) => {
    const { name, description, floors, basement } = req.body;
    let imagePath = req.file ? req.file.path : '';
    imagePath = imagePath.replace(/\\/g, '/'); 

    try {
        const newBuilding = new buildingCollection({
            name,
            description,
            floors,
            basement: basement === 'true',
            image: imagePath
        });

        await newBuilding.save();
        res.json('success');
    } catch (error) {
        console.error(error);
        res.json('fail');
    }
});


app.put('/addRoom/:id', upload.single('image'), async (req, res) => {
    try {
        const { name, description, seats, schedule, amenities } = req.body;
        // console.log(schedule);
        const newRoom = {
            name,
            description,
            seats,
            schedule: JSON.parse(schedule),
            amenities: JSON.parse(amenities),
            image: req.file ? req.file.filename : ''
        };
        await buildingCollection.updateOne(
            { _id: new mongoose.Types.ObjectId(req.params.id) },
            { $push: { rooms: newRoom } }
        );
        res.json({ success: true, room: newRoom });
    } catch (err) {
        console.error('Error adding room:', err);
        res.json({ success: false });
    }
});

app.put('/editRoom/:buildingId/:roomId', upload.single('image'), async (req, res) => {
    try {
        const { buildingId, roomId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(buildingId) || !mongoose.Types.ObjectId.isValid(roomId)) {
            return res.status(400).json('Invalid ID');
        }
        const { name, description, seats, schedule, amenities } = req.body;
        const updatedRoom = {
            name,
            description,
            seats,
            schedule: JSON.parse(schedule),
            amenities: JSON.parse(amenities),
        };
        if (req.file) {
            updatedRoom.image = req.file.filename;
        }
        await buildingCollection.updateOne(
            { _id: new mongoose.Types.ObjectId(buildingId), 'rooms._id': new mongoose.Types.ObjectId(roomId) },
            { $set: { 'rooms.$': updatedRoom } }
        );
        res.json({ success: true, room: updatedRoom });
    } catch (err) {
        console.error('Error updating room:', err);
        res.json({ success: false });
    }
});


app.get('/getBuilding/:id', async (req, res) => {
    try {
        const building = await buildingCollection.findById(req.params.id).populate('rooms');
        res.json(building);
    } catch (e) {
        console.error('Error fetching building:', e);
        res.json("fail");
    }
});


app.post('/getAvailableRooms', async (req, res) => {
    try {
        const { buildingId, date, startTime, endTime } = req.body;
        const building = await buildingCollection.findById(buildingId);

        if (!building) {
            return res.status(404).json('Building not found');
        }

        const selectedStart = new Date(`${date}T${startTime}`);
        const selectedEnd = new Date(`${date}T${endTime}`);
        const selectedDay = selectedStart.toLocaleString('en-us', { weekday: 'short' });

        // Get all bookings for the building on the selected date
        const bookings = await bookingCollection.find({ 
            buildingId: new mongoose.Types.ObjectId(buildingId), 
            date 
        });

        const availableRooms = building.rooms.filter(room => {
            // Check if the room is available on the selected day
            const isAvailableOnDay = room.schedule.some(schedule => Array.isArray(schedule.days) && schedule.days.includes(selectedDay));
            if (!isAvailableOnDay) return false;

            return !bookings.some(booking => {
                return booking.room === room.name &&
                    ((selectedStart < new Date(`${date}T${booking.endTime}`) && selectedEnd > new Date(`${date}T${booking.startTime}`)));
            });
        });

        res.json(availableRooms);
    } catch (e) {
        console.error('Error fetching available rooms:', e);
        res.json("fail");
    }
});

app.put('/pauseBuilding/:id', async (req, res) => {
    try {
        const buildingId = req.params.id;
        const { isPaused } = req.body;
        if (!mongoose.Types.ObjectId.isValid(buildingId)) {
            return res.status(400).json('Invalid ID');
        }
        await buildingCollection.updateOne(
            { _id: new mongoose.Types.ObjectId(buildingId) },
            { $set: { isPaused: isPaused } }
        );
        res.json('success');
    } catch (err) {
        console.error('Error pausing/unpausing building:', err);
        res.status(500).json('fail');
    }
});

app.put('/pauseRoom/:buildingId/:roomId', async (req, res) => {
    try {
        const { buildingId, roomId } = req.params;
        const { isPaused } = req.body;
        if (!mongoose.Types.ObjectId.isValid(buildingId) || !mongoose.Types.ObjectId.isValid(roomId)) {
            return res.status(400).json('Invalid ID');
        }

        await buildingCollection.updateOne(
            { _id: new mongoose.Types.ObjectId(buildingId), 'rooms._id': new mongoose.Types.ObjectId(roomId) },
            { $set: { 'rooms.$.isPaused': isPaused } }
        );
        res.json('success');
    } catch (err) {
        console.error('Error pausing/unpausing room:', err);
        res.json('fail');
    }
});



app.delete('/deleteRoom/:buildingId/:roomId', async (req, res) => {
    try {
        const { buildingId, roomId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(buildingId) || !mongoose.Types.ObjectId.isValid(roomId)) {
            return res.status(400).json('Invalid ID');
        }
        await buildingCollection.updateOne(
            { _id: new mongoose.Types.ObjectId(buildingId) },
            { $pull: { rooms: { _id: new mongoose.Types.ObjectId(roomId) } } }
        );
        res.json('success');
    } catch (err) {
        console.error('Error deleting room:', err);
        res.json('fail');
    }
});


app.post('/editBuilding/:id', upload.single('image'), async (req, res) => {
    const { name, description, floors, basement } = req.body;
    let imagePath = req.file ? req.file.path : req.body.existingImage;

    if (imagePath) {
        imagePath = imagePath.replace(/\\/g, '/'); 
    }

    try {
        const building = await buildingCollection.findById(req.params.id);
        if (!building) {
            return res.status(404).json('Building not found');
        }
        
        building.name = name;
        building.description = description;
        building.floors = floors;
        building.basement = basement === 'true';
        building.image = imagePath;

        await building.save();
        res.json('success');
    } catch (error) {
        console.error('Error updating building:', error);
        res.status(500).json('fail');
    }
});

app.get('/getBuildings', async (req, res) => {
    try {
        const buildings = await buildingCollection.find({});
        res.json(buildings);
    } catch (e) {
        console.error('Error fetching buildings:', e);
        res.json("fail");
    }
});

app.delete('/deleteBooking/:id', async (req, res) => {
    try {
        await bookingCollection.findByIdAndDelete(req.params.id);
        res.json('success');
    } catch (error) {
        console.error('Error deleting booking:', error);
        res.status(500).json('fail');
    }
});


app.get('/getBuilding/:id', async (req, res) => {
    try {
        const building = await buildingCollection.findById(req.params.id);
        res.json(building);
    } catch (e) {
        console.error('Error fetching building:', e);
        res.json("fail");
    }
});


app.delete('/deleteBuilding/:id', async (req, res) => {
    try {
        await buildingCollection.findByIdAndDelete(req.params.id);
        res.json('success');
    } catch (error) {
        console.error(error);
        res.json('fail');
    }
});


app.post('/getUserBookings', async (req, res) => {
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
});


app.delete('/cancelBooking/:bookingId', async (req, res) => {
    try {
        const bookingId = req.params.bookingId;
        await bookingCollection.findByIdAndDelete(bookingId);
        res.json('success');
    } catch (e) {
        console.error('Error cancelling booking:', e);
        res.json("fail");
    }
});


app.post('/bookRoom', async (req, res) => {
    try {
        const { buildingId, room, date, startTime, endTime, userEmail } = req.body;

        // Fetch the user's ObjectId based on their email
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
            userId: user._id, // Store the user's ObjectId
            userName: user.name, // Store the user's name
            userEmail: user.email, // Store the user's email
            userStatus: user.status // Store the user's status
        });

        await booking.save();
        res.json('success');
    } catch (err) {
        console.error('Error booking room:', err);
        res.json('fail');
    }
});


app.put('/suspendUser/:id', async (req, res) => {
    const { id } = req.params;
    const { isSuspended, reason } = req.body;
    try {
        const user = await userCollection.findById(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.isSuspended = isSuspended;
        user.suspensionReason = reason;
        await user.save();

        if (isSuspended) {
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.GMAIL_USER,
                    pass: process.env.GMAIL_PASS
                }
            });

            const mailOptions = {
                from: "Detroit Mercy Room Booking System <no-reply@udmercy.edu>",
                to: user.email,
                subject: "Account Suspended",
                text: `Dear ${user.name},

Your account has been suspended for the following reason:

"${reason}"

If you have any questions or need further assistance, please contact our support team.

Thank you,
Detroit Mercy Room Booking System`
            };

            await transporter.sendMail(mailOptions);
        }

        res.json({ success: true });
    } catch (e) {
        console.error('Error suspending user:', e);
        res.status(500).json({ success: false, message: 'Error suspending user' });
    }
});



app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
