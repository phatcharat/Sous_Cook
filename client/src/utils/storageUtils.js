import { getUserId } from './auth';

// src/utils/storageUtils.js
// Function to save ingredients to localStorage for a specific user
export const saveIngredientsToLocalStorage = (ingredients) => {
  const userId = getUserId();
  if (!userId) return;
  localStorage.setItem(`ingredients_${userId}`, JSON.stringify(ingredients));
};

// Function to retrieve ingredients from localStorage for a specific user
export const getIngredientsFromLocalStorage = () => {
  const userId = getUserId();
  if (!userId) return [];
  const storedIngredients = localStorage.getItem(`ingredients_${userId}`);
  try {
    return storedIngredients ? JSON.parse(storedIngredients) : [];
  } catch (error) {
    console.error('Error parsing ingredients from localStorage:', error);
    return [];
  }
};

// Function to save menu recommendations to localStorage
export const savePreferencesToLocalStorage = (menu) => {
  const userId = getUserId();
  if (!userId) return;
  localStorage.setItem(`Preferences_${userId}`, JSON.stringify(menu));
};

// Function to retrieve menu recommendations from localStorage
export const getPreferencesFromLocalStorage = () => {
  const userId = getUserId();
  if (!userId) return [];
  const storedMenu = localStorage.getItem(`Preferences_${userId}`);
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
    return storedMenu ? JSON.parse(storedMenu) : [];
  } catch (error) {
    console.error('Error parsing menu recommendations from localStorage:', error);
    return [];
  }
};

export const saveImageToLocalStorage = (Images_list) => {
  localStorage.setItem('images', JSON.stringify(Images_list));
};



export const getImageFromLocalStorage = () => {
  const storedImages = localStorage.getItem('images');
  try {
    return storedImages ? JSON.parse(storedImages) : { ingredient: {} };
  } catch (error) {
    console.error('Error parsing images from localStorage:', error);
    return { ingredient: {} };
  }
};

// Function to print any data from localStorage by key
export const printData = (ItemName) => {
  const storedItem = localStorage.getItem(ItemName);

  try {
    const parsedItem = storedItem ? JSON.parse(storedItem) : [];
    console.log(parsedItem);
  } catch (error) {
    console.error(`Error parsing ${ItemName} from localStorage:`, error);
  }
};

export const getCameraIngredientsFromLocalStorage = () => {
    const userId = getUserId();
    if (!userId) return [];
    try {
        const ingredients = localStorage.getItem(`cameraIngredients_${userId}`);
        return ingredients ? JSON.parse(ingredients) : [];
    } catch (error) {
        console.error('Error getting camera ingredients from localStorage:', error);
        return [];
    }
};

export const saveCameraIngredientsToLocalStorage = (ingredients) => {
    const userId = getUserId();
    if (!userId) return;
    try {
        localStorage.setItem(`cameraIngredients_${userId}`, JSON.stringify(ingredients));
    } catch (error) {
        console.error('Error saving camera ingredients to localStorage:', error);
    }
};

<<<<<<< HEAD
export const getDeletedIngredients = () => {
    const userId = getUserId();
    if (!userId) return [];
    try {
        const deleted = localStorage.getItem(`deletedIngredients_${userId}`);
        return deleted ? JSON.parse(deleted) : [];
    } catch (error) {
        return [];
    }
};

export const addDeletedIngredient = (ingredientName) => {
    const userId = getUserId();
    if (!userId) return;
    try {
        const deleted = getDeletedIngredients();
        const name = ingredientName.trim().toLowerCase();
        if (!deleted.includes(name)) {
            localStorage.setItem(`deletedIngredients_${userId}`, JSON.stringify([...deleted, name]));
        }
    } catch (error) {}
};

export const getShoppingListFromStorage = () => {
    const userId = getUserId();
    if (!userId) return [];
=======
export const getShoppingListFromStorage = (userId) => {
    const uid = userId || getUserId();
    if (!uid) return [];
>>>>>>> refs/remotes/origin/main
    try {
        const list = localStorage.getItem(`shoppingList_${uid}`);
        return list ? JSON.parse(list) : [];
    } catch (error) {
        console.error('Error getting shopping list:', error);
        return [];
    }
};

<<<<<<< HEAD
export const saveShoppingListToStorage = (items) => {
    const userId = getUserId();
    if (!userId) return;
=======
export const saveShoppingListToStorage = (items, userId) => {
    const uid = userId || getUserId();
    if (!uid) return;
>>>>>>> refs/remotes/origin/main
    try {
        localStorage.setItem(`shoppingList_${uid}`, JSON.stringify(items));
    } catch (error) {
        console.error('Error saving shopping list:', error);
    }
};