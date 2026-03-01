export type LaunchSessionStatus = "ACTIVE" | "TERMINATING" | "TERMINATED";

const allowedTransitions: Record<LaunchSessionStatus, readonly LaunchSessionStatus[]> = {
  ACTIVE: ["ACTIVE", "TERMINATING", "TERMINATED"],
  TERMINATING: ["TERMINATING", "TERMINATED"],
  TERMINATED: ["TERMINATED"]
};

export function canTransitionLaunchSessionStatus(
  current: LaunchSessionStatus,
  next: LaunchSessionStatus
): boolean {
  return allowedTransitions[current].includes(next);
}

export function assertLaunchSessionStatusTransition(
  current: LaunchSessionStatus,
  next: LaunchSessionStatus
): void {
  if (!canTransitionLaunchSessionStatus(current, next)) {
    throw new Error(`Invalid launch session status transition from ${current} to ${next}`);
  }
}
