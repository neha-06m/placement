import { apiClient } from './client';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

// Student Profile Services
export const getStudentProfile = async () => {
  return await apiClient('/students/profile/me', { method: 'GET' });
};

export const updateStudentProfile = async (profileData) => {
  return await apiClient('/students/profile/me', {
    method: 'PUT',
    body: JSON.stringify(profileData)
  });
};

export const uploadResume = async (file) => {
  const formData = new FormData();
  formData.append('resume', file);

  return await apiClient('/students/profile/resume', {
    method: 'POST',
    body: formData
  });
};

export const downloadResume = async (studentId = null) => {
  const token = localStorage.getItem('placemate_token');
  const endpoint = studentId
    ? `${BASE_URL}/students/${studentId}/resume`
    : `${BASE_URL}/students/profile/resume`;

  const response = await fetch(endpoint, {
    headers: {
      ...(token && { Authorization: `Bearer ${token}` })
    }
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.message || 'Failed to download resume');
  }

  const blob = await response.blob();
  const blobUrl = window.URL.createObjectURL(blob);
  const tempLink = document.createElement('a');
  tempLink.href = blobUrl;
  tempLink.download = 'resume.pdf';
  document.body.appendChild(tempLink);
  tempLink.click();
  document.body.removeChild(tempLink);
  window.URL.revokeObjectURL(blobUrl);
};

// Company Profile Services
export const getCompanyProfile = async () => {
  return await apiClient('/companies/profile/me', { method: 'GET' });
};

export const updateCompanyProfile = async (companyData) => {
  return await apiClient('/companies/profile/me', {
    method: 'PUT',
    body: JSON.stringify(companyData)
  });
};

export const getCompanyById = async (companyId) => {
  return await apiClient(`/companies/${companyId}`, { method: 'GET' });
};

// Admin Services
export const getAllCompanies = async (status = '') => {
  const query = status ? `?status=${encodeURIComponent(status)}` : '';
  return await apiClient(`/companies${query}`, { method: 'GET' });
};

export const verifyCompany = async (companyId, verificationStatus, adminFeedback = '') => {
  return await apiClient(`/companies/${companyId}/verification`, {
    method: 'PUT',
    body: JSON.stringify({ verificationStatus, adminFeedback })
  });
};
