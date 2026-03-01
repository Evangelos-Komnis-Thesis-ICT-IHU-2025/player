import type { CommitRequest, CommitResponse } from "../types";
import {
  CommitRuntimeCommandHandler,
  type CommitRuntimeCommand
} from "./handlers/CommitRuntimeCommandHandler";
import {
  TerminateRuntimeCommandHandler,
  type TerminateRuntimeCommand
} from "./handlers/TerminateRuntimeCommandHandler";

export class RuntimeCommitService {
  private readonly commitRuntimeCommandHandler: CommitRuntimeCommandHandler;
  private readonly terminateRuntimeCommandHandler: TerminateRuntimeCommandHandler;

  constructor(
    commitRuntimeCommandHandler: CommitRuntimeCommandHandler,
    terminateRuntimeCommandHandler: TerminateRuntimeCommandHandler
  ) {
    this.commitRuntimeCommandHandler = commitRuntimeCommandHandler;
    this.terminateRuntimeCommandHandler = terminateRuntimeCommandHandler;
  }

  async commit(launchId: string, token: string, payload: CommitRequest): Promise<CommitResponse> {
    const command: CommitRuntimeCommand = { launchId, token, payload };
    return this.commitRuntimeCommandHandler.handle(command);
  }

  async terminate(launchId: string, token: string): Promise<void> {
    const command: TerminateRuntimeCommand = { launchId, token };
    await this.terminateRuntimeCommandHandler.handle(command);
  }
}
