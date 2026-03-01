import test from "node:test";
import assert from "node:assert/strict";
import { LaunchPageViewModelBuilder } from "./LaunchPageViewModelBuilder";

test("builder creates launch page view model", () => {
  const model = new LaunchPageViewModelBuilder()
    .course("Course A")
    .learner("Learner A")
    .iframe("/content/launch-1/index.html")
    .payload({
      launchId: "launch-1",
      attemptId: "attempt-1",
      apiKind: "SCORM_12",
      token: "jwt-token",
      commitIntervalMs: 15000
    })
    .build();

  assert.equal(model.courseTitle, "Course A");
  assert.equal(model.userName, "Learner A");
  assert.equal(model.iframeSrc, "/content/launch-1/index.html");
  assert.equal(typeof model.initialPayloadJson, "string");
});

test("builder throws when required fields are missing", () => {
  assert.throws(() => new LaunchPageViewModelBuilder().build());
});
