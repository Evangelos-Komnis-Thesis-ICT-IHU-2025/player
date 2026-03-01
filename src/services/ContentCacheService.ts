import fs from "node:fs";
import path from "node:path";
import axios from "axios";
import AdmZip from "adm-zip";

export class ContentCacheService {
  private readonly cacheDir: string;
  private readonly launchDirMap = new Map<string, string>();

  constructor(cacheDir: string) {
    this.cacheDir = cacheDir;
    fs.mkdirSync(this.cacheDir, { recursive: true });
  }

  async ensureExtracted(launchId: string, courseId: string, zipUrl: string): Promise<string> {
    const existingDir = this.launchDirMap.get(launchId);
    if (existingDir && fs.existsSync(existingDir)) {
      return existingDir;
    }

    const launchDir = path.join(this.cacheDir, courseId, launchId);
    const markerFile = path.join(launchDir, ".ready");

    if (!fs.existsSync(markerFile)) {
      fs.mkdirSync(launchDir, { recursive: true });
      const response = await axios.get<ArrayBuffer>(zipUrl, { responseType: "arraybuffer", timeout: 60000 });
      const zip = new AdmZip(Buffer.from(response.data));
      zip.extractAllTo(launchDir, true);
      fs.writeFileSync(markerFile, new Date().toISOString(), { encoding: "utf8" });
    }

    this.launchDirMap.set(launchId, launchDir);
    return launchDir;
  }

  resolveFile(launchId: string, relativePath: string): string | null {
    const launchDir = this.launchDirMap.get(launchId);
    if (!launchDir) {
      return null;
    }

    const clean = path.posix.normalize(relativePath).replace(/^\/+/, "");
    const absolute = path.resolve(path.join(launchDir, clean));
    const launchAbsolute = path.resolve(launchDir);
    if (!absolute.startsWith(launchAbsolute)) {
      return null;
    }
    return absolute;
  }

  getLaunchDir(launchId: string): string | null {
    return this.launchDirMap.get(launchId) ?? null;
  }
}
