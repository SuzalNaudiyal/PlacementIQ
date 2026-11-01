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
