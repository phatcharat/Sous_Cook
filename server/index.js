const express = require('express');
const cors = require('cors');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const OpenAI = require('openai'); // Ensure you import OpenAI
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// Enable CORS for requests from http://localhost:3000
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
}));

app.options('*', cors());  // Allow preflight requests for all routes

// Middleware to parse JSON body requests
app.use(express.json({ limit: '50mb' }));  // Increase limit for larger images

// POST endpoint to handle image uploads
app.post('/upload', async (req, res) => {
  console.log("Received body:", req.body);  // Add this line to log the entire body

  const { image } = req.body;

  if (!image) {
    return res.status(400).json({ error: "No image provided in request body" });
  }

  try {
    // Decode base64 image and save it temporarily
    const imageBuffer = Buffer.from(image.split(',')[1], 'base64');
    const imagePath = path.join(__dirname, 'uploads', 'captured_image.jpg');
    fs.writeFileSync(imagePath, imageBuffer);

    // Now send the saved image to GPT-4 Vision (or another API)
    const gptResponse = await callGpt4VisionApi(imagePath);

    // Clean up the image file after sending
    fs.unlinkSync(imagePath);

    // Return GPT-4 Vision response
    res.json({ gptResponse });
  } catch (error) {
    console.error('Error processing image:', error);
    res.status(500).json({ error: 'Error processing image' });
  }
});

// Example function to call GPT-4 Vision API
async function callGpt4VisionApi(imagePath) {
  console.log("Sending to GPT-4 Vision...");

  // Initialize the OpenAI API client
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  // Read the image file as base64
  const imageAsBase64 = fs.readFileSync(imagePath, 'base64');

  // Send the image to GPT-4 Vision API
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: 'Describe the image.' },
      { role: 'user', content: `data:image/jpeg;base64,${imageAsBase64}` },
    ],
    max_tokens: 1000,
  });

  return response.choices[0].message.content;
}

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
