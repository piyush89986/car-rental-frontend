// Auth Context - Global state management for authentication
import React, { createContext, useReducer, useCallback } from 'react';
import authService from '../services/authService';

export const AuthContext = createContext();

const initialState = {
  user: authService.getCurrentUser(),
  isAuthenticated: authService.isAuthenticated(),
  isLoading: false,
  error: null,
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case 'LOGIN_FAIL':
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      };
    case 'REGISTER_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case 'REGISTER_SUCCESS':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case 'REGISTER_FAIL':
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        error: null,
      };
    case 'UPDATE_PROFILE':
      return {
        ...state,
        user: action.payload,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Login action
  const login = useCallback(async (email, password) => {
    dispatch({ type: 'LOGIN_START' });
    try {
      const response = await authService.login(email, password);
      dispatch({ type: 'LOGIN_SUCCESS', payload: response.user });
      return response;
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      dispatch({ type: 'LOGIN_FAIL', payload: message });
      throw error;
    }
  }, []);

  // Register action
  const register = useCallback(async (userData) => {
    dispatch({ type: 'REGISTER_START' });
    try {
      const response = await authService.register(userData);
      dispatch({ type: 'REGISTER_SUCCESS', payload: response.user });
      return response;
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      dispatch({ type: 'REGISTER_FAIL', payload: message });
      throw error;
    }
  }, []);

  // Logout action
  const logout = useCallback(() => {
    authService.logout();
    dispatch({ type: 'LOGOUT' });
  }, []);

  // Update profile action
  const updateProfile = useCallback(async (userData) => {
    try {
      const response = await authService.updateProfile(userData);
      dispatch({ type: 'UPDATE_PROFILE', payload: response.user });
      return response;
    } catch (error) {
      throw error;
    }
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  const value = {
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    error: state.error,
    login,
    register,
    logout,
    updateProfile,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
