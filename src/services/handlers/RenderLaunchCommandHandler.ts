import type { CommandHandler } from "../../common/command/CommandHandler";
import type { EngineGateway } from "../../adapters/EngineGateway";
import { mapLaunchContext } from "../../mappers/launchContextMapper";
import { ContentCacheService } from "../ContentCacheService";
import { type LaunchMeta, LaunchSessionService } from "../LaunchSessionService";
import { LaunchPageRenderer } from "../../view/LaunchPageRenderer";
import { LaunchPageViewModelBuilder } from "../../view/LaunchPageViewModelBuilder";

export interface RenderLaunchCommand {
  launchId: string;
  token: string;
  commitIntervalMs: number;
}

export class RenderLaunchCommandHandler implements CommandHandler<RenderLaunchCommand, Promise<string>> {
  private readonly engineClient: EngineGateway;
  private readonly contentCacheService: ContentCacheService;
  private readonly launchSessionService: LaunchSessionService;
  private readonly pageRenderer: LaunchPageRenderer;

  constructor(
    engineClient: EngineGateway,
    contentCacheService: ContentCacheService,
    launchSessionService: LaunchSessionService,
    pageRenderer: LaunchPageRenderer
  ) {
    this.engineClient = engineClient;
    this.contentCacheService = contentCacheService;
    this.launchSessionService = launchSessionService;
    this.pageRenderer = pageRenderer;
  }

  async handle(command: RenderLaunchCommand): Promise<string> {
    const context = await this.engineClient.getLaunchContext(command.launchId, command.token);
    const mapped = mapLaunchContext(context);

    await this.contentCacheService.ensureExtracted(mapped.launchId, mapped.courseId, mapped.contentUrl);

    const meta: LaunchMeta = {
      launchId: mapped.launchId,
      attemptId: mapped.attemptId,
      apiKind: mapped.apiKind,
      entrypointPath: mapped.entrypointPath
    };
    this.launchSessionService.registerLaunch(meta);

    const viewModel = new LaunchPageViewModelBuilder()
      .course(mapped.courseTitle)
      .learner(mapped.userName)
      .iframe(`/content/${mapped.launchId}/${mapped.entrypointPath}`)
      .payload({
        launchId: mapped.launchId,
        attemptId: mapped.attemptId,
        apiKind: mapped.apiKind,
        token: command.token,
        commitIntervalMs: command.commitIntervalMs
      })
      .build();

    return this.pageRenderer.render(viewModel);
  }
}
