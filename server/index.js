// server/index.js

const express = require('express');
const cors = require('cors');
const multer = require('multer');

const app = express();
const port = 5000;

// Enable CORS
app.use(cors());

// Set up Multer for file uploads
const upload = multer({ dest: 'uploads/' });

app.post('/upload', upload.single('image'), (req, res) => {
  console.log(req.file); // Log the uploaded file information
  res.send('Image received!');
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
