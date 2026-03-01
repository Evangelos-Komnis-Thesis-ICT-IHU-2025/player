import { Router } from "express";
import path from "node:path";
import { LaunchService } from "../services/LaunchService";

interface LaunchRouteDeps {
  launchService: LaunchService;
}

export function buildLaunchRoute({ launchService }: LaunchRouteDeps): Router {
  const router = Router();

  router.get("/launch/:launchId", async (req, res, next) => {
    try {
      const token = String(req.query.token ?? "").trim();
      if (!token) {
        res.status(400).json({ error: { code: "TOKEN_REQUIRED", message: "token query parameter is required" } });
        return;
      }

      const html = await launchService.renderLaunch({
        launchId: req.params.launchId,
        token
      });

      res.status(200).type("html").send(html);
    } catch (error) {
      next(error);
    }
  });

  router.get("/content/:launchId/*", (req, res) => {
    const params = req.params as unknown as Record<string, string | string[] | undefined>;
    const wildcardPath = params["0"] ?? params.path ?? params["path(*)"] ?? params[""];
    const relativePath = Array.isArray(wildcardPath)
      ? wildcardPath.join("/")
      : typeof wildcardPath === "string"
        ? wildcardPath
        : "";
    const resolved = launchService.resolveContentFile(req.params.launchId, relativePath);
    if (!resolved) {
      res.status(404).json({ error: { code: "CONTENT_NOT_FOUND", message: "Content file not found" } });
      return;
    }

    res.sendFile(path.resolve(resolved));
  });

  return router;
}
