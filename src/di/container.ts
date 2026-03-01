import { asFunction, asValue, createContainer, InjectionMode, Lifetime } from "awilix";
import { loadConfig } from "../config";
import { EngineClient } from "../adapters/EngineClient";
import { ObservedEngineClient } from "../adapters/ObservedEngineClient";
import { ContentCacheService } from "../services/ContentCacheService";
import { LaunchService } from "../services/LaunchService";
import { LaunchSessionService } from "../services/LaunchSessionService";
import { RuntimeCommitService } from "../services/RuntimeCommitService";
import { LaunchPageRenderer } from "../view/LaunchPageRenderer";
import { RenderLaunchCommandHandler } from "../services/handlers/RenderLaunchCommandHandler";
import { CommitRuntimeCommandHandler } from "../services/handlers/CommitRuntimeCommandHandler";
import { TerminateRuntimeCommandHandler } from "../services/handlers/TerminateRuntimeCommandHandler";

export function buildContainer() {
  const config = loadConfig();

  const container = createContainer({
    injectionMode: InjectionMode.PROXY
  });

  container.register({
    config: asValue(config),
    rawEngineClient: asFunction(({ config: cfg }: any) => new EngineClient(cfg.engineBaseUrl), {
      lifetime: Lifetime.SINGLETON
    }),
    engineClient: asFunction(({ rawEngineClient }: any) => new ObservedEngineClient(rawEngineClient), {
      lifetime: Lifetime.SINGLETON
    }),
    contentCacheService: asFunction(({ config: cfg }: any) => new ContentCacheService(cfg.cacheDir), {
      lifetime: Lifetime.SINGLETON
    }),
    launchSessionService: asFunction(() => new LaunchSessionService(), {
      lifetime: Lifetime.SINGLETON
    }),
    launchPageRenderer: asFunction(() => new LaunchPageRenderer(), {
      lifetime: Lifetime.SINGLETON
    }),
    renderLaunchCommandHandler: asFunction(
      ({ engineClient, contentCacheService, launchSessionService, launchPageRenderer }: any) =>
        new RenderLaunchCommandHandler(engineClient, contentCacheService, launchSessionService, launchPageRenderer),
      { lifetime: Lifetime.SINGLETON }
    ),
    commitRuntimeCommandHandler: asFunction(
      ({ engineClient }: any) => new CommitRuntimeCommandHandler(engineClient),
      { lifetime: Lifetime.SINGLETON }
    ),
    terminateRuntimeCommandHandler: asFunction(
      ({ engineClient, launchSessionService }: any) =>
        new TerminateRuntimeCommandHandler(engineClient, launchSessionService),
      { lifetime: Lifetime.SINGLETON }
    ),
    launchService: asFunction(
      ({ contentCacheService, launchSessionService, renderLaunchCommandHandler, config: cfg }: any) =>
        new LaunchService(contentCacheService, launchSessionService, renderLaunchCommandHandler, cfg.commitIntervalMs),
      { lifetime: Lifetime.SINGLETON }
    ),
    runtimeCommitService: asFunction(
      ({ commitRuntimeCommandHandler, terminateRuntimeCommandHandler }: any) =>
        new RuntimeCommitService(commitRuntimeCommandHandler, terminateRuntimeCommandHandler),
      { lifetime: Lifetime.SINGLETON }
    )
  });

  return container;
}
