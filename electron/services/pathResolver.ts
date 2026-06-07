import * as os from 'os';
import * as path from 'path';

export function resolveAppPath(...segments: string[]): string {
  // Mock logic to handle cross-platform path abstractions cleanly
  const base = process.env.NODE_ENV === 'development' 
    ? path.join(__dirname, '..', '..')
    : path.join(os.homedir(), '.stackly');
    
  return path.join(base, ...segments);
}

export function resolveUserPath(inputPath: string): string {
  if (inputPath.startsWith('~/')) {
    return path.join(os.homedir(), inputPath.slice(2));
  }
  return path.resolve(inputPath);
}
