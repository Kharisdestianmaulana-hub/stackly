import * as os from 'os';

export function getPlatform(): 'mac' | 'linux' | 'windows' | 'unknown' {
  const platform = os.platform();
  if (platform === 'darwin') return 'mac';
  if (platform === 'linux') return 'linux';
  if (platform === 'win32') return 'windows';
  return 'unknown';
}

export function isMac(): boolean {
  return getPlatform() === 'mac';
}

export function isLinux(): boolean {
  return getPlatform() === 'linux';
}
