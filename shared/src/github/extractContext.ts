export type ArchaeologyContext = {
  detected_languages: Record<string, number>;
  detected_frameworks: Record<string, string>;
  detected_infra: string[];
  commit_history_summary: {
    first_commit_date: string | null;
    last_commit_date: string | null;
    total_commits_sample: number;
  };
  readme_summary: string;
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

async function fetchFileContent(fullName: string, path: string, token: string): Promise<string | null> {
  const data = await fetchGitHub(`https://api.github.com/repos/${fullName}/contents/${path}`, token);
  if (!data || !data.content) return null;
  return Buffer.from(data.content, 'base64').toString('utf-8');
}

export async function extractArchaeologyContext(fullName: string, token: string): Promise<ArchaeologyContext> {
  // 1. Languages
  const languages = await fetchGitHub(`https://api.github.com/repos/${fullName}/languages`, token) || {};

  // 2. Commits
  const commits = await fetchGitHub(`https://api.github.com/repos/${fullName}/commits?per_page=100`, token) || [];
  let first_commit_date = null;
  let last_commit_date = null;
  if (commits.length > 0) {
    last_commit_date = commits[0].commit.author.date;
    first_commit_date = commits[commits.length - 1].commit.author.date;
  }

  // 3. package.json for frameworks
  const packageJsonStr = await fetchFileContent(fullName, 'package.json', token);
  let detected_frameworks = {};
  if (packageJsonStr) {
    try {
      const pkg = JSON.parse(packageJsonStr);
      detected_frameworks = { ...pkg.dependencies, ...pkg.devDependencies };
    } catch {
      console.warn('Failed to parse package.json');
    }
  }

  // 4. Infra files
  const detected_infra: string[] = [];
  const dockerfile = await fetchFileContent(fullName, 'Dockerfile', token);
  if (dockerfile) detected_infra.push('Dockerfile');
  
  const dockerCompose = await fetchFileContent(fullName, 'docker-compose.yml', token);
  if (dockerCompose) detected_infra.push('docker-compose.yml');

  // 5. README
  let readme_summary = '';
  const readmeStr = await fetchFileContent(fullName, 'README.md', token);
  if (readmeStr) {
    readme_summary = readmeStr.substring(0, 500);
  }

  return {
    detected_languages: languages,
    detected_frameworks,
    detected_infra,
    commit_history_summary: {
      first_commit_date,
      last_commit_date,
      total_commits_sample: commits.length,
    },
    readme_summary,
  };
}
