// server/index.js

const express = require('express');
const cors = require('cors');
const multer = require('multer');
const axios = require('axios');
require('dotenv').config();

const app = express();
const port = 5000;

// Enable CORS
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Increase the limit for large images

// Set up Multer for file uploads
const upload = multer({ dest: 'uploads/' });

// Endpoint to handle image upload
app.post('/upload', async (req, res) => {
  console.log("image upload");
  
  try {
    const { image } = req.body;

    // Example of sending data to ChatGPT or another API
    const response = await axios.post(
      'https://api.openai.com/v1/completions',
      {
        prompt: "Describe the image: " + image.substring(0, 100), // Truncate image data to prevent overloading prompt
        max_tokens: 50,
        // Additional API configuration...
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    // Send back the response from ChatGPT or other processing results
    res.json({
      message: 'Image processed successfully',
      gptResponse: response.data.choices[0].text,
    });
  } catch (error) {
    console.error('Error processing the image:', error);
    res.status(500).json({ error: 'Error processing the image' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
