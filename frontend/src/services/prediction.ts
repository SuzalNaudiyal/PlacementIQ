import { apiClient } from './api';
import type {
  PredictionResponse,
  SimulationRequest,
  SimulationResponse,
  ModelInfoResponse,
} from '../types/prediction';

export const evaluatePlacement = async (): Promise<PredictionResponse> => {
  const response = await apiClient.get<PredictionResponse>('/prediction/evaluate');
  return response.data;
};

export const simulateWhatIfScenario = async (
  payload: SimulationRequest
): Promise<SimulationResponse> => {
  const response = await apiClient.post<SimulationResponse>('/prediction/simulate', payload);
  return response.data;
};

export const getModelInformation = async (): Promise<ModelInfoResponse> => {
  const response = await apiClient.get<ModelInfoResponse>('/prediction/model-info');
  return response.data;
};
