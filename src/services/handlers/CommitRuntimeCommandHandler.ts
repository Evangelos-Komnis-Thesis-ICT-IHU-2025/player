import type { CommandHandler } from "../../common/command/CommandHandler";
import type { EngineGateway } from "../../adapters/EngineGateway";
import type { CommitRequest, CommitResponse } from "../../types";

export interface CommitRuntimeCommand {
  launchId: string;
  token: string;
  payload: CommitRequest;
}

export class CommitRuntimeCommandHandler implements CommandHandler<CommitRuntimeCommand, Promise<CommitResponse>> {
  private readonly engineClient: EngineGateway;

  constructor(engineClient: EngineGateway) {
    this.engineClient = engineClient;
  }

  handle(command: CommitRuntimeCommand): Promise<CommitResponse> {
    return this.engineClient.commit(command.launchId, command.token, command.payload);
  }
}
