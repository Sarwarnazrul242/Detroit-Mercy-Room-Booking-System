const express = require('express');
const router = express.Router();
const buildingController = require('../controllers/buildingController');
const multer = require('multer');
const path = require('path');

// Set up multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});
const upload = multer({ storage });

router.post('/addBuilding', upload.single('image'), buildingController.addBuilding);
router.put('/addRoom/:id', upload.single('image'), buildingController.addRoom);
router.get('/getBuildings', buildingController.getBuildings);
router.get('/getBuilding/:id', buildingController.getBuilding);
router.delete('/deleteBuilding/:id', buildingController.deleteBuilding);

module.exports = router;
