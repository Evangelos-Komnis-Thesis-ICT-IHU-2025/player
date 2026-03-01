import type { CommitRequest, CommitResponse, LaunchContextDto } from "../types";

export interface EngineGateway {
  getLaunchContext(launchId: string, token: string): Promise<LaunchContextDto>;
  commit(launchId: string, token: string, payload: CommitRequest): Promise<CommitResponse>;
  terminate(launchId: string, token: string): Promise<void>;
}
