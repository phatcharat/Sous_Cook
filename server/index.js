const express = require('express');
const cors = require('cors');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const OpenAI = require('openai');
const sharp = require('sharp');
const vision = require('@google-cloud/vision');
const FormData = require('form-data');
const client = new vision.ImageAnnotatorClient();

require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// POST endpoint to handle image uploads
app.post('/upload', async (req, res) => {
  const { image } = req.body;

  if (!image) {
    return res.status(400).json({ error: "No image provided in request body" });
  }

  try {
    // Decode base64 image and save it temporarily
    const imageBuffer = Buffer.from(image.split(',')[1], 'base64');
    const imagePath = path.join(__dirname, 'uploads', 'captured_image.jpg');
    fs.writeFileSync(imagePath, imageBuffer);

    // Detect ingredients using Vision API
    const ingredients = await classifyCroppedImage(imagePath)//detectIngredients(imagePath);

    // Get menu recommendations using OpenAI API
    const recommendations = await getMenuRecommendations(ingredients);

    // Clean up the image file after processing
    fs.unlinkSync(imagePath);

    // Return the recommendations
    res.json({ recommendations });
  } catch (error) {
    console.error('Error processing image:', error);
    res.status(500).json({ error: 'Error processing image' });
  }
});

async function detectIngredients(imagePath) {
  try {
    // Perform object localization to detect objects in the image
    const [result] = await client.objectLocalization(imagePath);
    const objects = result.localizedObjectAnnotations;

    const classifiedObjects = [];

    // Process each detected object
    for (let i = 0; i < objects.length; i++) {
      const object = objects[i];

      try {
        // Crop the image based on the bounding box
        const croppedImagePath = await cropImage(imagePath, object, i);

        // Classify the cropped image using GPT
        const classificationResult = await classifyCroppedImage(croppedImagePath);

        if (classificationResult) {
          classifiedObjects.push({
            imageFile: `cropped_object_${i}.jpg`,
            ingredient_name: classificationResult.ingredient_name,
            quantity: classificationResult.quantity,
          });
        }
      } catch (error) {
        console.error(`Error processing object ${i}:`, error);
      }
    }

    return classifiedObjects;
  } catch (error) {
    console.error("Error detecting ingredients:", error);
    return [];
  }
}

async function cropImage(imagePath, object, index) {
  try {
    const imageBuffer = fs.readFileSync(imagePath);
    const imageMetadata = await sharp(imageBuffer).metadata();

    const { normalizedVertices } = object.boundingPoly;
    const x_min = Math.floor(normalizedVertices[0].x * imageMetadata.width);
    const y_min = Math.floor(normalizedVertices[0].y * imageMetadata.height);
    const width = Math.floor((normalizedVertices[2].x - normalizedVertices[0].x) * imageMetadata.width);
    const height = Math.floor((normalizedVertices[2].y - normalizedVertices[0].y) * imageMetadata.height);

    // Validate dimensions before cropping
    if (
      x_min >= 0 &&
      y_min >= 0 &&
      width > 0 &&
      height > 0 &&
      x_min + width <= imageMetadata.width &&
      y_min + height <= imageMetadata.height
    ) {
      const croppedImagePath = path.join(__dirname, `./uploads/crop/cropped_object_${index}.jpg`);
      await sharp(imageBuffer)
        .extract({ left: x_min, top: y_min, width, height })
        .toFile(croppedImagePath);
      return croppedImagePath;
    } else {
      throw new Error("Invalid crop dimensions");
    }
  } catch (error) {
    console.error("Error cropping image:", error);
    throw error;
  }
}

async function classifyCroppedImage(imagePath) {
  const imageBase64 = fs.readFileSync(imagePath, 'base64');
  
  // Construct the prompt with clear JSON boundaries to detect multiple ingredients
  const prompt = `
    You are an AI that classifies ingredients in images. 
    Given the following image (encoded in base64), identify all the ingredients you can detect.

    Respond with the following JSON format:
    <JSON_START>
    {
      "ingredients": [
        { "ingredient_name": "ingredient_name_1" },
        { "ingredient_name": "ingredient_name_2" },
        ...
      ]
    }
    <JSON_END>

    Image (base64 encoded):
    data:image/jpeg;base64,${imageBase64}
  `;

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'system', content: prompt }],
    max_tokens: 15000,
    temperature: 0.2,
  });

  const responseContent = response.choices[0].message.content;
  console.log(`Image path: ${imagePath}`);
  console.log('GPT-4o-mini response:', responseContent);  // Log full response for debugging

  // Remove any backticks or unwanted characters
  const cleanedResponse = responseContent.replace(/```json|```/g, '');

  // Extract JSON between <JSON_START> and <JSON_END>
  const jsonMatch = cleanedResponse.match(/<JSON_START>([\s\S]*?)<JSON_END>/);
  if (jsonMatch) {
    const jsonString = jsonMatch[1].trim();
    try {
      // Parse the JSON response
      const classificationResult = JSON.parse(jsonString);
      
      // Return the list of ingredients
      if (classificationResult.ingredients && classificationResult.ingredients.length > 0) {
        return classificationResult.ingredients;
      } else {
        console.error('No ingredients found in the response.');
        return [];
      }
    } catch (error) {
      console.error('Error parsing JSON:', error);
      return [];
    }
  } else {
    console.error('No JSON object found between markers in the assistant response.');
    return [];
  }
}

async function getMenuRecommendations(ingredients) {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const ingredientsList = ingredients.map((ingredient) => ingredient.name);

  const prompt = createPrompt(ingredientsList);

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 3000,
    });

    const responseContent = response.choices[0].message.content; // Extract the content from the response
    console.log("GPT-4o-mini response:", responseContent); // Log the full response to debug

    // Extract JSON between <JSON_START> and <JSON_END>
    const jsonMatch = responseContent.match(/<JSON_START>([\s\S]*?)<JSON_END>/);
    if (jsonMatch) {
      const jsonString = jsonMatch[1].trim();
      try {
        const recommendations = JSON.parse(jsonString);
        return recommendations;
      } catch (error) {
        console.error('Error parsing JSON:', error);
      }
    } else {
      console.error('No JSON object found in the response.');
    }
  } catch (error) {
    console.error('Error getting menu recommendations:', error);
  }
}

function createPrompt(ingredientsList) {
  return `
    You are an AI assistant that provides menu recommendations based on the following ingredients:
    ${ingredientsList.join(', ')}

    Recommend up to 3 menus that can be prepared from these ingredients. For each menu, provide the following details:
    - Menu name
    - Step-by-step cooking instructions
    - Quantity required for each ingredient

    Return the response in the following JSON format:
    {
      "menus": [
        {
          "menu_name": "string",
          "steps": ["string", "string", ...],
          "ingredients_quantity": {
            "ingredient_name": "string (quantity and unit)",
            ...
          }
        },
        ...
      ]
    }
    
    Ensure the JSON is properly formatted with no extra explanations or text.
  `;
}


// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
