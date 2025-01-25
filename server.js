const express = require('express');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const cors = require('cors');
const app = express();

// Port configuration
const PORT = process.env.PORT || 10000;

// Middleware to parse JSON and enable CORS
app.use(cors());
app.use(express.json());

// MongoDB Atlas Connection URI
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://amitmisal789:FM7NfMggS5HUuI51@cluster0.pa5c5.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

// Connect to MongoDB Atlas
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Connected to MongoDB (Local DB)'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1); // Exit the process if connection fails
  });

// Define the Mongoose schema and model
const formSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, match: /.+\@.+\..+/ }, // Simple email validation
  message: { type: String, required: true },
  submittedAt: { type: Date, default: Date.now }, // Automatically records the submission time
});

const Form = mongoose.model('Form', formSchema);

// Configure Nodemailer Transporter
const transporter = nodemailer.createTransport({
  service: 'gmail', // Use your email provider
  auth: {
    user: process.env.EMAIL_USER || 'amit.misal20198@gmail.com', // Your email
    pass: process.env.EMAIL_PASS || 'luxtsjelvcmwixgf', // Your email password or app password
  },
});

// Verify email transporter connection
transporter.verify((error) => {
  if (error) {
    console.error('Error configuring Nodemailer:', error);
  } else {
    console.log('Nodemailer configured and ready to send emails');
  }
});

// API endpoint to handle form submissions
app.post('/api/submitForm', async (req, res) => {
  try {
    const { name, email, message } = req.body;

    // Input validation
    if (!name || !email || !message) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    // Create and save the form document to MongoDB
    const newForm = new Form({ name, email, message });
    await newForm.save();

    // Send an email notification
    const mailOptions = {
      from: process.env.EMAIL_USER || 'amit.misal20198@gmail.com', // Sender address
      to: 'amitmisal72@gmail.com', // Replace with the recipient's email
      subject: 'New Contact Form Submission (Portfolio)',
      text: `You have a new form submission on ${new Date().toLocaleString()}:\n\nName: ${name}\nEmail: ${email}\nMessage: ${message}`,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ success: true, message: 'Form data saved and email sent successfully' });
  } catch (error) {
    console.error('Error saving form data or sending email:', error);
    res.status(500).json({ success: false, message: 'Failed to save form data or send email' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
