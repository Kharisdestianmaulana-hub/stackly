import * as fs from 'fs';
import * as path from 'path';
import { app } from 'electron';

const configDir = path.join(app.getPath('userData'), 'config');

export function updateApachePort(newPort: number): boolean {
  try {
    const configPath = path.join(configDir, 'apache', 'httpd.conf');
    if (!fs.existsSync(configPath)) return false;

    let content = fs.readFileSync(configPath, 'utf8');
    // Replace Listen port
    content = content.replace(/Listen\s+\d+/g, `Listen ${newPort}`);
    // Replace ServerName port if exists
    content = content.replace(/ServerName\s+localhost:\d+/g, `ServerName localhost:${newPort}`);
    content = content.replace(/ServerName\s+127\.0\.0\.1:\d+/g, `ServerName 127.0.0.1:${newPort}`);

    fs.writeFileSync(configPath, content, 'utf8');
    return true;
  } catch (error) {
    console.error('Failed to update Apache port:', error);
    return false;
  }
}

export function updateMysqlPort(newPort: number): boolean {
  try {
    const configPath = path.join(configDir, 'mysql', 'my.cnf');
    if (!fs.existsSync(configPath)) return false;

    let content = fs.readFileSync(configPath, 'utf8');
    // Replace port = 3307 with port = newPort
    content = content.replace(/port\s*=\s*\d+/g, `port = ${newPort}`);

    fs.writeFileSync(configPath, content, 'utf8');
    return true;
  } catch (error) {
    console.error('Failed to update MySQL port:', error);
    return false;
  }
}
