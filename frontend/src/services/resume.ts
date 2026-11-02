import { apiClient } from './api';
import type { ParsedResumeResponse } from '../types/resume';

export const uploadResumeFile = async (
  file: File,
  applyToProfile: boolean = false
): Promise<ParsedResumeResponse> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await apiClient.post<ParsedResumeResponse>(
    `/resume/upload?apply_to_profile=${applyToProfile}`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  return response.data;
};

export const parseResumeText = async (
  text: string,
  applyToProfile: boolean = false
): Promise<ParsedResumeResponse> => {
  const response = await apiClient.post<ParsedResumeResponse>('/resume/parse-text', {
    text,
    apply_to_profile: applyToProfile,
  });
  return response.data;
};

export const getLatestResume = async (): Promise<any> => {
  const response = await apiClient.get('/resume/latest');
  return response.data;
};

export const downloadAtsResumePdf = async (filename?: string): Promise<void> => {
  const response = await apiClient.get('/resume/generate-ats-pdf', {
    responseType: 'blob',
  });
  const blob = new Blob([response.data], { type: 'application/pdf' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename || 'HireMatrix_ATS_Resume.pdf');
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

export const getAtsResumePreviewData = async (): Promise<any> => {
  const response = await apiClient.get('/resume/ats-preview-data');
  return response.data;
};
