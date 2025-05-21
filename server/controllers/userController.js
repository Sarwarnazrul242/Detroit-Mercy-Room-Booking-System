const { userCollection, bookingCollection } = require('../mongo');
const bcrypt = require('bcryptjs');

// Get user account info
exports.myAccount = async (req, res) => {
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
};

// Get all users
exports.getUsers = async (req, res) => {
    try {
        const users = await userCollection.find({});
        res.json(users);
    } catch (e) {
        console.error('Error fetching users:', e);
        res.status(500).json("fail");
    }
};

// Delete a user by ID
exports.deleteUser = async (req, res) => {
    try {
        await userCollection.findByIdAndDelete(req.params.id);
        res.json('success');
    } catch (e) {
        console.error('Error deleting user:', e);
        res.status(500).json("fail");
    }
};

// Delete account (with password check)
exports.deleteAccount = async (req, res) => {
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
};

// Update account info
exports.updateAccount = async (req, res) => {
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
};

// Suspend user
exports.suspendUser = async (req, res) => {
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
};
