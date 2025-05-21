const bcrypt = require('bcryptjs');
const Cookies = require('js-cookie');
const { userCollection } = require('../mongo');
const nodemailer = require('nodemailer');

exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await userCollection.findOne({ email: `${email}@udmercy.edu` });
        if (!user) return res.json("nouser");
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.json("loginFail");
        return res.json("loginPass");
    } catch (e) {
        console.error(e);
        return res.json("fail");
    }
};

exports.signup = async (req, res) => {
    const form = req.body.form;
    const data = {
        name: form.name,
        email: `${form.email}@udmercy.edu`,
        phoneNumber: form.phoneNumber,
        status: form.status,
        password: await bcrypt.hash(form.password, 10)
    };
    try {
        const check = await userCollection.findOne({ email: data.email });
        if (check) return res.json("Exists");
        await userCollection.insertMany([data]);
        return res.json("Dontexist");
    } catch (e) {
        console.error(e);
        return res.json("Error");
    }
};

exports.resetPassword = async (req, res) => {
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
};

exports.sendEmail = async (req, res) => {
    try {
        const { email, otp, type } = req.body;
        const check = await userCollection.findOne({ email: email });
        if (type === 'verify') {
            if (check) return res.json("Exists");
        } else if (type === 'reset') {
            if (!check) return res.json("notexist");
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
        try {
            await transporter.sendMail(mailOptions);
            res.json("pass");
        } catch (e) {
            console.error(e);
            res.json("fail");
        }
    } catch (e) {
        console.error(e);
        res.json("fail");
    }
};
