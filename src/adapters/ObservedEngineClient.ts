import pino from "pino";
import type { CommitRequest, CommitResponse, LaunchContextDto } from "../types";
import type { EngineGateway } from "./EngineGateway";

const logger = pino({ level: process.env.LOG_LEVEL ?? "info" }).child({ component: "ObservedEngineClient" });

export class ObservedEngineClient implements EngineGateway {
  private readonly delegate: EngineGateway;

  constructor(delegate: EngineGateway) {
    this.delegate = delegate;
  }

  async getLaunchContext(launchId: string, token: string): Promise<LaunchContextDto> {
    return this.observe("getLaunchContext", () => this.delegate.getLaunchContext(launchId, token));
  }

  async commit(launchId: string, token: string, payload: CommitRequest): Promise<CommitResponse> {
    return this.observe("commit", () => this.delegate.commit(launchId, token, payload));
  }

  async terminate(launchId: string, token: string): Promise<void> {
    await this.observe("terminate", () => this.delegate.terminate(launchId, token));
  }

  private async observe<T>(operation: string, fn: () => Promise<T>): Promise<T> {
    const startedAt = Date.now();
    try {
      const result = await fn();
      logger.debug({ operation, durationMs: Date.now() - startedAt }, "engine_client_operation_succeeded");
      return result;
    } catch (error) {
      logger.warn({ operation, durationMs: Date.now() - startedAt, err: error }, "engine_client_operation_failed");
      throw error;
    }
  }
}
