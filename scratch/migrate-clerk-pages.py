import os
import re

directories_to_scan = [
    'frontend/src/app'
]
exclude_dirs = ['api', 'actions']

def process_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    original_content = content

    # 1. Replace imports
    content = content.replace(
        "import { auth } from '@/auth';", 
        "import { auth, currentUser } from '@clerk/nextjs/server';"
    )

    # 2. Replace session auth
    content = re.sub(
        r'const session = await auth\(\);\s*if \(!session\?\.user\) \{',
        'const { userId } = await auth();\n    if (!userId) {',
        content
    )
    content = re.sub(
        r'const session = await auth\(\);\s*if \(!session\?\.user\?\.id\) \{',
        'const { userId } = await auth();\n    if (!userId) {',
        content
    )
    content = re.sub(
        r'const session = await auth\(\);',
        'const { userId } = await auth();\n  const user = await currentUser();',
        content
    )
    content = re.sub(
        r'session\.user\.id',
        'userId',
        content
    )
    content = re.sub(
        r'session\?\.user\?\.id',
        'userId',
        content
    )
    content = re.sub(
        r'session\?\.user\?\.name',
        'user?.firstName',
        content
    )
    content = re.sub(
        r'session\?\.user\?\.email',
        'user?.emailAddresses[0]?.emailAddress',
        content
    )
    content = re.sub(
        r'session\?\.user\?\.image',
        'user?.imageUrl',
        content
    )

    if content != original_content:
        with open(filepath, 'w') as f:
            f.write(content)
        print(f'Updated {filepath}')

for directory in directories_to_scan:
    for root, dirs, files in os.walk(directory):
        # Exclude directories
        dirs[:] = [d for d in dirs if d not in exclude_dirs]
        for file in files:
            if file.endswith('.ts') or file.endswith('.tsx'):
                process_file(os.path.join(root, file))

print("Done scanning and replacing pages.")
