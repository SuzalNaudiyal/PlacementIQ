import { apiClient } from './api';
import type {
  PlacementDrive,
  StudentDriveEligibility,
  CreatePlacementDrivePayload,
  RosterIngestionReport,
  DriveEligibleCandidatesResponse,
  StudentApplicationDetail,
  DispatchLog,
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

  async updateDrive(driveId: string, data: Partial<CreatePlacementDrivePayload>): Promise<PlacementDrive> {
    const res = await apiClient.put<PlacementDrive>(`/erp/drives/${driveId}`, data);
    return res.data;
  },

  async deleteDrive(driveId: string): Promise<{ status: string; message: string }> {
    const res = await apiClient.delete<{ status: string; message: string }>(`/erp/drives/${driveId}`);
    return res.data;
  },

  async getEligibleCandidates(driveId: string): Promise<DriveEligibleCandidatesResponse> {
    const res = await apiClient.get<DriveEligibleCandidatesResponse>(`/erp/drives/${driveId}/eligible-candidates`);
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

  async exportShortlistCsv(driveId: string, scope: 'eligible' | 'applied' = 'eligible'): Promise<string> {
    const res = await apiClient.get<string>(`/erp/drives/${driveId}/shortlist-csv?scope=${scope}`, { responseType: 'text' as any });
    return res.data;
  },

  async getDriveAlerts(driveId: string): Promise<any> {
    const res = await apiClient.get(`/erp/drives/${driveId}/alerts`);
    return res.data;
  },

  async dispatchTestAlert(driveId: string, channel: 'whatsapp' | 'email' | 'all' = 'whatsapp'): Promise<any> {
    const res = await apiClient.post('/erp/alerts/send-test', { drive_id: driveId, channel });
    return res.data;
  },

  async getAlertPreferences(): Promise<any> {
    const res = await apiClient.get('/erp/alerts/preferences');
    return res.data;
  },

  async updateAlertPreferences(prefs: any): Promise<any> {
    const res = await apiClient.put('/erp/alerts/preferences', prefs);
    return res.data;
  },

  async getMyApplications(): Promise<StudentApplicationDetail[]> {
    const res = await apiClient.get<StudentApplicationDetail[]>('/erp/my-applications');
    return res.data;
  },

  async updateApplicationStatus(
    applicationId: string,
    data: { status: string; notes?: string; interview_date?: string }
  ): Promise<{ status: string; message: string }> {
    const res = await apiClient.patch(`/erp/applications/${applicationId}/status`, data);
    return res.data;
  },

  async dispatchBroadcast(
    driveId: string,
    payload?: { channel?: 'whatsapp' | 'email' | 'all'; note?: string }
  ): Promise<any> {
    const res = await apiClient.post(`/erp/drives/${driveId}/broadcast-dispatch`, payload || {});
    return res.data;
  },

  async getDispatchLogs(): Promise<DispatchLog[]> {
    const res = await apiClient.get<DispatchLog[]>('/erp/dispatch-logs');
    return res.data;
  },
};
