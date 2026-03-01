export type LearningStandard = "SCORM_12" | "SCORM_2004";

export interface LaunchContextDto {
  launchId: string;
  attemptId: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  course: {
    id: string;
    title: string;
    standard: LearningStandard;
  };
  player: {
    apiKind: LearningStandard;
    contentSource: {
      type: string;
      url: string;
    };
    entrypointPath: string;
  };
  runtime: {
    initialNormalizedState: Record<string, unknown>;
  };
}

export interface CommitRequest {
  sequence: number;
  clientTime: string;
  apiKind: LearningStandard;
  payload: Record<string, unknown>;
}

export interface CommitResponse {
  launchId: string;
  attemptId: string;
  acceptedSequence: number;
  normalizedProgress: Record<string, unknown>;
}
