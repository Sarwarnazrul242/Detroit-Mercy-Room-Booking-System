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

// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const buildingRoutes = require('./routes/buildingRoutes');

// Use routes
app.use(authRoutes);
app.use(userRoutes);
app.use(bookingRoutes);
app.use(buildingRoutes);

app.get("/", cors(), (req, res) => {
    res.send("Server is running");
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
