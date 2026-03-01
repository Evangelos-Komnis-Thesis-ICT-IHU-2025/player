import path from "node:path";
import type { LaunchContextDto } from "../types";

export interface LaunchContextModel {
  launchId: string;
  attemptId: string;
  courseId: string;
  apiKind: "SCORM_12" | "SCORM_2004";
  contentUrl: string;
  entrypointPath: string;
  userName: string;
  courseTitle: string;
}

export function mapLaunchContext(input: LaunchContextDto): LaunchContextModel {
  const entrypointPath = path.posix.normalize(input.player.entrypointPath).replace(/^\/+/, "");
  return {
    launchId: input.launchId,
    attemptId: input.attemptId,
    courseId: input.course.id,
    apiKind: input.player.apiKind,
    contentUrl: input.player.contentSource.url,
    entrypointPath,
    userName: input.user.name,
    courseTitle: input.course.title
  };
}
