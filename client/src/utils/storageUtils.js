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
