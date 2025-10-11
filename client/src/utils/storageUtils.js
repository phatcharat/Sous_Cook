// src/utils/storageUtils.js
// Function to save ingredients to localStorage
export const saveIngredientsToLocalStorage = (ingredients) => {
  localStorage.setItem('ingredients', JSON.stringify(ingredients));
};

// Function to retrieve ingredients from localStorage
export const getIngredientsFromLocalStorage = () => {
  const storedIngredients = localStorage.getItem('ingredients');
  try {
    return storedIngredients ? JSON.parse(storedIngredients) : [];
  } catch (error) {
    console.error('Error parsing ingredients from localStorage:', error);
    return [];
  }
};

// Function to save menu recommendations to localStorage
export const savePreferencesToLocalStorage = (menu) => {
  localStorage.setItem('Preferences', JSON.stringify(menu));  // Changed to use "menu" as key
};

// Function to retrieve menu recommendations from localStorage
export const getPreferencesFromLocalStorage = () => {
  const storedMenu = localStorage.getItem('Preferences');  // Fetching from "menu" instead of "ingredients"
  try {
    return storedMenu ? JSON.parse(storedMenu) : [];
  } catch (error) {
    console.error('Error parsing menu from localStorage:', error);
    return [];
  }
};

export const saveMenuToLocalStorage = (menus) => {
  localStorage.setItem('menus', JSON.stringify(menus));
};

export const getMenuFromLocalStorage = () => {
  const storedMenu = localStorage.getItem('menus');
  try {
    return storedMenu ? JSON.parse(storedMenu) : [];  // Return an empty array if there's no data
  } catch (error) {
    console.error('Error parsing menu recommendations from localStorage:', error);
    return [];  // Return empty array in case of error
  }
};

export const saveImageToLocalStorage = (Images_list) => {
  localStorage.setItem('images', JSON.stringify(Images_list));
};



export const getImageFromLocalStorage = () => {
  const storedImages = localStorage.getItem('images');
  try {
    return storedImages ? JSON.parse(storedImages) : { ingredient: {} };  // Return an object with ingredients
  } catch (error) {
    console.error('Error parsing images from localStorage:', error);
    return { ingredient: {} };  // Return an empty object in case of error
  }
};

// Function to print any data from localStorage by key
export const printData = (ItemName) => {
  // Retrieve the stored item from localStorage
  const storedItem = localStorage.getItem(ItemName);  // Using ItemName to fetch the specific data

  try {
    // If data is found, parse it. If not, return an empty array.
    const parsedItem = storedItem ? JSON.parse(storedItem) : [];
    console.log(parsedItem);
  } catch (error) {
    // Handle parsing errors
    console.error(`Error parsing ${ItemName} from localStorage:`, error);
  }
};

export const getCameraIngredientsFromLocalStorage = () => {
    try {
        const ingredients = localStorage.getItem('cameraIngredients');
        return ingredients ? JSON.parse(ingredients) : [];
    } catch (error) {
        console.error('Error getting camera ingredients from localStorage:', error);
        return [];
    }
};

export const saveCameraIngredientsToLocalStorage = (ingredients) => {
    try {
        localStorage.setItem('cameraIngredients', JSON.stringify(ingredients));
    } catch (error) {
        console.error('Error saving camera ingredients to localStorage:', error);
    }
};

export const getDeletedIngredients = () => {
    try {
        const deleted = localStorage.getItem('deletedIngredients');
        return deleted ? JSON.parse(deleted) : [];
    } catch (error) {
        return [];
    }
};

export const addDeletedIngredient = (ingredientName) => {
    try {
        const deleted = getDeletedIngredients();
        const name = ingredientName.trim().toLowerCase();
        if (!deleted.includes(name)) {
            localStorage.setItem('deletedIngredients', JSON.stringify([...deleted, name]));
        }
    } catch (error) {}
};
