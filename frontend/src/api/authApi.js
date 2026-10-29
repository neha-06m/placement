import { apiClient } from './client';

export const registerUser = async (userData) => {
  return await apiClient('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData)
  });
};

export const loginUser = async (credentials) => {
  return await apiClient('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials)
  });
};

export const getMe = async () => {
  return await apiClient('/auth/me', {
    method: 'GET'
  });
};

export const getStudentOverview = async () => {
  return await apiClient('/auth/student/overview', {
    method: 'GET'
  });
};

export const getCompanyOverview = async () => {
  return await apiClient('/auth/company/overview', {
    method: 'GET'
  });
};

export const getAdminOverview = async () => {
  return await apiClient('/auth/admin/overview', {
    method: 'GET'
  });
};

export const checkHealth = async () => {
  return await apiClient('/health', {
    method: 'GET'
  });
};
