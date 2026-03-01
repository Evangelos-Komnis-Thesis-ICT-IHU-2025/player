import test from "node:test";
import assert from "node:assert/strict";
import { ObservedEngineClient } from "./ObservedEngineClient";
import type { EngineGateway } from "./EngineGateway";
import type { CommitRequest, CommitResponse, LaunchContextDto } from "../types";

class FakeEngineGateway implements EngineGateway {
  public commits = 0;
  public terminations = 0;

  async getLaunchContext(launchId: string): Promise<LaunchContextDto> {
    return {
      launchId,
      attemptId: "attempt-1",
      user: { id: "user-1", name: "Learner", email: "learner@example.com" },
      course: { id: "course-1", title: "Course", standard: "SCORM_12" },
      player: {
        apiKind: "SCORM_12",
        contentSource: { type: "MINIO", url: "https://example.com/course.zip" },
        entrypointPath: "index_lms.html"
      },
      runtime: { initialNormalizedState: {} }
    };
  }

  async commit(_launchId: string, _token: string, _payload: CommitRequest): Promise<CommitResponse> {
    this.commits += 1;
    return {
      launchId: "launch-1",
      attemptId: "attempt-1",
      acceptedSequence: 1,
      normalizedProgress: {}
    };
  }

  async terminate(): Promise<void> {
    this.terminations += 1;
  }
}

test("observed client delegates getLaunchContext", async () => {
  const delegate = new FakeEngineGateway();
  const client = new ObservedEngineClient(delegate);

  const response = await client.getLaunchContext("launch-1", "token");
  assert.equal(response.launchId, "launch-1");
});

test("observed client delegates commit and terminate", async () => {
  const delegate = new FakeEngineGateway();
  const client = new ObservedEngineClient(delegate);

  await client.commit("launch-1", "token", {
    sequence: 1,
    clientTime: new Date().toISOString(),
    apiKind: "SCORM_12",
    payload: {}
  });
  await client.terminate("launch-1", "token");

  assert.equal(delegate.commits, 1);
  assert.equal(delegate.terminations, 1);
});
