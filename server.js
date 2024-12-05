const express = require('express');
const mongoose = require('mongoose');
const app = express();

// Port configuration
const PORT = process.env.PORT || 10000;

const cors = require('cors');
app.use(cors());

// Middleware to parse JSON
app.use(express.json());

// MongoDB Atlas Connection URI (ensure you hide sensitive data in environment variables)
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://amitmisal789:FM7NfMggS5HUuI51@cluster0.pa5c5.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

// Connect to MongoDB Atlas
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Connected to MongoDB Cloud (Atlas)'))
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

// API endpoint to handle form submissions
app.post('/api/submitForm', async (req, res) => {
  try {
    const { name, email, message } = req.body;

    // Input validation (additional checks)
    if (!name || !email || !message) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    // Create and save the form document to MongoDB
    const newForm = new Form({ name, email, message });
    await newForm.save();

    res.status(200).json({ success: true, message: 'Form data saved successfully' });
  } catch (error) {
    console.error('Error saving form data:', error);
    res.status(500).json({ success: false, message: 'Failed to save form data' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
