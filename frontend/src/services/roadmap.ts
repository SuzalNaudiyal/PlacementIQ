import { apiClient } from './api';
import type {
  RoadmapResponse,
  GenerateRoadmapRequest,
  ToggleTaskRequest,
} from '../types/roadmap';

export const roadmapService = {
  async getRoadmap(): Promise<RoadmapResponse> {
    const res = await apiClient.get<RoadmapResponse>('/roadmap');
    return res.data;
  },

  async generateRoadmap(data: GenerateRoadmapRequest): Promise<RoadmapResponse> {
    const res = await apiClient.post<RoadmapResponse>('/roadmap/generate', data);
    return res.data;
  },

  async toggleTask(data: ToggleTaskRequest): Promise<RoadmapResponse> {
    const res = await apiClient.put<RoadmapResponse>('/roadmap/task/toggle', data);
    return res.data;
  },
};
