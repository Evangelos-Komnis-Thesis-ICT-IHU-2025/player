import {
  type LaunchSessionStatus,
  assertLaunchSessionStatusTransition
} from "../domain/session/LaunchSessionStatus";

export interface LaunchMeta {
  launchId: string;
  attemptId: string;
  apiKind: "SCORM_12" | "SCORM_2004";
  entrypointPath: string;
}

interface LaunchSessionEntry {
  meta: LaunchMeta;
  status: LaunchSessionStatus;
}

export type BeginTerminationResult = "STARTED" | "ALREADY_TERMINATING" | "ALREADY_TERMINATED" | "UNKNOWN";

export class LaunchSessionService {
  private readonly sessions = new Map<string, LaunchSessionEntry>();

  registerLaunch(meta: LaunchMeta): void {
    const existing = this.sessions.get(meta.launchId);
    if (!existing) {
      this.sessions.set(meta.launchId, { meta, status: "ACTIVE" });
      return;
    }

    // Keep latest metadata but preserve lifecycle progression.
    this.sessions.set(meta.launchId, { meta, status: existing.status });
  }

  getMeta(launchId: string): LaunchMeta | null {
    return this.sessions.get(launchId)?.meta ?? null;
  }

  getStatus(launchId: string): LaunchSessionStatus | null {
    return this.sessions.get(launchId)?.status ?? null;
  }

  beginTermination(launchId: string): BeginTerminationResult {
    const existing = this.sessions.get(launchId);
    if (!existing) {
      return "UNKNOWN";
    }
    if (existing.status === "TERMINATED") {
      return "ALREADY_TERMINATED";
    }
    if (existing.status === "TERMINATING") {
      return "ALREADY_TERMINATING";
    }

    assertLaunchSessionStatusTransition(existing.status, "TERMINATING");
    this.sessions.set(launchId, { ...existing, status: "TERMINATING" });
    return "STARTED";
  }

  markTerminated(launchId: string): void {
    const existing = this.sessions.get(launchId);
    if (!existing) {
      return;
    }

    assertLaunchSessionStatusTransition(existing.status, "TERMINATED");
    this.sessions.set(launchId, { ...existing, status: "TERMINATED" });
  }
}
