import { apiClient } from './api';
import type {
  PlacementDrive,
  StudentDriveEligibility,
  CreatePlacementDrivePayload,
  RosterIngestionReport,
} from '../types/erp';

export const erpService = {
  async getDrives(): Promise<PlacementDrive[]> {
    const res = await apiClient.get<PlacementDrive[]>('/erp/drives');
    return res.data;
  },

  async getStudentDrives(): Promise<StudentDriveEligibility[]> {
    const res = await apiClient.get<StudentDriveEligibility[]>('/erp/student-drives');
    return res.data;
  },

  async createDrive(data: CreatePlacementDrivePayload): Promise<PlacementDrive> {
    const res = await apiClient.post<PlacementDrive>('/erp/drives', data);
    return res.data;
  },

  async applyToDrive(driveId: string): Promise<{ status: string; message: string; application_id?: string }> {
    const res = await apiClient.post('/erp/drives/apply', { drive_id: driveId });
    return res.data;
  },

  async uploadRosterCsv(file: File): Promise<RosterIngestionReport> {
    const formData = new FormData();
    formData.append('file', file);
    const res = await apiClient.post<RosterIngestionReport>('/erp/roster/upload-csv', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },

  async downloadTemplate(): Promise<string> {
    const res = await apiClient.get<string>('/erp/template', { responseType: 'text' as any });
    return res.data;
  },

  async exportShortlistCsv(driveId: string): Promise<string> {
    const res = await apiClient.get<string>(`/erp/drives/${driveId}/shortlist-csv`, { responseType: 'text' as any });
    return res.data;
  },
};
