import type { CommandHandler } from "../../common/command/CommandHandler";
import type { EngineGateway } from "../../adapters/EngineGateway";
import { LaunchSessionService } from "../LaunchSessionService";

export interface TerminateRuntimeCommand {
  launchId: string;
  token: string;
}

export class TerminateRuntimeCommandHandler implements CommandHandler<TerminateRuntimeCommand, Promise<void>> {
  private readonly engineClient: EngineGateway;
  private readonly launchSessionService: LaunchSessionService;

  constructor(engineClient: EngineGateway, launchSessionService: LaunchSessionService) {
    this.engineClient = engineClient;
    this.launchSessionService = launchSessionService;
  }

  async handle(command: TerminateRuntimeCommand): Promise<void> {
    const beginResult = this.launchSessionService.beginTermination(command.launchId);
    if (beginResult === "ALREADY_TERMINATED" || beginResult === "ALREADY_TERMINATING") {
      return;
    }

    await this.engineClient.terminate(command.launchId, command.token);
    this.launchSessionService.markTerminated(command.launchId);
  }
}
