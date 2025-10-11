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

export const isLoggedIn = () => {
  return getUserId() !== null;
};

export const logout = () => {
  try {
    localStorage.removeItem('user_id');
    console.log('User logged out successfully');
    return true;
  } catch (error) {
    console.error('Failed to logout:', error);
    return false;
  }
};