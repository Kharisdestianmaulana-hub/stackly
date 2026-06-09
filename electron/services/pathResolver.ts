import * as os from 'os';
import * as path from 'path';
import { app } from 'electron';

export function resolveAppPath(...segments: string[]): string {
  const base = app.isPackaged ? process.resourcesPath : app.getAppPath();
  return path.join(base, ...segments);
}

export function resolveUserPath(inputPath: string): string {
  if (inputPath.startsWith('~/')) {
    return path.join(os.homedir(), inputPath.slice(2));
  }
  return path.resolve(inputPath);
}
