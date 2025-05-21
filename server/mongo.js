const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema.Types;

// MongoDB Atlas connection string
const MONGODB_URI = process.env.MONGODB_URI;

console.log('Environment variables:', {
    MONGODB_URI: MONGODB_URI ? 'URI is set' : 'URI is not set'
});

if (!MONGODB_URI) {
    console.error("MONGODB_URI is not defined in environment variables");
    process.exit(1);
}

mongoose.connect(MONGODB_URI)
.then(() => {
    console.log("Database connected successfully to MongoDB Atlas")
})
.catch((error) => {
    console.error("MongoDB connection error:", error.message)
    process.exit(1);
});

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    phoneNumber: {
        type: String,
        required: true
    },
    status: {
        type: String,
        required: true,
        enum: ['Faculty', 'Student', 'Staff']
    },
    password: {
        type: String,
        required: true
    },
    isSuspended: { 
        type: Boolean, 
        default: false 
    }, 
    suspensionReason: {
        type: String,
        default: ''
    }
});

const buildingSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
    },
    floors: {
        type: Number,
        required: true
    },
    basement: {
        type: Boolean,
        default: false
    },
    image: {
        type: String,
    },
    isPaused: { type: Boolean, default: false },
    rooms: [{
        name: { type: String },
        description: { type: String },
        seats: { type: Number },
        schedule: [{
            days: [{ type: String }], // Changed to array of strings
            startTime: { type: String },
            endTime: { type: String }
        }],
        amenities: {
            projector: { type: Boolean, default: false },
            whiteboard: { type: Boolean, default: false },
            tv: { type: Boolean, default: false }
        },
        image: { type: String },
        isPaused: { type: Boolean, default: false }
    }]
});



const bookingSchema = new mongoose.Schema({
    buildingId: {
        type: ObjectId,
        required: true,
        ref: 'buildingCollection'
    },
    room: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    startTime: {
        type: String,
        required: true
    },
    endTime: {
        type: String,
        required: true
    },
    userId: {
        type: ObjectId,
        ref: 'userCollection' 
    },
    userName: {
        type: String,
        required: true
    },
    userEmail: {
        type: String,
        required: true
    },
    userStatus: {
        type: String,
        required: true,
        enum: ['Faculty', 'Student', 'Staff']
    },
    canceled: {
        type: Boolean,
        default: false
    },
    cancelReason: {
        type: String,
        default: ''
    }
});


const bookingCollection = mongoose.model('bookingCollection', bookingSchema);
const userCollection = mongoose.model('userCollection', userSchema);
const buildingCollection = mongoose.model('buildingCollection', buildingSchema);

const collection = {
    userCollection,
    buildingCollection,
    bookingCollection
}

module.exports = collection;