const express = require('express');
const cors = require('cors');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const OpenAI = require('openai');
const sharp = require('sharp');
const vision = require('@google-cloud/vision');
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
    const ingredients = await classifyCroppedImage(imagePath);

    // Clean up the image file after processing
    fs.unlinkSync(imagePath);

    // Return detected ingredients
    res.json({ ingredients });
  } catch (error) {
    console.error('Error processing image:', error);
    res.status(500).json({ error: 'Error processing image' });
  }
});

// POST endpoint to handle menu recommendations based on ingredients
app.post('/menu-recommendations', async (req, res) => {
  const { ingredients, cuisines, dietaryPreferences, mealOccasions } = req.body;

  if (!ingredients || ingredients.length === 0) {
    return res.status(400).json({ error: "No ingredients provided in request body" });
  }

  try {
    // Get menu recommendations using OpenAI API
    const recommendations = await getMenuRecommendations(ingredients, cuisines, dietaryPreferences, mealOccasions);

    // Return the recommendations
    res.json({ recommendations });
  } catch (error) {
    console.error('Error getting menu recommendations:', error);
    res.status(500).json({ error: 'Error getting menu recommendations' });
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
    try {
      // Encode the image to base64
      const base64Image = encodeImage(imagePath);
  
      // Define the prompt with the categories and instructions
      const prompt = `
      You are an AI that classifies ingredients in images based on the image provided.
  
      Given the following image (encoded in base64), identify all the ingredients you can detect and classify them according to the following common ingredient types:
      
      - Eggs, milk, and dairy products
      - Fats and oils
      - Fruits
      - Grains, nuts, and baking products
      - Herbs and spices
      - Meat, sausages, and fish
      - Pasta, rice, and pulses
      - Vegetables
      - Miscellaneous items
      
      If you cannot confidently detect any ingredient from the image, respond with "no ingredients detected" and do not fabricate information.
  
      For detected ingredients, you **must** assign them to one of the above ingredient types. If you cannot determine the type, leave it out of the response.
  
      Respond with the following strict JSON format:
  
      <JSON_START>
      {
        "ingredients": [
          { "ingredient_name": "ingredient_name_1", "ingredient_type": "type_1" },
          { "ingredient_name": "ingredient_name_2", "ingredient_type": "type_2" },
          ...
        ]
      }
      <JSON_END>
  
      Ensure the response is in valid JSON format and avoid any extraneous explanations or commentary.
  
      `;
  
      const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      };
  
      // Payload for the OpenAI API
      const payload = {
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'user',
            content: [
              {
                "type": "text",
                "text": prompt
              },
              {
                "type": "image_url",
                "image_url": {
                  "url": `data:image/jpeg;base64,${base64Image}`
                }
              }
            ]
          },
        ],
        max_tokens: 15000,
        temperature: 0.2,
      };
  
      // Sending the request to OpenAI
      const response = await axios.post('https://api.openai.com/v1/chat/completions', payload, { headers });
      
      const jsonMatch = response.data.choices[0].message.content.match(/<JSON_START>([\s\S]*?)<JSON_END>/);
      if (jsonMatch) {
        const jsonString = jsonMatch[1].trim();
        const classificationResult = JSON.parse(jsonString);
        return classificationResult.ingredients;
      } else {
        console.error('No valid JSON detected in response.');
        return [];
      }
    } catch (error) {
      console.error('Error classifying image:', error);
      return [];
    }
  }

async function getMenuRecommendations(ingredients, cuisines, dietaryPreferences, mealOccasions) {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const ingredientsList = ingredients.map((ingredient) => ingredient.name);
  const cuisinesList = cuisines.join(', ');  // Convert cuisines array to a comma-separated string
  const dietaryPreferencesList = dietaryPreferences.join(', ');  // Convert dietary preferences array to a comma-separated string
  const mealOccasionsList = mealOccasions.join(', ');  // Convert meal occasions array to a comma-separated string

  const prompt = createPrompt(ingredientsList, cuisinesList, dietaryPreferencesList, mealOccasionsList);

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 10000,
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

function createPrompt(ingredientsList, cuisinesList, dietaryPreferencesList, mealOccasionsList) {
  return `
    You are an AI assistant that provides menu recommendations based on the following details:

    Ingredients: ${ingredientsList.join(', ')}
    Cuisines: ${cuisinesList.join(', ')}
    Dietary Preferences: ${dietaryPreferencesList.join(', ')}
    Meal Occasions: ${mealOccasionsList.join(', ')}

    Recommend up to 10 menus that can be prepared from these ingredients, taking into consideration the mentioned cuisines, dietary preferences, and meal occasions. For each menu, provide the following details:
    - Menu name
    - Step-by-step cooking instructions
    - Quantity required for each ingredient
    - Preparation time (prep_time)
    - Cooking time (cooking_time)

    Return the response in the following JSON format:
    {
      "menus": [
        {
          "menu_name": "string",
          "prep_time": "string",
          "cooking_time": "string",
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


// Function to encode image to base64
function encodeImage(imagePath) {
  const imageBuffer = fs.readFileSync(imagePath);
  return imageBuffer.toString('base64');
}



// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
