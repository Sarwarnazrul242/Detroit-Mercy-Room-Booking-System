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