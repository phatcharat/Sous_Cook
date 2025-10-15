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
const { OAuth2Client } = require('google-auth-library');
const bcrypt = require('bcrypt');
const googleAuthClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// db
const pool = require('./db');
const { DESTRUCTION } = require('dns');

// File Storage Configuration

// Create folder for avatar
const UPLOAD_DIR = path.join(__dirname, 'uploads', 'avatars');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Configure Multer for upload file
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    // Create unique file name
    const userId = req.params.user_id;
    const ext = path.extname(file.originalname);
    const filename = `user_${userId}_${Date.now()}${ext}`;
    cb(null, filename);
  }
});

const avatarUpload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Limit 5 MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Function for Google avatar URL
async function downloadGoogleAvatar(avatarUrl, userId) {
  try {
    console.log('Downloading Google avatar from:', avatarUrl);

    const response = await axios.get(avatarUrl, {
      responseType: 'arraybuffer',
      timeout: 10000 // 10 seconds timeout
    });

    const filename = `user_${userId}_google_${Date.now()}.jpg`;
    const filepath = path.join(UPLOAD_DIR, filename);

    fs.writeFileSync(filepath, response.data);

    console.log('Google avatar downloaded successfully:', filename);
    return filename;
  } catch (error) {
    console.error('Error downloading Google avatar:', error.message);
    return null;
  }
}

// Function for delete old avatar
function deleteOldAvatar(filename) {
  if (!filename) return;

  const filepath = path.join(UPLOAD_DIR, filename);
  if (fs.existsSync(filepath)) {
    try {
      fs.unlinkSync(filepath);
      console.log('Delete old avatar:', filename);
    } catch (error) {
      console.error('Error deleting old avatar:', error);
    }
  }
}

const limiter = new Bottleneck({
  minTime: 200,  // Control the time between requests
  maxConcurrent: 10  // Control how many requests run at the same time
});

const endaman_app_id = process.env.EDAMAN_APP_ID;
const endaman_api_key = process.env.EDAMAN_API_KEY;

require('dotenv').config();

const app = express();
const port = process.env.PORT || 5050;
const server_ip = process.env.SERVER_IP || '127.0.0.1';

app.use(cors({
  origin: ['http://localhost:3000', `http://localhost:5050`, `http://127.0.0.1:3000`, `http://127.0.0.1:5050`],
  credentials: true,
}));

app.use(express.json({ limit: '50mb' }));
app.use('/uploads/avatars', express.static(UPLOAD_DIR));

// POST signup
app.post('/signup', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check email is already exists
    const existingEmail = await pool.query(
      "SELECT * FROM users WHERE email = $1 AND deleted_at IS NULL",
      [email]
    );

    if (existingEmail.rows.length > 0) {
      const user = existingEmail.rows[0];
      if (user.google_id && !user.password_hash) {
        return res.status(400).json({
          message: "This email is already registered with Google. Please login with Google."
        });
      }
      return res.status(400).json({ message: "Email already exists" });
    }

    const existingUsername = await pool.query(
      "SELECT * FROM users WHERE username = $1 AND deleted_at IS NULL",
      [username]
    )

    if (existingUsername.rows.length > 0) {
      return res.status(400).json({ message: "Username already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new users to DB
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


//GET signup
app.get('/signup', async (req, res) => {
  try {
    const new_user = await pool.query("SELECT user_id, username, email, created_at FROM users WHERE deleted_at IS NULL");

    res.json({
      status: 'Success',
      users: new_user.rows
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error' });
  }
});

// POST login
app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    const existingUsername = await pool.query(
      "SELECT * FROM users WHERE username = $1 AND deleted_at IS NULL",
      [username]
    );
    if (existingUsername.rows.length === 0) {
      return res.status(401).json({ error: "Invalid username or password. Please try again." })
    }

    const user = existingUsername.rows[0];

    // Check Google user
    if (!user.password_hash && user.google_id) {
      return res.status(401).json({
        error: "This account uses Google Sign-In. Please login with Google."
      });
    }

    if (!user.password_hash) {
      return res.status(401).json({ error: "Invalid username or password. Please try again." })
    }

    const checkPassword = await bcrypt.compare(password, user.password_hash);
    if (checkPassword) {
      res.status(200).json({
        message: "Login Successful",
        user_id: user.user_id
      });
    } else {
      res.status(401).json({ error: "Invalid username or password. Please try again." })

    }

  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST google-auth
app.post('/google-auth', async (req, res) => {
  try {
    const { credential, email, username, avatar, google_id } = req.body;

    // Verify Google Token
    const ticket = await googleAuthClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();

    // Check if token is valid
    if (payload.sub !== google_id || payload.email !== email) {
      return res.status(401).json({ message: 'Invalid Google Token' });
    }

    // Check if user exists by email
    const userCheck = await pool.query(
      'SELECT * FROM users WHERE email = $1 AND deleted_at IS NULL',
      [email]
    );

    let user;
    let isNewUser = false;
    let avatarFilename = null;

    if (userCheck.rows.length > 0) {
      // ผู้ใช้เดิม
      user = userCheck.rows[0];

      // กรณีที่ user เดิมยังไม่มี google_id (login แบบปกติก่อน แล้วมา login google ทีหลัง)
      if (!user.google_id) {
        // Download Google avatar
        if (avatar) {
          avatarFilename = await downloadGoogleAvatar(avatar, user.user_id);

          // Delete old avatar if exists
          if (user.avatar) {
            deleteOldAvatar(user.avatar);
          }
        }

        const updateResult = await pool.query(
          `UPDATE users
          SET google_id = $1, avatar = $2, updated_at = NOW()
          WHERE user_id = $3
          RETURNING *`,
          [google_id, avatarFilename, user.user_id]
        );
        user = updateResult.rows[0];

      }
      // กรณีที่มี google_id แล้ว แต่ไม่มีรูป
      else if (user.google_id && !user.avatar && avatar) {
        avatarFilename = await downloadGoogleAvatar(avatar, user.user_id);

        const updateResult = await pool.query(
          'UPDATE users SET avatar = $1, updated_at = NOW() WHERE user_id = $2 RETURNING *',
          [avatarFilename, user.user_id]
        );
        user = updateResult.rows[0];

      }
      // กรณีที่มีทั้ง google_id และ avatar แล้ว - อาจจะอัพเดตรูปใหม่
      else if (user.google_id && avatar) {
        // เช็คว่ารูป Google เปลี่ยนหรือไม่
        avatarFilename = await downloadGoogleAvatar(avatar, user.user_id);

        if (avatarFilename) {
          // Delete old avatar
          if (user.avatar) {
            deleteOldAvatar(user.avatar);
          }

          const updateResult = await pool.query(
            'UPDATE users SET avatar = $1, updated_at = NOW() WHERE user_id = $2 RETURNING *',
            [avatarFilename, user.user_id]
          );
          user = updateResult.rows[0];

          console.log('Updated Google user avatar');
        }
      }

    } else {
      // ผู้ใช้ใหม่
      let finalUsername = username || email.split('@')[0];

      // Check if username exists
      const usernameCheck = await pool.query(
        'SELECT username FROM users WHERE username = $1',
        [finalUsername]
      );

      if (usernameCheck.rows.length > 0) {
        // Add random number to make unique username
        finalUsername = `${finalUsername}_${Math.floor(Math.random() * 10000)}`;
      }

      // Download Google avatar for new user
      if (avatar) {
        const tempUserId = email.replace(/[@.]/g, '_');
        avatarFilename = await downloadGoogleAvatar(avatar, tempUserId);
      }

      const insertResult = await pool.query(
        `INSERT INTO users (username, email, password_hash, google_id, avatar, created_at)
        VALUES ($1, $2, NULL, $3, $4, NOW())
        RETURNING *`,
        [finalUsername, email, google_id, avatarFilename]
      );

      user = insertResult.rows[0];
      isNewUser = true;

    }

    // สร้าง avatar_url
    if (user.avatar) {
      user.avatar_url = `http://${server_ip}:${port}/uploads/avatars/${user.avatar}`;
    }

    // Return response
    res.json({
      user_id: user.user_id,
      is_new_user: isNewUser,
      avatar_url: user.avatar_url,
      message: isNewUser ? 'Account created successfully' : 'Login successfully'
    });

  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({ message: 'Authentication failed. Please try again.' });
  }
});

// GET user info by user_id
app.get('/api/users/:user_id', async (req, res) => {
  try {
    const { user_id } = req.params;
    const result = await pool.query(
      "SELECT user_id, username, email, created_at, updated_at, deleted_at, avatar, phone_number, birth_date, country, allergies FROM users WHERE user_id = $1",
      [user_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = result.rows[0];

    if (user.avatar) {
      user.avatar_url = `http://${server_ip}:${port}/uploads/avatars/${user.avatar}`;
    }

    res.json({
      status: 'Success',
      user: user
    });
  } catch (error) {
    console.error('Error fetching user:', error.message);
    res.status(500).json({ error: 'Database error' });
  }
});

// PUT user info
app.put('/api/users/:user_id', avatarUpload.single('avatar'), async (req, res) => {
  const { user_id } = req.params;
  const { username, email, phone_number, birth_date, country, allergies } = req.body;

  try {

    const oldUser = await pool.query('SELECT avatar FROM users WHERE user_id = $1', [user_id]);
    const oldAvatar = oldUser.rows[0]?.avatar;

    const fields = [];
    const values = [];
    let index = 1;

    if (username) { fields.push(`username=$${index++}`); values.push(username); }
    if (email) { fields.push(`email=$${index++}`); values.push(email); }
    if (phone_number) { fields.push(`phone_number=$${index++}`); values.push(phone_number); }
    if (birth_date) { fields.push(`birth_date=$${index++}`); values.push(birth_date); }
    if (country) { fields.push(`country=$${index++}`); values.push(country); }

    if (allergies !== undefined) {
      fields.push(`allergies=$${index++}`);

      const allergiesArray = typeof allergies === 'string' ? JSON.parse(allergies) : allergies;
      values.push(Array.isArray(allergiesArray) ? allergiesArray : []);
    }

    if (req.file) {
      fields.push(`avatar=$${index++}`);
      values.push(req.file.filename);

      if (oldAvatar) {
        deleteOldAvatar(oldAvatar);
      }
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
    const updatedUser = result.rows[0];

    if (updatedUser.avatar) {
      updatedUser.avatar_url = `http://${server_ip}:${port}/uploads/avatars/${updatedUser.avatar}`;
    }

    res.json({ success: true, user: updatedUser });

  } catch (err) {
    console.error('Error updating user:', err.message);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// DELETE user (soft delete)
app.delete('/api/users/:user_id', async (req, res) => {
  try {
    const { user_id } = req.params;

    // Get user data
    const user = await pool.query('SELECT avatar FROM users WHERE user_id = $1', [user_id]);

    if (user.rows.length > 0 && user.rows[0].avatar) {
      deleteOldAvatar(user.rows[0].avatar);
    }

    // Soft delete 
    await pool.query(
      'UPDATE users SET deleted_at = NOW() WHERE user_id = $1',
      [user_id]
    );

    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// Random menu endpoint
app.get('/api/random-menu', async (req, res) => {
  try {

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    // Random preference
    const cuisines = ['Southeast Asian', 'American', 'Italian', 'Maxican', 'Indian', 'Fusion', 'South American', 'Middle Eastern', 'Mediterranean'];
    const randomCuisine = cuisines[Math.floor(Math.random() * cuisines.length)];

    const mealTypes = ['Breakfast', 'Lunch', 'Dinner', 'Snack', 'Side Dish', 'Party'];
    const randomMealType = mealTypes[Math.floor(Math.random() * mealTypes.length)];

    // สร้าง prompt สำหรับสุ่มเมนู
    const prompt = `
      You are an AI chef that creates random menu recommendations.
      
      Generate ONE random ${randomCuisine} ${randomMealType} menu that is delicious and popular.
      
      Provide the following details:
      - Menu name
      - Preparation time (prep_time)
      - Cooking time (cooking_time)
      - Step-by-step cooking instructions
      - Quantity required for each ingredient
      - Nutrition information
      - Cooking tips
      
      Classify ingredients according to these types:
      - Eggs, milk, and dairy products
      - Fats and oils
      - Fruits
      - Grains, nuts, and baking products
      - Herbs and spices
      - Meat, sausages, and fish
      - Pasta, rice, and pulses
      - Vegetables
      - Miscellaneous items
      
      Return the response in the following JSON format:
      <JSON_START>
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
          "sodium": "string",
          "sugar": "string"
        },
        "ingredients_quantity": {
          "ingredient_name": "string (quantity and unit)",
          ...
        },
        "ingredients_type": {
          "ingredient_name": "string (ingredient_type)",
          ...
        }
      }
      <JSON_END>
      
      Ensure the JSON is properly formatted with no extra explanations or text.
    `;

    console.log(`Generating random ${randomCuisine} ${randomMealType} menu...`);

    // เรียก OpenAI API
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 15000,
      temperature: 0.9,
    });

    const responseContent = response.choices[0].message.content;
    console.log("GPT-4o-mini response received");

    const jsonMatch = responseContent.match(/<JSON_START>([\s\S]*?)<JSON_END>/);

    if (!jsonMatch) {
      throw new Error('No valid Json found in response');
    }

    const jsonString = jsonMatch[1].trim();
    const randomMenu = JSON.parse(jsonString);

    // ดึงรูปภาพจาก Edamam API
    console.log(`Fetching image for: ${randomMenu.menu_name}`);
    const imageUrl = await fetchImageForMenu(randomMenu.menu_name);
    randomMenu.image = imageUrl || 'default-image-url';

    // บันทึกเมนูลง database
    console.log(`Saving menu to database: ${randomMenu.menu_name}`);
    const dbResult = await pool.query(
      `INSERT INTO menus (menu_name, prep_time, cooking_time, steps, ingredients_quantity, ingredients_type, nutrition, image)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (menu_name) DO UPDATE
       SET prep_time = EXCLUDED.prep_time,
           cooking_time = EXCLUDED.cooking_time,
           steps = EXCLUDED.steps,
           ingredients_quantity = EXCLUDED.ingredients_quantity,
           ingredients_type = EXCLUDED.ingredients_type,
           nutrition = EXCLUDED.nutrition,
           image = EXCLUDED.image
       RETURNING menu_id, menu_name`,
      [
        randomMenu.menu_name,
        randomMenu.prep_time || null,
        randomMenu.cooking_time || null,
        JSON.stringify(randomMenu.steps || []),
        JSON.stringify(randomMenu.ingredients_quantity || {}),
        JSON.stringify(randomMenu.ingredients_type || {}),
        JSON.stringify(randomMenu.nutrition || {}),
        randomMenu.image
      ]
    );

    const savedMenu = dbResult.rows[0];
    console.log(`Menu saved with ID: ${savedMenu.menu_id}`);

    // ส่งข้อมูลกลับ
    res.json({
      success: true,
      menu: {
        ...randomMenu,
        menu_id: savedMenu.menu_id
      },
      cuisine: randomCuisine,
      meal_type: randomMealType,
      message: 'Random menu generated and saved successfully'
    });

  } catch (error) {
    console.error('Error generating random menu:', error);

    // กรณี error ส่ง fallback menu
    res.status(500).json({
      success: false,
      error: 'Failed to generate random menu',
      details: error.message
    });
  }
});

// GET meal statistics
app.get('/api/users/:user_id/meal-stats', async (req, res) => {
  try {
    const { user_id } = req.params;

    // Get total completed meals
    const completedResult = await pool.query(
      `SELECT COUNT(*) as total_completed
       FROM meal_completions
       WHERE user_id = $1`,
      [user_id]
    );

    // Get most frequently cooked menu
    const frequentResult = await pool.query(
      `SELECT m.menu_name, COUNT(*) as cook_count
       FROM meal_completions mc
       JOIN menus m ON mc.menu_id = m.menu_id
       WHERE mc.user_id = $1
       GROUP BY m.menu_id, m.menu_name
       ORDER BY cook_count DESC
       LIMIT 1`,
      [user_id]
    );

    res.json({
      total_completed: completedResult.rows[0].total_completed || 0,
      most_cooked: frequentResult.rows[0] || null
    });
  } catch (err) {
    console.error('Error fetching meal stats:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET monthly meal statistics (5 months back)
app.get('/api/users/:user_id/monthly-meal-stats', async (req, res) => {
  try {
    const { user_id } = req.params;

    // ดึงข้อมูล meal completions ของ 5 เดือนย้อนหลัง
    const result = await pool.query(
      `SELECT 
        TO_CHAR(completed_at, 'Mon') as month,
        TO_CHAR(completed_at, 'YYYY-MM') as year_month,
        COUNT(*) as meal_count
       FROM meal_completions
       WHERE user_id = $1 
         AND completed_at >= NOW() - INTERVAL '3 months'
       GROUP BY year_month, TO_CHAR(completed_at, 'Mon'), DATE_TRUNC('month', completed_at)
       ORDER BY DATE_TRUNC('month', completed_at) ASC`,
      [user_id]
    );

    const CO2_PER_MEAL = 2.0;

    const statsWithCO2 = result.rows.map(row => ({
      month: row.month,
      year_month: row.year_month,
      meal_count: parseInt(row.meal_count),
      co2_saved: (parseFloat(row.meal_count) * CO2_PER_MEAL).toFixed(2)
    }));

    const months = [];
    const now = new Date();

    for (let i = 3; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = date.toISOString().slice(0, 7); 
      const monthName = date.toLocaleDateString('en-US', { month: 'short' });

      const existingData = statsWithCO2.find(s => s.year_month === monthKey);

      months.push({
        month: monthName,
        year_month: monthKey,
        meal_count: existingData ? existingData.meal_count : 0,
        co2_saved: existingData ? existingData.co2_saved : '0.00'
      });
    }

    const totalMeals = months.reduce((sum, m) => sum + m.meal_count, 0);
    const totalCO2 = months.reduce((sum, m) => sum + parseFloat(m.co2_saved), 0).toFixed(2);

    const currentMonth = months[months.length - 1];

    res.json({
      monthly_stats: months,
      total_meals: totalMeals,
      total_co2_saved: totalCO2,
      current_month: {
        month: currentMonth.month,
        meal_count: currentMonth.meal_count,
        co2_saved: currentMonth.co2_saved
      }
    });

  } catch (err) {
    console.error('Error fetching monthly meal stats:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/menu-detail/:index/reviews', async (req, res) => {
  // const user_id = req.user.id;
  try {
    const { user_id, menu_id, comment, rating } = req.body;
    const menu_idNumber = parseInt(menu_id, 10);
    const user_idNumber = parseInt(user_id, 10);
    const ratingNumber = parseInt(rating, 10);

    if (!user_idNumber || !menu_idNumber || !comment || !ratingNumber) {
       return res.status(400).json({ message: "Missing required fields: menu_id, comment, and rating are required." });
    }

    await pool.query(
      "INSERT INTO review (user_id, menu_id, rating, comment, created_at) VALUES ($1, $2, $3, $4, NOW())",
      [user_idNumber, menu_idNumber, ratingNumber, comment]
    );
    res.status(201).json({ message: "Review posted Successfully" });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Server Error" });
  }
  
});


app.get('/api/menu-detail/:index/reviews', async (req, res) => {
  const urlIndex = req.params.index;
  const intIndex = parseInt(urlIndex, 10);

  if (isNaN(intIndex) || intIndex < 0) {
    return res.status(400).send({message: "Invalid index provide."});
  }
  try {
    const menu_result = await pool.query("SELECT menu_id FROM menus OFFSET $1 LIMIT 1;", [intIndex]);
    if (menu_result.rows.length === 0) {
      return res.status(404).send({message: "Menu not found at this index."});
    }
    const actual_menu_id = parseInt(menu_result.rows[0].menu_id, 10);
    const review_result = await pool.query(`SELECT r.*, u.username, u.avatar
                                            FROM review r JOIN users u ON r.user_id = u.user_id
                                            WHERE r.menu_id = $1
                                            ORDER BY r.created_at DESC;`, [actual_menu_id]);
                                            
    const rating_result = await pool.query(`SELECT SUM(rating) AS sum_rating, COALESCE(AVG(rating), 0.00) AS avg_rating,
                                            SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END) AS rate_5,
                                            SUM(CASE WHEN rating = 4 THEN 1 ELSE 0 END) AS rate_4,
                                            SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END) AS rate_3,
                                            SUM(CASE WHEN rating = 2 THEN 1 ELSE 0 END) AS rate_2,
                                            SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END) AS rate_1
                                            FROM review
                                            WHERE menu_id = $1;`, [actual_menu_id]);

    const rawStats = rating_result.rows.length > 0 ? rating_result.rows[0] : {};
    const summaryData = {
        sum_rating: parseFloat(rawStats.sum_rating) || 0,
        avg_rating: parseFloat(rawStats.avg_rating).toFixed(2) || 0,
        rate_5: parseInt(rawStats.rate_5) || 0,
        rate_4: parseInt(rawStats.rate_4) || 0,
        rate_3: parseInt(rawStats.rate_3) || 0,
        rate_2: parseInt(rawStats.rate_2) || 0,
        rate_1: parseInt(rawStats.rate_1) || 0,
    };
    return res.json({
      menu_id: actual_menu_id,
      reviews: review_result.rows,
      ...summaryData
    });

  } catch {
    console.error(error.message);
    res.status(500).json({ error: 'Server error'});
  }
});

app.put('/api/reviews', async (req, res) => {
  try {
    const { user_id, menu_id, comment, rating } = req.body;
    const menu_idNumber = parseInt(menu_id, 10);
    const user_idNumber = parseInt(user_id, 10);
    const ratingNumber = parseInt(rating, 10);

    if (!user_idNumber || !menu_idNumber || !comment || !ratingNumber) {
       return res.status(400).json({ message: "Missing required fields: menu_id, comment, and rating are required." });
    }

    await pool.query(
      "UPDATE review SET rating = $1, comment= $2, updated_at = now() WHERE menu_id = $3 AND user_id = $4; ",
      [ratingNumber, comment, menu_idNumber, user_idNumber]
    );
    res.status(201).json({ message: "Review posted Successfully" });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Server Error" });
  }
  
});

app.delete('/api/:menuId/:userId/reviews', async (req, res) => {
  try {
    const { menuId, userId } = req.params;
    const menu_idNumber = parseInt(menuId, 10);
    const user_idNumber = parseInt(userId, 10);

    // Soft delete 
    const result = await pool.query(
      'DELETE FROM review WHERE user_id = $1 AND menu_id = $2',
      [user_idNumber, menu_idNumber]
    );

    res.json({ success: true, message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({ error: 'Failed to delete review' });
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
      `https://api.edamam.com/api/recipes/v2?type=public&q=${encodeURIComponent(menuName)}&app_id=${endaman_app_id}&app_key=${endaman_api_key}&imageSize=REGULAR`
    );

    if (!response.ok) {
      console.error(`Image API returned ${response.status}: ${await response.text()}`);
      return null;
    }

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

// This is the endpoint called from MenuSuggestion.js
app.post("/api/menus", async (req, res) => {
  try {
    const {
      menu_name,
      prep_time,
      cooking_time,
      steps,
      ingredients_quantity,
      ingredients_type,
      nutrition,
      image,
    } = req.body;

    if (!menu_name) {
      return res.status(400).json({ error: "menu_name is required" });
    }

    const result = await pool.query(
      `INSERT INTO menus (menu_name, prep_time, cooking_time, steps, ingredients_quantity, ingredients_type, nutrition, image)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (menu_name) DO NOTHING
       RETURNING menu_id, menu_name`,
      [
        menu_name,
        prep_time || null,
        cooking_time || null,
        JSON.stringify(steps || []),
        JSON.stringify(ingredients_quantity || []),
        JSON.stringify(ingredients_type || []),
        JSON.stringify(nutrition || []),
        image || null,
      ]
    );

    if (result.rows.length > 0) {
      res
        .status(201)
        .json({ message: "Menu saved successfully", menu: result.rows[0] });
    } else {
      const existingMenu = await pool.query(
        `SELECT menu_id, menu_name FROM menus WHERE menu_name = $1`,
        [menu_name]
      );
      res
        .status(200)
        .json({ message: "Menu already exists", menu: existingMenu.rows[0] });
    }
  } catch (err) {
    console.error("Error saving menu:", err);
    res.status(500).json({ error: "Server error" });
  }
});

//Get menu by ID
app.get('/api/menus/:menuId', async (req, res) => {
  try {
    const { menuId } = req.params;
    const id = parseInt(menuId);

    if (!id) {
      return res.status(400).json({ error: 'Invalid menuId provided' });
    }

    const result = await pool.query(
      `SELECT * FROM menus WHERE menu_id = $1`,
      [id]
    );

    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.status(404).json({ error: 'Menu not found' });
    }
  } catch (err) {
    console.error('Error fetching menu by ID:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get menu by name
app.get('/api/menus/by-name/:menu_name', async (req, res) => {
  try {
    const { menu_name } = req.params;

    const result = await pool.query(
      'SELECT menu_id, menu_name FROM menus WHERE menu_name = $1',
      [menu_name]
    );

    if (result.rows.length === 0) return res.status(404).json({ error: 'Menu not found' });

    res.json(result.rows[0]); // { menu_id, menu_name }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Save history
app.post('/api/history', async (req, res) => {
  try {
    const { user_id, menu_id } = req.body;
    if (!user_id || !menu_id) {
      return res.status(400).json({ error: 'user_id and menu_id are required' });
    }

    const result = await pool.query(
      `INSERT INTO history (user_id, menu_id, created_at)
            VALUES ($1, $2, NOW())
            ON CONFLICT (user_id, menu_id) DO UPDATE
            SET created_at = EXCLUDED.created_at
            RETURNING *`,
      [user_id, menu_id]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error saving history:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get history by user_id
app.get('/api/history/:user_id', async (req, res) => {
  try {
    const { user_id } = req.params;

    const result = await pool.query(
      `SELECT DISTINCT ON (h.menu_id)
                h.history_id,
                h.created_at,
                m.menu_id,
                m.menu_name,
                m.prep_time,
                m.cooking_time,
                m.image
            FROM history h
            JOIN menus m ON h.menu_id = m.menu_id
            WHERE h.user_id = $1
            ORDER BY h.menu_id, h.created_at DESC`,
      [user_id]
    );

    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching history:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// เพิ่มเมนูเข้า favorite
app.post('/api/favorites', async (req, res) => {
  try {
    const { user_id, menu_id } = req.body;

    if (!user_id || !menu_id) {
      return res.status(400).json({ error: "user_id and menu_id required" });
    }

    const result = await pool.query(
      `INSERT INTO favorite_menu (user_id, menu_id)
       VALUES ($1, $2)
       ON CONFLICT (user_id, menu_id) DO NOTHING
       RETURNING *`,
      [user_id, menu_id]
    );

    res.json(result.rows[0] || { message: "Already in favorites" });
  } catch (err) {
    console.error("Error adding favorite:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ลบเมนูออกจาก favorite
app.delete('/api/favorites', async (req, res) => {
  try {
    const { user_id, menu_id } = req.body;

    if (!user_id || !menu_id) {
      return res.status(400).json({ error: "user_id and menu_id required" });
    }

    await pool.query(
      `DELETE FROM favorite_menu WHERE user_id = $1 AND menu_id = $2`,
      [user_id, menu_id]
    );

    res.json({ message: "Removed from favorites" });
  } catch (err) {
    console.error("Error removing favorite:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ดึงเมนู favorite ของ user
app.get('/api/favorites/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const result = await pool.query(
      `SELECT m.* 
       FROM favorite_menu f 
       JOIN menus m ON f.menu_id = m.menu_id
       WHERE f.user_id = $1
       ORDER BY f.created_at DESC`,
      [userId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching favorites:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Start the server
app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on ${port}`);
});