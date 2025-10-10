export const getUserId = () => {
  try {
    return localStorage.getItem('user_id');
  } catch (error) {
    console.error('Failed to get userId:', error);
    return null;
  }
};

export const setUserId = (userId) => {
  try {
    if (!userId) {
      console.error('Invalid userId');
      return false;
    }
    localStorage.setItem('user_id', userId);
    return true;
  } catch (error) {
    console.error('Failed to save userId:', error);
    return false;
  }
};

export const removeUserId = () => {
  try {
    localStorage.removeItem('user_id');
  } catch (error) {
    console.error('Failed to remove userId:', error);
  }
};

export const isLoggedIn = () => {
  return getUserId() !== null;
};