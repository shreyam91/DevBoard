import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import util from 'util';
import crypto from 'crypto';

const execAsync = util.promisify(exec);

export type ArchaeologyContext = {
  detected_languages: Record<string, number>;
  detected_frameworks: Record<string, string>;
  detected_infra: string[];
  commit_history_summary: {
    first_commit_date: string | null;
    last_commit_date: string | null;
    total_commits_sample: number;
    recent_messages: string[];
  };
  readme_summary: string;
  folder_structure: string;
};

async function fetchGitHub(url: string, token: string) {
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github.v3+json',
    }
  });
  if (!res.ok) {
    if (res.status === 404) return null;
    throw new Error(`GitHub API error: ${res.statusText}`);
  }
  return res.json();
}

export async function extractArchaeologyContext(fullName: string, token: string): Promise<ArchaeologyContext> {
  const cloneDir = path.join('/tmp', `repo-${crypto.randomUUID()}`);
  
  try {
    // 1. Shallow clone the repository
    const authUrl = `https://oauth2:${token}@github.com/${fullName}.git`;
    console.log(`Cloning ${fullName} to ${cloneDir}...`);
    await execAsync(`git clone --depth 50 ${authUrl} ${cloneDir}`);

    // 2. Languages via API (faster than local analysis)
    const languages = await fetchGitHub(`https://api.github.com/repos/${fullName}/languages`, token) || {};

    // 3. Git History
    const { stdout: gitLog } = await execAsync(`git log --pretty=format:"%ad|%s" --date=iso`, { cwd: cloneDir });
    const logLines = gitLog.split('\n').filter(Boolean);
    
    let first_commit_date = null;
    let last_commit_date = null;
    const recent_messages: string[] = [];

    if (logLines.length > 0) {
      last_commit_date = logLines[0].split('|')[0];
      first_commit_date = logLines[logLines.length - 1].split('|')[0];
      recent_messages.push(...logLines.slice(0, 10).map(l => l.split('|')[1]));
    }

    // 4. Frameworks (package.json)
    let detected_frameworks = {};
    const pkgPath = path.join(cloneDir, 'package.json');
    if (fs.existsSync(pkgPath)) {
      try {
        const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
        detected_frameworks = { ...pkg.dependencies, ...pkg.devDependencies };
      } catch {}
    }

    // 5. Infra and Config Files
    const detected_infra: string[] = [];
    const checkFiles = [
      'Dockerfile', 'docker-compose.yml', 'tsconfig.json', 
      'next.config.js', 'next.config.mjs', 'prisma/schema.prisma',
      'schema.prisma', '.github/workflows'
    ];
    
    for (const file of checkFiles) {
      if (fs.existsSync(path.join(cloneDir, file))) {
        detected_infra.push(file);
      }
    }

    // 6. Folder structure
    const { stdout: treeOut } = await execAsync(`find . -maxdepth 2 -type d | grep -v ".git" | head -n 20`, { cwd: cloneDir }).catch(() => ({ stdout: '' }));
    
    // 7. README
    let readme_summary = '';
    const readmePath = path.join(cloneDir, 'README.md');
    if (fs.existsSync(readmePath)) {
      const content = fs.readFileSync(readmePath, 'utf-8');
      readme_summary = content.substring(0, 1000);
    }

    return {
      detected_languages: languages,
      detected_frameworks,
      detected_infra,
      commit_history_summary: {
        first_commit_date,
        last_commit_date,
        total_commits_sample: logLines.length,
        recent_messages
      },
      readme_summary,
      folder_structure: treeOut
    };
  } finally {
    // Cleanup
    if (fs.existsSync(cloneDir)) {
      await execAsync(`rm -rf ${cloneDir}`);
    }
  }
}
