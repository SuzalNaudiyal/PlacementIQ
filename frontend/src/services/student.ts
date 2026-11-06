import { apiClient } from './api';
import type { StudentProfile, StudentProfileUpdatePayload, SkillTaxonomy } from '../types/student';

export const getStudentProfile = async (): Promise<StudentProfile> => {
  const response = await apiClient.get<StudentProfile>('/student/profile');
  return response.data;
};

export const updateStudentProfile = async (
  payload: StudentProfileUpdatePayload
): Promise<StudentProfile> => {
  const response = await apiClient.put<StudentProfile>('/student/profile', payload);
  return response.data;
};

export const getSkillTaxonomy = async (): Promise<SkillTaxonomy> => {
  const response = await apiClient.get<SkillTaxonomy>('/student/taxonomy');
  return response.data;
};

export const downloadPlacementReportPdf = async (studentName: string = 'Candidate'): Promise<void> => {
  const response = await apiClient.get('/student/placement-report/pdf', {
    responseType: 'blob',
  });
  const blob = new Blob([response.data], { type: 'application/pdf' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  const cleanName = studentName.trim().replace(/\s+/g, '_');
  link.setAttribute('download', `HireMatrix_Placement_Dossier_${cleanName}.pdf`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};
