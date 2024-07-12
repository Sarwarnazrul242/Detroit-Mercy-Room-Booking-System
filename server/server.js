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
            status: user.status
        });
    } catch (e) {
        res.json("fail");
    }
});


app.get('/getBookings', async (req, res) => {
    try {
        const bookings = await bookingCollection.find({})
            .populate('buildingId')
            .populate('userEmail'); // Populate the userEmail field with user details
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
        let text = '';

        if (type === 'verify') {
            subject = "Email Verification";
            text = `Dear User,

We received a request to verify your email for the Detroit Mercy Room Booking System. Please use the following One-Time Password (OTP) to verify your email:

OTP: ${otp}

This OTP is valid for the next 10 minutes. If you did not request this verification, please ignore this email or contact our support team immediately.

Thank you for using our services.

Best regards,
Detroit Mercy Room Booking System
Support Team
`;
        } else if (type === 'reset') {
            subject = "Password Reset Request";
            text = `Dear User,

We received a request to reset your password for the Detroit Mercy Room Booking System. Please use the following One-Time Password (OTP) to reset your password:

OTP: ${otp}

This OTP is valid for the next 10 minutes. If you did not request a password reset, please ignore this email or contact our support team immediately.

Thank you for using our services.

Best regards,
Detroit Mercy Room Booking System
Support Team
`;
        }

        const mailOptions = {
            from: "Detroit Mercy Room Booking System <no-reply@udmercy.edu>",
            to: email,
            subject: subject,
            text: text
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
    const { email, name, phoneNumber, password } = req.body;
    try {
        const updateData = { name, phoneNumber };
        if (password) {
            updateData.password = await bcrypt.hash(password, 10);
        }
        await userCollection.updateOne(
            { email },
            { $set: updateData }
        );
        res.json("success");
    } catch (e) {
        console.error(e);
        res.json("fail");
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
            { _id: new mongoose.Types.ObjectId(req.params.buildingId), 'rooms._id': new mongoose.Types.ObjectId(req.params.roomId) },
            { $set: { 'rooms.$': updatedRoom } }
        );
        res.json({ success: true, room: updatedRoom });
    } catch (err) {
        console.error('Error updating room:', err);
        res.json({ success: false });
    }
});

// app.delete('/deleteRoom/:buildingId/:roomId', async (req, res) => {
//     try {
//         await buildingCollection.updateOne(
//             { _id: new mongoose.Types.ObjectId(req.params.buildingId) },
//             { $pull: { rooms: { _id: new mongoose.Types.ObjectId(req.params.roomId) } } }
//         );
//         res.json('success');
//     } catch (err) {
//         console.error('Error deleting room:', err);
//         res.json('fail');
//     }
// });

app.delete('/deleteRoom/:buildingId/:roomId', async (req, res) => {
    try {
        const buildingId = new mongoose.Types.ObjectId(req.params.buildingId);
        const roomId = new mongoose.Types.ObjectId(req.params.roomId);
        await buildingCollection.updateOne(
            { _id: buildingId },
            { $pull: { rooms: { _id: roomId } } }
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
        const { email } = req.body;
        const bookings = await bookingCollection.find({ userEmail: email }).populate('buildingId');
        res.json(bookings);
    } catch (e) {
        console.error('Error fetching bookings:', e);
        res.json("fail");
    }
});

app.post('/bookRoom', async (req, res) => {
    try {
        const { buildingId, room, date, startTime, endTime, userEmail } = req.body;

        // Check for booking conflicts
        const conflict = await bookingCollection.findOne({
            buildingId: new mongoose.Types.ObjectId(buildingId),
            room: room,
            date: date,
            $or: [
                { startTime: { $lt: endTime, $gt: startTime } },
                { endTime: { $gt: startTime, $lt: endTime } }
            ]
        });

        if (conflict) {
            return res.json('conflict');
        }

        const booking = new bookingCollection({
            buildingId: new mongoose.Types.ObjectId(buildingId),
            room,
            date,
            startTime,
            endTime,
            userEmail: user._id
        });
        
        await booking.save();
        res.json('success');
    } catch (err) {
        console.error('Error booking room:', err);
        res.json('fail');
    }
});




app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
