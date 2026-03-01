import axios, { AxiosInstance } from "axios";
import type { CommitRequest, CommitResponse, LaunchContextDto } from "../types";
import type { EngineGateway } from "./EngineGateway";

export class EngineClient implements EngineGateway {
  private readonly http: AxiosInstance;

  constructor(engineBaseUrl: string) {
    this.http = axios.create({
      baseURL: engineBaseUrl,
      timeout: 30000
    });
  }

  async getLaunchContext(launchId: string, token: string): Promise<LaunchContextDto> {
    const response = await this.http.get<LaunchContextDto>(`/api/v1/launches/${launchId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  }

  async commit(launchId: string, token: string, payload: CommitRequest): Promise<CommitResponse> {
    const response = await this.http.post<CommitResponse>(`/api/v1/runtime/launches/${launchId}/commit`, payload, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  }

  async terminate(launchId: string, token: string): Promise<void> {
    await this.http.post(`/api/v1/launches/${launchId}/terminate`, {}, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  }
}
