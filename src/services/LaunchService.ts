import fs from "node:fs";
import { ContentCacheService } from "./ContentCacheService";
import { type LaunchMeta, LaunchSessionService } from "./LaunchSessionService";
import {
  type RenderLaunchCommand,
  RenderLaunchCommandHandler
} from "./handlers/RenderLaunchCommandHandler";

interface RenderLaunchInput {
  launchId: string;
  token: string;
}

export class LaunchService {
  private readonly contentCacheService: ContentCacheService;
  private readonly launchSessionService: LaunchSessionService;
  private readonly renderLaunchCommandHandler: RenderLaunchCommandHandler;
  private readonly commitIntervalMs: number;

  constructor(
    contentCacheService: ContentCacheService,
    launchSessionService: LaunchSessionService,
    renderLaunchCommandHandler: RenderLaunchCommandHandler,
    commitIntervalMs: number
  ) {
    this.contentCacheService = contentCacheService;
    this.launchSessionService = launchSessionService;
    this.renderLaunchCommandHandler = renderLaunchCommandHandler;
    this.commitIntervalMs = commitIntervalMs;
  }

  async renderLaunch(input: RenderLaunchInput): Promise<string> {
    const command: RenderLaunchCommand = {
      launchId: input.launchId,
      token: input.token,
      commitIntervalMs: this.commitIntervalMs
    };
    return this.renderLaunchCommandHandler.handle(command);
  }

  resolveContentFile(launchId: string, relativePath: string): string | null {
    const file = this.contentCacheService.resolveFile(launchId, relativePath);
    if (!file || !fs.existsSync(file)) {
      return null;
    }
    return file;
  }

  getLaunchMeta(launchId: string): LaunchMeta | null {
    return this.launchSessionService.getMeta(launchId);
  }
}
