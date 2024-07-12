const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema.Types;
mongoose.connect("mongodb://localhost:27017/room_booking")
.then(() => {
    console.log("Database connected")
})
.catch (() => {
    console.log("Connection failed")
})

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
    rooms: [{
        name: { type: String },
        description: { type: String },
        seats: { type: Number },
        schedule: [{
            startTime: { type: String },
            endTime: { type: String }
        }],
        amenities: {
            projector: { type: Boolean, default: false },
            whiteboard: { type: Boolean, default: false },
            tv: { type: Boolean, default: false }
        },
        image: { type: String }
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
    userEmail: {
        type: ObjectId,
        required: true,
        ref: 'userCollection' 
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