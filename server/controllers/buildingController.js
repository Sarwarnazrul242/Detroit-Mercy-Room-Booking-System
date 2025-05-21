const { buildingCollection } = require('../mongo');
const mongoose = require('mongoose');

// Add a new building
exports.addBuilding = async (req, res) => {
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
};

// Add a room to a building
exports.addRoom = async (req, res) => {
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
};

// Get all buildings
exports.getBuildings = async (req, res) => {
    try {
        const buildings = await buildingCollection.find({});
        res.json(buildings);
    } catch (e) {
        console.error('Error fetching buildings:', e);
        res.json("fail");
    }
};

// Get a single building by ID
exports.getBuilding = async (req, res) => {
    try {
        const building = await buildingCollection.findById(req.params.id);
        res.json(building);
    } catch (e) {
        console.error('Error fetching building:', e);
        res.json("fail");
    }
};

// Delete a building by ID
exports.deleteBuilding = async (req, res) => {
    try {
        await buildingCollection.findByIdAndDelete(req.params.id);
        res.json('success');
    } catch (error) {
        console.error(error);
        res.json('fail');
    }
};
