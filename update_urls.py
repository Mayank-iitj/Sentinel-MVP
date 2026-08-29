import os
import re

api_pattern = re.compile(r"(['\"])(http://localhost:8000)(.*?)(\1)")
ws_pattern = re.compile(r"(['\"])(ws://localhost:8000)(.*?)(\1)")

def replace_urls(match, is_ws=False):
    env_var = "NEXT_PUBLIC_WS_URL" if is_ws else "NEXT_PUBLIC_API_URL"
    default_url = "ws://localhost:8000" if is_ws else "http://localhost:8000"
    path = match.group(3)
    return f"`${{{env_var} || '{default_url}'}}{path}`"

for root, _, files in os.walk('frontend/src'):
    for file in files:
        if file.endswith('.tsx') or file.endswith('.ts'):
            filepath = os.path.join(root, file)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            
            new_content = api_pattern.sub(lambda m: replace_urls(m, False), content)
            new_content = ws_pattern.sub(lambda m: replace_urls(m, True), new_content)
            
            # Special case for template literals with variables, e.g. `http://localhost:8000/api/v1/incidents/${incidentId}`
            # The regex won't match the closing quote properly if it was a backtick to begin with, but wait, the regex matches any quote type including backticks.
            # Let's do a simpler string replace for backticks.
            new_content = new_content.replace("`http://localhost:8000", "`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}")
            new_content = new_content.replace("`ws://localhost:8000", "`${process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000'}")
            
            if new_content != content:
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                print(f"Updated {filepath}")
