import { apiClient } from './api';
import type { CompanyCheatSheet } from '../types/companyPrep';

export const getAllCompanyPrepSheets = async (): Promise<CompanyCheatSheet[]> => {
  const response = await apiClient.get<CompanyCheatSheet[]>('/company-prep');
  return response.data;
};

export const getCompanyPrepDetail = async (companyId: string): Promise<CompanyCheatSheet> => {
  const response = await apiClient.get<CompanyCheatSheet>(`/company-prep/${companyId}`);
  return response.data;
};

