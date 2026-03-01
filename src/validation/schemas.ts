import { z } from "zod";

export const commitSchema = z.object({
  sequence: z.number().int().nonnegative(),
  clientTime: z.string().datetime(),
  apiKind: z.enum(["SCORM_12", "SCORM_2004"]),
  payload: z.record(z.union([z.string(), z.number(), z.boolean(), z.null()]))
});

export type CommitSchema = z.infer<typeof commitSchema>;
