import { Router } from "express";
import { RuntimeCommitService } from "../services/RuntimeCommitService";
import { commitSchema } from "../validation/schemas";

interface InternalRuntimeRouteDeps {
  runtimeCommitService: RuntimeCommitService;
}

export function buildInternalRuntimeRoute({ runtimeCommitService }: InternalRuntimeRouteDeps): Router {
  const router = Router();

  router.post("/internal/launch/:launchId/commit", async (req, res, next) => {
    try {
      const token = String(req.query.token ?? "").trim();
      if (!token) {
        res.status(400).json({ error: { code: "TOKEN_REQUIRED", message: "token query parameter is required" } });
        return;
      }

      const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
      const parsed = commitSchema.safeParse(body);
      if (!parsed.success) {
        res.status(400).json({ error: { code: "VALIDATION_ERROR", message: parsed.error.flatten() } });
        return;
      }

      const response = await runtimeCommitService.commit(req.params.launchId, token, parsed.data);
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  });

  router.post("/internal/launch/:launchId/terminate", async (req, res, next) => {
    try {
      const token = String(req.query.token ?? "").trim();
      if (!token) {
        res.status(400).json({ error: { code: "TOKEN_REQUIRED", message: "token query parameter is required" } });
        return;
      }

      await runtimeCommitService.terminate(req.params.launchId, token);
      res.status(200).json({ launchId: req.params.launchId, status: "TERMINATED" });
    } catch (error) {
      next(error);
    }
  });

  return router;
}
