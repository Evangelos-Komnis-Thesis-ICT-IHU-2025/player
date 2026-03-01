import test from "node:test";
import assert from "node:assert/strict";
import { LaunchSessionService } from "./LaunchSessionService";

const launchId = "launch-1";

test("registerLaunch stores metadata and ACTIVE status", () => {
  const service = new LaunchSessionService();
  service.registerLaunch({
    launchId,
    attemptId: "attempt-1",
    apiKind: "SCORM_12",
    entrypointPath: "index.html"
  });

  assert.equal(service.getStatus(launchId), "ACTIVE");
  assert.equal(service.getMeta(launchId)?.attemptId, "attempt-1");
});

test("beginTermination transitions ACTIVE to TERMINATING", () => {
  const service = new LaunchSessionService();
  service.registerLaunch({
    launchId,
    attemptId: "attempt-1",
    apiKind: "SCORM_12",
    entrypointPath: "index.html"
  });

  assert.equal(service.beginTermination(launchId), "STARTED");
  assert.equal(service.getStatus(launchId), "TERMINATING");
});

test("markTerminated transitions to TERMINATED", () => {
  const service = new LaunchSessionService();
  service.registerLaunch({
    launchId,
    attemptId: "attempt-1",
    apiKind: "SCORM_2004",
    entrypointPath: "index.html"
  });
  service.beginTermination(launchId);
  service.markTerminated(launchId);

  assert.equal(service.getStatus(launchId), "TERMINATED");
  assert.equal(service.beginTermination(launchId), "ALREADY_TERMINATED");
});
