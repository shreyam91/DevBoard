export async function commitFile(
  repoFullName: string,
  filePath: string,
  content: string,
  commitMessage: string,
  accessToken: string
) {
  const url = `https://api.github.com/repos/${repoFullName}/contents/${filePath}`;
  
  // 1. Get current file SHA if it exists
  let sha: string | undefined;
  try {
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/vnd.github.v3+json',
      }
    });
    if (res.ok) {
      const data = await res.json();
      sha = data.sha;
    }
  } catch (e) {
    // File might not exist, which is fine
    console.warn('Error checking if file exists', e);
  }

  // 2. Put the new content
  const putRes = await fetch(url, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: commitMessage,
      content: Buffer.from(content).toString('base64'),
      sha, // included if file existed to overwrite
    }),
  });

  if (!putRes.ok) {
    throw new Error(`Failed to commit file: ${await putRes.text()}`);
  }

  return await putRes.json();
}
