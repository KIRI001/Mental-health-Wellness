require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const path = require('path');
const jwt = require('jsonwebtoken');
const cron = require('node-cron');
const crypto = require('crypto');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// JWT configuration
const JWT_SECRET = process.env.JWT_SECRET || 'mhw_sanctuary_secret_token_key_2026';

// MongoDB connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/mhw_community';
mongoose.connect(MONGO_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.error('MongoDB Connection Error:', err));

// Schemas
const userSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    created_at: { type: Date, default: Date.now }
});

const reviewSchema = new mongoose.Schema({
    review: { type: String, required: true },
    created_at: { type: Date, default: Date.now }
});

const journalSchema = new mongoose.Schema({
    pseudonymId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
    created_at: { type: Date, default: Date.now }
});

const reminderSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    medicineName: { type: String, required: true },
    dosage: { type: String, required: true },
    time: { type: String, required: true }, // Format "HH:MM"
    active: { type: Boolean, default: true },
    lastNotifiedDate: { type: String, default: '' },
    created_at: { type: Date, default: Date.now }
});

const notificationSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    read: { type: Boolean, default: false },
    created_at: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
const Review = mongoose.model('Review', reviewSchema);
const Journal = mongoose.model('Journal', journalSchema);
const Reminder = mongoose.model('Reminder', reminderSchema);
const Notification = mongoose.model('Notification', notificationSchema);

// Auth Middleware
const authenticateJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader) {
        const token = authHeader.split(' ')[1];
        jwt.verify(token, JWT_SECRET, (err, user) => {
            if (err) {
                return res.status(403).json({ status: 'error', message: 'Forbidden' });
            }
            req.user = user;
            next();
        });
    } else {
        res.status(401).json({ status: 'error', message: 'Unauthorized' });
    }
};

// SHA-256 pseudonym logic for journal privacy
const getPseudonymId = (userId) => {
    return crypto.createHash('sha256').update(userId.toString()).digest('hex');
};

// API Routes - Authentication
app.post('/api/signup', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ username, email, password: hashedPassword });
        await user.save();
        res.status(201).json({ status: 'success', message: 'Signup successful!' });
    } catch (err) {
        res.status(400).json({ status: 'error', message: err.message });
    }
});

app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (user && await bcrypt.compare(password, user.password)) {
            const token = jwt.sign({ user_id: user._id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });
            res.json({ status: 'success', message: 'Login successful!', token, user_id: user._id });
        } else {
            res.status(401).json({ status: 'error', message: 'Invalid credentials' });
        }
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
});

// API Routes - Community Wall (Keep existing intact)
app.post('/api/reviews', async (req, res) => {
    try {
        const { review } = req.body;
        const newReview = new Review({ review });
        await newReview.save();
        res.json({ status: 'success', message: 'Review submitted successfully!' });
    } catch (err) {
        res.status(400).json({ status: 'error', message: err.message });
    }
});

app.get('/api/reviews', async (req, res) => {
    try {
        const reviews = await Review.find().sort({ created_at: -1 });
        res.json({ reviews });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
});

// API Routes - Private Anonymous Journal
app.get('/api/journals', authenticateJWT, async (req, res) => {
    try {
        const pseudonymId = getPseudonymId(req.user.user_id);
        const journals = await Journal.find({ pseudonymId }).sort({ created_at: -1 });
        res.json({ status: 'success', journals });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
});

app.post('/api/journals', authenticateJWT, async (req, res) => {
    try {
        const { title, content } = req.body;
        if (!title || !content) {
            return res.status(400).json({ status: 'error', message: 'Title and content are required' });
        }
        const pseudonymId = getPseudonymId(req.user.user_id);
        const journal = new Journal({ pseudonymId, title, content });
        await journal.save();
        res.status(201).json({ status: 'success', message: 'Journal entry created successfully!', journal });
    } catch (err) {
        res.status(400).json({ status: 'error', message: err.message });
    }
});

// API Routes - Medicine Reminders
app.get('/api/reminders', authenticateJWT, async (req, res) => {
    try {
        const reminders = await Reminder.find({ userId: req.user.user_id }).sort({ created_at: -1 });
        res.json({ status: 'success', reminders });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
});

app.post('/api/reminders', authenticateJWT, async (req, res) => {
    try {
        const { medicineName, dosage, time } = req.body;
        if (!medicineName || !dosage || !time) {
            return res.status(400).json({ status: 'error', message: 'All fields are required' });
        }
        const reminder = new Reminder({
            userId: req.user.user_id,
            medicineName,
            dosage,
            time
        });
        await reminder.save();
        res.status(201).json({ status: 'success', message: 'Reminder created successfully!', reminder });
    } catch (err) {
        res.status(400).json({ status: 'error', message: err.message });
    }
});

app.delete('/api/reminders/:id', authenticateJWT, async (req, res) => {
    try {
        const reminder = await Reminder.findOneAndDelete({ _id: req.params.id, userId: req.user.user_id });
        if (!reminder) {
            return res.status(404).json({ status: 'error', message: 'Reminder not found' });
        }
        res.json({ status: 'success', message: 'Reminder deleted successfully!' });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
});

// API Routes - In-App Notifications
app.get('/api/notifications', authenticateJWT, async (req, res) => {
    try {
        const notifications = await Notification.find({ userId: req.user.user_id, read: false }).sort({ created_at: -1 });
        res.json({ status: 'success', notifications });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
});

app.post('/api/notifications/:id/read', authenticateJWT, async (req, res) => {
    try {
        const notification = await Notification.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.user_id },
            { read: true },
            { new: true }
        );
        if (!notification) {
            return res.status(404).json({ status: 'error', message: 'Notification not found' });
        }
        res.json({ status: 'success', message: 'Notification marked as read!' });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
});

// Serve Static Frontend
app.use(express.static('.'));

// Cron Job for medicine reminders (runs every minute)
cron.schedule('* * * * *', async () => {
    try {
        const now = new Date();
        const hh = String(now.getHours()).padStart(2, '0');
        const mm = String(now.getMinutes()).padStart(2, '0');
        const currentTimeStr = `${hh}:${mm}`;
        const currentDateStr = now.toISOString().split('T')[0];

        // Find active reminders matching this time
        const reminders = await Reminder.find({
            time: currentTimeStr,
            active: true,
            lastNotifiedDate: { $ne: currentDateStr }
        });

        for (const reminder of reminders) {
            // Create notification document
            const notification = new Notification({
                userId: reminder.userId,
                title: 'Medicine Due!',
                message: `It is time to take your ${reminder.medicineName} (${reminder.dosage}).`,
                created_at: new Date()
            });
            await notification.save();

            // Prevent notifying again today
            reminder.lastNotifiedDate = currentDateStr;
            await reminder.save();
        }
    } catch (err) {
        console.error('Error running cron reminders check:', err);
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
