const express = require('express');
const cors = require('cors');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const OpenAI = require('openai');
const sharp = require('sharp');
const vision = require('@google-cloud/vision');
const client = new vision.ImageAnnotatorClient();
const Bottleneck = require('bottleneck');
const multer = require('multer');

// db
const bcrypt = require('bcrypt');
const pool = require('./db');

const limiter = new Bottleneck({
  minTime: 200,  // Control the time between requests
  maxConcurrent: 10  // Control how many requests run at the same time
});

const endaman_app_id = process.env.EDAMAN_APP_ID;
const endaman_api_key = process.env.EDAMAN_API_KEY;

require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

//route sign up page
app.post('/signup', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // check email is already exists
    const existingEmail = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );
    const existingUsername = await pool.query(
      "SELECT * FROM users WHERE username = $1",
      [username]
    );
    if (existingEmail.rows.length > 0) {
      return res.status(400).json({ message: "Email already exists" });
    } else if (existingUsername.rows.length > 0) {
      return res.status(400).json({ message: "Username already exists" });
    };

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // insert new users to DB
    await pool.query(
      "INSERT INTO users (username, email, password_hash, created_at) VALUES ($1, $2, $3, NOW())",
      [username, email, hashedPassword]
    );

    res.status(201).json({ message: "Sign Up Successfully" });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Server Error" });
  }
});

//GET sign up localhost:5050
app.get('/signup', async (req, res) => {
  try {
    const new_user = await pool.query("SELECT user_id, username, email, created_at FROM users");

    res.json ({
          status: 'Success',
          users: new_user.rows
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error'});
  }
});

app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const existingUsername = await pool.query(
      "SELECT * FROM users WHERE username = $1",
      [username]
    );
    if (existingUsername.rows.length === 0) {
      return res.status(401).json({ error: "Invalid username or password. Please try again."})
    } else {
        const existingPassword =  existingUsername.rows[0].password_hash;
        const checkPassword = await bcrypt.compare(password, existingPassword);
        if (checkPassword) {
          res.status(200).json({message: "Login Seccessful!", user_id:existingUsername.rows[0].user_id
          });
        } else {
          res.status(401).json({error: "Invalid username or password. Please try again."})
        };
    };

  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Server error'});
  }
});

// GET user info by user_id
app.get('/api/users/:user_id', async (req, res) => {
  try {
    const { user_id } = req.params;
    const result = await pool.query(
      "SELECT user_id, username, email, created_at, updated_at, deleted_at, avatar, phone_number, birth_date, country FROM users WHERE user_id = $1",
      [user_id]
    );

    const user = result.rows[0];

    res.json({
      status: 'Success',
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching user:', error.message);
    res.status(500).json({ error: 'Database error' });
  }
});

const upload = multer({ storage: multer.memoryStorage() });

// PUT user info
app.put('/api/users/:user_id', upload.single('avatar'), async (req, res) => {
  const { user_id } = req.params;
  const { username, email, phone_number, birth_date, country } = req.body;

  try {
    // เตรียมข้อมูลอัปเดต
    const fields = [];
    const values = [];
    let index = 1;

    if (username) { fields.push(`username=$${index++}`); values.push(username); }
    if (email) { fields.push(`email=$${index++}`); values.push(email); }
    if (phone_number) { fields.push(`phone_number=$${index++}`); values.push(phone_number); }
    if (birth_date) { fields.push(`birth_date=$${index++}`); values.push(birth_date); }
    if (country) { fields.push(`country=$${index++}`); values.push(country); }
    if (req.file) {
      const base64Avatar = req.file.buffer.toString('base64');
      fields.push(`avatar=$${index++}`);
      values.push(base64Avatar);
    }

    if (fields.length === 0) {
      return res.status(400).json({ error: 'No fields provided for update' });
    }

    const query = `
      UPDATE users 
      SET ${fields.join(', ')}, updated_at=NOW()
      WHERE user_id=$${index}
      RETURNING *;
    `;
    values.push(user_id);

    const result = await pool.query(query, values);
    res.json({ success: true, user: result.rows[0] });

  } catch (err) {
    console.error('Error updating user:', err.message);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Random menu endpoint
app.get('/api/random-menu', async (req, res) => {
  try {

    // Basic menu
    const randomIngredients = [
      ['chicken', 'rice', 'onion'],
      ['beef', 'potato', 'carrot'],
      ['pork', 'noodles', 'garlic'],
      ['tofu', 'mushroom', 'bell pepper'],
      ['shrimp', 'pasta', 'tomato'],
      ['egg', 'bread', 'cheese'],
      ['salmon', 'asparagus', 'spinach'],
      ['chicken breast', 'broccoli', 'corn'],
      ['ground pork', 'cabbage', 'eggplant']
    ];

    // Random ingredients
    const randomIndex = Math.floor(Math.random() * randomIngredients.length);
    const selectedIngredients = randomIngredients[randomIndex]

    // Random preference
    const cuisines = ['Thai', 'Chinese', 'Japanese', 'Western', 'Korean'];
    const randomCuisine = cuisines[Math.floor(Math.random() * cuisines.length)];

    // call getMenuRecommendations
    const recommendations = await getMenuRecommendations(
      selectedIngredients,
      [randomCuisine],
      [], // dietary preferences
      ['dinner'] // occasions
    );

    // Select menu from result
    if (recommendations.menus && recommendations.menus.length > 0) {
      const randomMenuIndex = Math.floor(Math.random() * recommendations.menus.length);
      const randomMenu = recommendations.menus[randomMenuIndex]

      res.json({
        success: true,
        menu: randomMenu,
        ingredients: selectedIngredients
      });
    } else {
      // if there is no menu from random
      res.json({
        success: true,
        menu: {
          menu_name:"Simply Stir Fry",
          prep_time: "10 minutes",
          cooking_time: "15 minutes",
          steps: [
            "Heat oil in a large pan or wok over high heat",
            "Add garlic and stir-fry for 30 seconds",
            "Add main ingredients and cook for 5-7 minutes",
            "Season with salt, pepper, and soy sauce",
            "Serve hot with rice"
          ],
          ingredients_quantity: {
            "oil": "2 tablespoons",
            "garlic": "2 cloves",
            "main ingredient": "300g",
            "soy sauce": "2 tablespoons"
          },
          image: "default-image-url"
        },
        ingredients: selectedIngredients
      });
    }
  } catch (error) {
    console.error('Error generating random menu:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate random menu'
    });
  }
});


app.get('/api/menu-detail/:index/reviews', async (req, res) => {
  const urlIndex = req.params.index;
  const intIndex = parseInt(urlIndex, 10);

  if (isNaN(intIndex) || intIndex < 0) {
    return res.status(400).send({message: "Invalid index provide."});
  }
  try {
    const menu_result = await pool.query("SELECT recipe_id FROM menus OFFSET $1 LIMIT 1;", [intIndex]);
    if (menu_result.rows.length === 0) {
      return res.status(404).send({message: "Menu not found at this index."});
    }
    const actual_menu_id = parseInt(menu_result.rows[0].menu_id, 10);
    const review_result = await pool.query(`SELECT r.*, u.username, u.avatar
                                            FROM review r JOIN users u ON r.user_id = u.user_id
                                            WHERE recipe_id = $1;`, [actual_menu_id]);
    return res.json({
      // menu_id: actual_menu_id,
      // reviews_count: review_result.rows.length,
      reviews: review_result.rows
    });

  } catch {
    console.error(error.message);
    res.status(500).json({ error: 'Server error'});
  }
});

//
//
// POST endpoint to handle image uploads
app.post('/api/upload', async (req, res) => {
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
app.post('/api/menu-recommendations', async (req, res) => {
  const { ingredients, cuisines, dietaryPreferences, mealOccasions } = req.body;

  console.log('Received ingredients:', ingredients);
  console.log('Received cuisines:', cuisines);
  console.log('Received dietaryPreferences:', dietaryPreferences);
  console.log('Received mealOccasions:', mealOccasions);

  if (!ingredients || ingredients.length === 0) {
    return res.status(400).json({ error: "No ingredients provided in request body" });
  }

  try {
    const recommendations = await getMenuRecommendations(ingredients, cuisines, dietaryPreferences, mealOccasions);
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
  
    // Safely map the ingredients list and ensure they have a valid 'name' property
    const ingredientsList = ingredients;

    if (ingredientsList.length === 0) {
      throw new Error("No valid ingredients found");
    }
  
    const cuisinesList = cuisines.length === 0 ? 'any' : cuisines.join(', ');
    const dietaryPreferencesList = dietaryPreferences.length === 0 ? 'any' : dietaryPreferences.join(', ');
    const mealOccasionsList = mealOccasions.length === 0 ? 'any' : mealOccasions.join(', ');

    const prompt = createPrompt(ingredientsList, cuisinesList, dietaryPreferencesList, mealOccasionsList);
    console.log(prompt);
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

          // Add images to the menus
          recommendations.menus = await addImagesToMenus(recommendations.menus);

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
      Cuisines: ${cuisinesList}
      Dietary Preferences: ${dietaryPreferencesList}
      Meal Occasions: ${mealOccasionsList}

      classify them according to the following common ingredient types:
      
      - Eggs, milk, and dairy products
      - Fats and oils
      - Fruits
      - Grains, nuts, and baking products
      - Herbs and spices
      - Meat, sausages, and fish
      - Pasta, rice, and pulses
      - Vegetables
      - Miscellaneous items
  
      Recommend up to 10 menus that can be prepared from these ingredients, taking into consideration the mentioned cuisines, dietary preferences, and meal occasions. For each menu, provide the following details:
      - Menu name
      - Preparation time (prep_time)
      - Cooking time (cooking_time)
      - Step-by-step cooking instructions
      - Quantity required for each ingredient
  
      Return the response in the following JSON format:
      <JSON_START>
      {
        "menus": [
          {
            "menu_name": "string",
            "prep_time": "string",
            "cooking_time": "string",
            "steps": ["string", "string", ...],
            "tips": ["string", "string", ...],
            "nutrition": {
                "calories": "string",
                "protein": "string",
                "fat": "string",
                "carbohydrates": "string",
                "sodium" : "string",
                "sugar" : "string"
            },
            "ingredients_quantity": {
              "ingredient_name": "string (quantity and unit)",
              ...
            },
            "ingredients_type" : {
              "ingredient_name" : "string (ingredient_type)",
              ...
            }
          },
          ...
        ]
      }
      <JSON_END>
  
      Ensure the JSON is properly formatted with no extra explanations or text.
    `;
  }  

// Function to encode image to base64
function encodeImage(imagePath) {
  const imageBuffer = fs.readFileSync(imagePath);
  return imageBuffer.toString('base64');
}

const addImagesToMenus = async (menus) => {
  const menusWithImages = await Promise.all(
    menus.map(async (menu) => {
      const imageUrl = await fetchImageForMenu(menu.menu_name);
      return {
        ...menu,
        image: imageUrl ? imageUrl : 'default-image-url',  // Use default image if no image found
      };
    })
  );
  return menusWithImages;
};

const fetchImageForMenu = limiter.wrap(async (menuName) => {
  try {
    const response = await axios.get(
      `https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(menuName)}`
    );
    //const data = await response.json();
    const data = response.data;

    if (data.meals && data.meals.length > 0) {
      return data.meals[0].strMealThumb;  // image form TheMealDB
    } else {
      console.log(`No image found for menu: ${menuName}`);
      return 'default-image-url';
    }
  } catch (error) {
    console.error(`Error fetching image for ${menuName}:`, error);
    return 'default-image-url';
  }
});

// POST endpoint for /get_ingredient_image
app.post('/api/get_ingredient_image', async (req, res) => {
  try {
    const ingredients = req.body.ingredients;

    if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
      return res.status(400).json({ error: 'Please provide a list of ingredient names.' });
    }

    let results = [];

    // Use the limiter for each ingredient request
    const promises = ingredients.map((ingredient) => 
      limiter.schedule(() => getIngredientImage(ingredient))
        .then((imageUrl) => ({ ingredient, imageUrl }))
    );

    // Wait for all promises to resolve
    results = await Promise.all(promises);
    console.log(`ingredient_image : ${JSON.stringify(results)}`);
    // Send the response
    res.json(results);
  } catch (error) {
    console.error('Error fetching ingredient images:', error.message);
    res.status(500).json({ error: 'Internal server error.' });
  }
});


async function getIngredientImage(ingredient) {
  const url = `https://api.spoonacular.com/food/ingredients/search`;

  const params = {
    query: ingredient, // Search for the ingredient
    apiKey: process.env.SPOONACULAR_API_KEY,
  };

  try {
    const response = await axios.get(url, { params });
    const data = response.data;

    if (data.results && data.results.length > 0) {
      // Get the first result and construct image URL
      const ingredientData = data.results[0];
      const imageUrl = `https://spoonacular.com/cdn/ingredients_100x100/${ingredientData.image}`;
      console.log(`Found image for ingredient "${ingredient}": ${imageUrl}`);
      return imageUrl;
    } else {
      console.log(`No image found for ingredient "${ingredient}".`);
      return null;
    }
  } catch (error) {
    console.error(`Error fetching image for "${ingredient}":`, error.message);
    return null;
  }
}

module.exports = { getIngredientImage };

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
