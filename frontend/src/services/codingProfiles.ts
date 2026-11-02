import { apiClient } from './api';
import type {
  CodingProfileResponse,
  CodingProfileVerifyPayload,
} from '../types/codingProfiles';

export const verifyCodingProfiles = async (
  payload: CodingProfileVerifyPayload
): Promise<CodingProfileResponse> => {
  const response = await apiClient.post<CodingProfileResponse>(
    '/coding-profiles/verify',
    payload
  );
  return response.data;
};

export const getMyCodingProfiles = async (): Promise<CodingProfileResponse> => {
  const response = await apiClient.get<CodingProfileResponse>(
    '/coding-profiles/me'
  );
  return response.data;
};

