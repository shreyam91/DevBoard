import os
import re

directories_to_scan = [
    'frontend/src/app/api',
    'frontend/src/app/actions'
]

def process_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    original_content = content

    # 1. Replace imports
    content = content.replace(
        "import { auth } from '@/auth';", 
        "import { auth } from '@clerk/nextjs/server';\nimport { getGithubToken } from '@devboard/shared/src/utils/auth';"
    )

    # 2. Replace session auth
    content = re.sub(
        r'const session = await auth\(\);\s*if \(!session\?\.user\?\.id\) \{',
        'const { userId } = await auth();\n    if (!userId) {',
        content
    )
    content = re.sub(
        r'session\.user\.id',
        'userId',
        content
    )

    # 3. Replace token fetching
    # Find block like:
    # const dbAccount = await prisma.account.findFirst({...});
    db_account_pattern = r'const dbAccount = await prisma\.account\.findFirst\(\{[\s\S]*?\}\);'
    
    # We replace it with fetching the token
    content = re.sub(
        db_account_pattern,
        'const github_access_token = await getGithubToken(userId);',
        content
    )

    # 4. Replace validation
    content = re.sub(
        r'if \(!dbAccount\?\.access_token\) \{',
        'if (!github_access_token) {',
        content
    )
    
    # 5. Replace token assignment if it exists
    content = re.sub(
        r'const github_access_token = dbAccount\.access_token;',
        '',
        content
    )
    content = re.sub(
        r'const token = dbAccount\?\.access_token;',
        'const token = github_access_token;',
        content
    )
    content = re.sub(
        r'const token = dbAccount\.access_token;',
        'const token = github_access_token;',
        content
    )
    
    content = content.replace('dbAccount.access_token', 'github_access_token')

    if content != original_content:
        with open(filepath, 'w') as f:
            f.write(content)
        print(f'Updated {filepath}')

for directory in directories_to_scan:
    for root, _, files in os.walk(directory):
        for file in files:
            if file.endswith('.ts') or file.endswith('.tsx'):
                process_file(os.path.join(root, file))

print("Done scanning and replacing API routes.")
