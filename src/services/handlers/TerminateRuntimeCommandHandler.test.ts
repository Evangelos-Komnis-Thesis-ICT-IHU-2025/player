import test from "node:test";
import assert from "node:assert/strict";
import { LaunchSessionService } from "../LaunchSessionService";
import { TerminateRuntimeCommandHandler } from "./TerminateRuntimeCommandHandler";
import type { EngineGateway } from "../../adapters/EngineGateway";
import type { CommitRequest, CommitResponse, LaunchContextDto } from "../../types";

class FakeEngineGateway implements EngineGateway {
  public terminateCalls = 0;

  async getLaunchContext(): Promise<LaunchContextDto> {
    throw new Error("not implemented");
  }

  async commit(): Promise<CommitResponse> {
    throw new Error("not implemented");
  }

  async terminate(): Promise<void> {
    this.terminateCalls += 1;
  }
}

test("terminate handler is idempotent for already terminated session", async () => {
  const engine = new FakeEngineGateway();
  const sessions = new LaunchSessionService();
  sessions.registerLaunch({
    launchId: "launch-1",
    attemptId: "attempt-1",
    apiKind: "SCORM_12",
    entrypointPath: "index.html"
  });
  sessions.beginTermination("launch-1");
  sessions.markTerminated("launch-1");

  const handler = new TerminateRuntimeCommandHandler(engine, sessions);
  await handler.handle({ launchId: "launch-1", token: "token" });

  assert.equal(engine.terminateCalls, 0);
});

test("terminate handler calls engine and marks terminated when active", async () => {
  const engine = new FakeEngineGateway();
  const sessions = new LaunchSessionService();
  sessions.registerLaunch({
    launchId: "launch-2",
    attemptId: "attempt-2",
    apiKind: "SCORM_2004",
    entrypointPath: "index.html"
  });

  const handler = new TerminateRuntimeCommandHandler(engine, sessions);
  await handler.handle({ launchId: "launch-2", token: "token" });

  assert.equal(engine.terminateCalls, 1);
  assert.equal(sessions.getStatus("launch-2"), "TERMINATED");
});
