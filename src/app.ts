import path from "node:path";
import express, { type Request, type Response, type NextFunction } from "express";
import pino from "pino";
import pinoHttp from "pino-http";
import type { AwilixContainer } from "awilix";
import { buildHealthRoute } from "./routes/healthRoute";
import { buildLaunchRoute } from "./routes/launchRoute";
import { buildInternalRuntimeRoute } from "./routes/internalRuntimeRoute";
import { LaunchService } from "./services/LaunchService";
import { RuntimeCommitService } from "./services/RuntimeCommitService";

const logger = pino({ level: process.env.LOG_LEVEL ?? "info" });

export function buildApp(container: AwilixContainer): express.Express {
  const app = express();

  app.use(pinoHttp({ logger }));
  app.use(express.json({ limit: "2mb" }));
  app.use(express.text({ type: "text/plain", limit: "2mb" }));

  app.use("/libs/scorm-api-1.2", express.static(path.resolve(process.cwd(), "libs/scorm-api-1.2")));
  app.use("/libs/scorm-api-2004", express.static(path.resolve(process.cwd(), "libs/scorm-api-2004")));

  app.get("/", (_req, res) => {
    res.status(200).type("html").send("<h1>SCORM Player</h1><p>Use /launch/{launchId}?token=...</p>");
  });

  app.use(buildHealthRoute());
  app.use(buildLaunchRoute({ launchService: container.resolve<LaunchService>("launchService") }));
  app.use(
    buildInternalRuntimeRoute({
      runtimeCommitService: container.resolve<RuntimeCommitService>("runtimeCommitService")
    })
  );

  app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
    const message = error instanceof Error ? error.message : "Unexpected error";
    logger.error({ err: error }, "request_failed");
    res.status(500).json({ error: { code: "INTERNAL_ERROR", message } });
  });

  return app;
}
