import { Router } from "express";

export function buildHealthRoute(): Router {
  const router = Router();

  router.get("/health", (_req, res) => {
    res.status(200).json({ status: "UP" });
  });

  return router;
}
