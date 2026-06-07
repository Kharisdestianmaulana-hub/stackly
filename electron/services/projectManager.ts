import * as fs from 'fs';
import * as path from 'path';
import { app, shell } from 'electron';
import { exec } from 'child_process';

import { getResolvedHtdocsPath } from './processManager';

const IGNORED_FOLDERS = ['phpmyadmin', '.DS_Store', '.git'];

export interface ProjectInfo {
  name: string;
  size: string;
  modifiedAt: number;
}

function getHtdocsPath(): string {
  return getResolvedHtdocsPath();
}

function formatBytes(bytes: number, decimals = 2) {
  if (!+bytes) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

// Very basic recursive size calculation (can be slow for huge directories, but fine for local web dev)
function getFolderSize(dirPath: string): number {
  let size = 0;
  try {
    const files = fs.readdirSync(dirPath);
    for (let i = 0; i < files.length; i++) {
      const filePath = path.join(dirPath, files[i]);
      const stats = fs.statSync(filePath);
      if (stats.isDirectory()) {
        size += getFolderSize(filePath);
      } else {
        size += stats.size;
      }
    }
  } catch (e) {
    return 0;
  }
  return size;
}

export async function getProjects(): Promise<ProjectInfo[]> {
  const htdocs = getHtdocsPath();
  const projects: ProjectInfo[] = [];

  if (!fs.existsSync(htdocs)) {
    return projects;
  }

  const items = fs.readdirSync(htdocs);

  for (const item of items) {
    if (IGNORED_FOLDERS.includes(item)) continue;

    const itemPath = path.join(htdocs, item);
    const stats = fs.statSync(itemPath);

    if (stats.isDirectory()) {
      projects.push({
        name: item,
        size: formatBytes(getFolderSize(itemPath)),
        modifiedAt: stats.mtimeMs,
      });
    }
  }

  // Sort by modified date descending
  return projects.sort((a, b) => b.modifiedAt - a.modifiedAt);
}

export async function createProject(name: string): Promise<boolean> {
  const safeName = name.replace(/[^a-zA-Z0-9-_]/g, '-').toLowerCase();
  if (!safeName) return false;

  const projectPath = path.join(getHtdocsPath(), safeName);
  
  if (fs.existsSync(projectPath)) {
    return false;
  }

  try {
    fs.mkdirSync(projectPath, { recursive: true });
    
    // Create an initial index.php
    const indexContent = `<?php\n// Stackly Project: ${safeName}\necho "Welcome to your new Stackly project: <b>${safeName}</b>!";\n?>`;
    fs.writeFileSync(path.join(projectPath, 'index.php'), indexContent);
    return true;
  } catch (error) {
    return false;
  }
}

export async function deleteProject(name: string): Promise<boolean> {
  const projectPath = path.join(getHtdocsPath(), name);
  
  if (!fs.existsSync(projectPath)) {
    return false;
  }

  try {
    fs.rmSync(projectPath, { recursive: true, force: true });
    return true;
  } catch (error) {
    return false;
  }
}

export async function openProjectInEditor(name: string): Promise<boolean> {
  const projectPath = path.join(getHtdocsPath(), name);
  
  if (!fs.existsSync(projectPath)) {
    return false;
  }

  return new Promise((resolve) => {
    // Try VS Code first
    exec(`code "${projectPath}"`, (error) => {
      if (error) {
        // Fallback to default file explorer (Finder/Explorer)
        shell.openPath(projectPath);
        resolve(true);
      } else {
        resolve(true);
      }
    });
  });
}

export async function openProjectFolder(name: string): Promise<boolean> {
  const projectPath = path.join(getHtdocsPath(), name);
  if (fs.existsSync(projectPath)) {
    shell.openPath(projectPath);
    return true;
  }
  return false;
}

export async function renameProject(oldName: string, newName: string): Promise<boolean> {
  const safeNewName = newName.replace(/[^a-zA-Z0-9-_]/g, '-').toLowerCase();
  const oldPath = path.join(getHtdocsPath(), oldName);
  const newPath = path.join(getHtdocsPath(), safeNewName);

  if (!fs.existsSync(oldPath) || fs.existsSync(newPath)) {
    return false;
  }

  try {
    fs.renameSync(oldPath, newPath);
    return true;
  } catch (err) {
    return false;
  }
}

export async function duplicateProject(name: string, newName: string): Promise<boolean> {
  const safeNewName = newName.replace(/[^a-zA-Z0-9-_]/g, '-').toLowerCase();
  const srcPath = path.join(getHtdocsPath(), name);
  const destPath = path.join(getHtdocsPath(), safeNewName);

  if (!fs.existsSync(srcPath) || fs.existsSync(destPath)) {
    return false;
  }

  try {
    fs.cpSync(srcPath, destPath, { recursive: true });
    return true;
  } catch (err) {
    return false;
  }
}

import { createDatabase } from './dbAdmin';

export async function createBoilerplateProject(name: string, type: 'blank' | 'wordpress' | 'laravel'): Promise<{success: boolean, message?: string}> {
  const safeName = name.replace(/[^a-zA-Z0-9-_]/g, '-').toLowerCase();
  if (!safeName) return { success: false, message: 'Invalid project name' };

  const projectPath = path.join(getHtdocsPath(), safeName);
  
  if (fs.existsSync(projectPath)) {
    return { success: false, message: 'Project folder already exists' };
  }

  try {
    fs.mkdirSync(projectPath, { recursive: true });

    if (type === 'blank') {
      const indexContent = `<?php\n// Stackly Project: ${safeName}\necho "Welcome to your new Stackly project: <b>${safeName}</b>!";\n?>`;
      fs.writeFileSync(path.join(projectPath, 'index.php'), indexContent);
      return { success: true };
    } 
    
    if (type === 'wordpress') {
      return new Promise(async (resolve) => {
        // Auto-link database
        await createDatabase(safeName.replace(/[^a-zA-Z0-9_]/g, ''));
        
        const cmd = `curl -sS -L -o "/tmp/wp-${safeName}.zip" https://wordpress.org/latest.zip && unzip -q "/tmp/wp-${safeName}.zip" -d "/tmp/wp-${safeName}-ext" && mv /tmp/wp-${safeName}-ext/wordpress/* "${projectPath}/" && rm -rf "/tmp/wp-${safeName}.zip" "/tmp/wp-${safeName}-ext"`;
        exec(cmd, (error) => {
          if (error) {
            resolve({ success: false, message: 'Failed to download or extract WordPress' });
          } else {
            // Write a wp-config.php automatically? Maybe just let user configure it on screen since there are salts needed.
            // But we created the DB!
            resolve({ success: true });
          }
        });
      });
    }

    if (type === 'laravel') {
      return new Promise(async (resolve) => {
        // Auto-link database
        const dbName = safeName.replace(/[^a-zA-Z0-9_]/g, '');
        await createDatabase(dbName);

        // Find bundled PHP or use system PHP
        const basePath = app.isPackaged ? process.resourcesPath : app.getAppPath();
        const phpBin = path.join(basePath, 'runtime', 'php', 'bin', 'php');
        
        const cmd = `cd "${projectPath}" && curl -sS https://getcomposer.org/installer | "${phpBin}" && "${phpBin}" composer.phar create-project --prefer-dist laravel/laravel laravel-temp && mv laravel-temp/* ./ && mv laravel-temp/.* ./ 2>/dev/null || true && rm -rf laravel-temp composer.phar`;
        
        exec(cmd, { maxBuffer: 1024 * 1024 * 10 }, (error, stdout, stderr) => {
          if (error) {
            resolve({ success: false, message: 'Failed to install Laravel. Please check your internet connection.' });
          } else {
            // Auto-configure .env for Laravel
            try {
              const envPath = path.join(projectPath, '.env');
              if (fs.existsSync(envPath)) {
                let envContent = fs.readFileSync(envPath, 'utf8');
                envContent = envContent.replace(/DB_DATABASE=laravel/, `DB_DATABASE=${dbName}`);
                envContent = envContent.replace(/DB_PORT=3306/, `DB_PORT=3307`); // Stackly defaults to 3307 for now
                fs.writeFileSync(envPath, envContent);
              }
            } catch (e) {}
            resolve({ success: true });
          }
        });
      });
    }

    return { success: false, message: 'Unknown type' };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function importProjectZip(zipPath: string): Promise<{success: boolean, message?: string}> {
  if (!fs.existsSync(zipPath)) return { success: false, message: 'Zip file not found' };
  
  // Extract name from zip
  const baseName = path.basename(zipPath, '.zip');
  const safeName = baseName.replace(/[^a-zA-Z0-9-_]/g, '-').toLowerCase();
  
  // Create unique folder
  let targetName = safeName;
  let counter = 1;
  while (fs.existsSync(path.join(getHtdocsPath(), targetName))) {
    targetName = `${safeName}-${counter}`;
    counter++;
  }

  const destPath = path.join(getHtdocsPath(), targetName);
  
  return new Promise((resolve) => {
    exec(`unzip -q "${zipPath}" -d "${destPath}"`, (error) => {
      if (error) {
        resolve({ success: false, message: 'Failed to extract zip file' });
      } else {
        // Check if there is a single folder inside the extracted folder. If so, move its contents up.
        // Many zips from github/wordpress have a single root folder.
        try {
          const items = fs.readdirSync(destPath);
          if (items.length === 1 && fs.statSync(path.join(destPath, items[0])).isDirectory()) {
            const innerDir = path.join(destPath, items[0]);
            exec(`mv "${innerDir}"/* "${destPath}/" && mv "${innerDir}"/.* "${destPath}/" 2>/dev/null || true && rm -rf "${innerDir}"`);
          }
        } catch (e) {
          // ignore
        }
        resolve({ success: true });
      }
    });
  });
}

export async function exportProjectZip(projectName: string, destPath: string): Promise<{success: boolean, message?: string}> {
  const projectPath = path.join(getHtdocsPath(), projectName);
  if (!fs.existsSync(projectPath)) return { success: false, message: 'Project not found' };

  return new Promise((resolve) => {
    // We zip the contents, not the folder itself, or we zip the folder itself.
    // Usually, cd into the folder and zip -r works best so it extracts cleanly.
    // Actually, cd into htdocs and zip -r dest projectDir is best.
    exec(`cd "${getHtdocsPath()}" && zip -qr "${destPath}" "${projectName}"`, (error) => {
      if (error) {
        resolve({ success: false, message: 'Failed to create zip file' });
      } else {
        resolve({ success: true });
      }
    });
  });
}
