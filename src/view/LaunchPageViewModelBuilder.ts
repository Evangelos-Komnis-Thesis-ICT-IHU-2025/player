import type { LaunchPageViewModel } from "./LaunchPageViewModel";

interface InitialPayload {
  launchId: string;
  attemptId: string;
  apiKind: "SCORM_12" | "SCORM_2004";
  token: string;
  commitIntervalMs: number;
}

export class LaunchPageViewModelBuilder {
  private courseTitle?: string;
  private userName?: string;
  private iframeSrc?: string;
  private initialPayload?: InitialPayload;

  course(title: string): this {
    this.courseTitle = title;
    return this;
  }

  learner(name: string): this {
    this.userName = name;
    return this;
  }

  iframe(src: string): this {
    this.iframeSrc = src;
    return this;
  }

  payload(payload: InitialPayload): this {
    this.initialPayload = payload;
    return this;
  }

  build(): LaunchPageViewModel {
    if (!this.courseTitle || !this.userName || !this.iframeSrc || !this.initialPayload) {
      throw new Error("LaunchPageViewModelBuilder requires courseTitle, userName, iframeSrc and initialPayload");
    }

    return {
      courseTitle: this.courseTitle,
      userName: this.userName,
      iframeSrc: this.iframeSrc,
      initialPayloadJson: JSON.stringify(this.initialPayload)
    };
  }
}
