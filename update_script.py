import os
import re

with open('teachable_vs_patreon_long.txt', 'r') as f:
    long_content = f.read()

with open('prisma/seed.ts', 'r') as f:
    seed = f.read()

# Escape for JavaScript template literal
escaped_content = long_content.replace('\\', '\\\\').replace('`', '\\`').replace('$', '\\$').replace('\n', '\\n')

if 'slug: "teachable-vs-patreon"' in seed:
    # Use non-greedy match for content
    pattern = r'(slug: "teachable-vs-patreon".*?content: `)(.*?)(\`,)'
    new_seed = re.sub(pattern, r'\g<1>' + escaped_content + r'\g<3>', seed, flags=re.DOTALL)
    with open('prisma/seed.ts', 'w') as f:
        f.write(new_seed)
    print('Updated Teachable vs Patreon content successfully.')
else:
    print('Teachable vs Patreon slug not found in seed.ts')
