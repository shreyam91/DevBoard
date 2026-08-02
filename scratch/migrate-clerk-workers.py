import os
import re

directories_to_scan = [
    'backend/src/workers'
]

def process_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    original_content = content

    # Add import if missing
    if 'getGithubToken' not in content:
        content = "import { getGithubToken } from '@devboard/shared/src/utils/auth';\n" + content

    # Replace token fetch
    content = re.sub(
        r"const token = repo\.user\.github_access_token \|\| repo\.user\.accounts\.find\(a => a\.provider === 'github'\)\?\.access_token;",
        'const token = await getGithubToken(repo.user_id);',
        content
    )
    content = re.sub(
        r"repo\.user\.github_access_token,",
        'await getGithubToken(repo.user_id),',
        content
    )

    # For repoSyncWorker.ts where it finds the account manually
    #   const dbAccount = await prisma.account.findFirst({
    #      where: { userId: repo.user_id, provider: 'github' },
    #      select: { access_token: true }
    #    });
    #    if (!dbAccount?.access_token) { ... }
    #    const token = dbAccount.access_token;
    db_account_pattern = r'const dbAccount = await prisma\.account\.findFirst\(\{[\s\S]*?\}\);'
    
    # We replace it with fetching the token
    content = re.sub(
        db_account_pattern,
        'const github_access_token = await getGithubToken(repo.user_id);',
        content
    )

    content = re.sub(
        r'if \(!dbAccount\?\.access_token\) \{',
        'if (!github_access_token) {',
        content
    )
    
    content = re.sub(
        r'const token = dbAccount\.access_token;',
        'const token = github_access_token;',
        content
    )
    content = re.sub(
        r'const github_access_token = dbAccount\.access_token;',
        '',
        content
    )

    if content != original_content:
        with open(filepath, 'w') as f:
            f.write(content)
        print(f'Updated {filepath}')

for directory in directories_to_scan:
    for root, _, files in os.walk(directory):
        for file in files:
            if file.endswith('.ts') or file.endswith('.tsx'):
                process_file(os.path.join(root, file))

print("Done scanning and replacing workers.")
