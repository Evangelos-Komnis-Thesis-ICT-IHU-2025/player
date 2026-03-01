import test from "node:test";
import assert from "node:assert/strict";
import {
  assertLaunchSessionStatusTransition,
  canTransitionLaunchSessionStatus
} from "./LaunchSessionStatus";

test("ACTIVE allows termination transitions", () => {
  assert.equal(canTransitionLaunchSessionStatus("ACTIVE", "TERMINATING"), true);
  assert.equal(canTransitionLaunchSessionStatus("ACTIVE", "TERMINATED"), true);
});

test("TERMINATED is idempotent only", () => {
  assert.equal(canTransitionLaunchSessionStatus("TERMINATED", "TERMINATED"), true);
  assert.equal(canTransitionLaunchSessionStatus("TERMINATED", "ACTIVE"), false);
});

test("assert transition throws on invalid move", () => {
  assert.throws(() => assertLaunchSessionStatusTransition("TERMINATED", "TERMINATING"));
});
